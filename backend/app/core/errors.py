"""Contract error handling. Overrides FastAPI defaults so every error uses the envelope."""

from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

logger = get_logger("errors")

STATUS_BY_CODE = {
    "VALIDATION_ERROR": 400,
    "UNAUTHENTICATED": 401,
    "FORBIDDEN": 403,
    "NOT_FOUND": 404,
    "METHOD_NOT_ALLOWED": 405,
    "CONFLICT": 409,
    "INTERNAL_ERROR": 500,
}
CODE_BY_STATUS = {status: code for code, status in STATUS_BY_CODE.items()}


class ApiError(Exception):
    """Raise from services or dependencies to return a contract error."""

    def __init__(self, code: str, message: str, details: dict[str, Any] | None = None):
        if code not in STATUS_BY_CODE:
            raise ValueError(f"Unknown error code: {code}")
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details or {}


def error_response(code: str, message: str, details: dict[str, Any] | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=STATUS_BY_CODE[code],
        content={"data": None, "error": {"code": code, "message": message, "details": details or {}}},
    )


async def _api_error(_: Request, exc: ApiError) -> JSONResponse:
    return error_response(exc.code, exc.message, exc.details)


async def _validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    fields: dict[str, str] = {}
    for err in exc.errors():
        loc = [str(part) for part in err.get("loc", ()) if part not in ("body", "query", "path")]
        fields[".".join(loc) or "request"] = err.get("msg", "Invalid value")
    return error_response("VALIDATION_ERROR", "Request validation failed", {"fields": fields})


async def _http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = CODE_BY_STATUS.get(exc.status_code, "INTERNAL_ERROR")
    message = exc.detail if isinstance(exc.detail, str) else code.replace("_", " ").capitalize()
    return error_response(code, message)


async def _unhandled_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path, exc_info=exc)
    return error_response("INTERNAL_ERROR", "Something went wrong")


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ApiError, _api_error)
    app.add_exception_handler(RequestValidationError, _validation_error)
    app.add_exception_handler(StarletteHTTPException, _http_error)
    app.add_exception_handler(Exception, _unhandled_error)
