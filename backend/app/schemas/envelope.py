"""Shared response envelopes. Every route uses one of these as its response_model."""

from typing import Annotated, Generic, TypeVar

from fastapi import Depends, Query
from pydantic import BaseModel

T = TypeVar("T")


class ErrorBody(BaseModel):
    code: str
    message: str
    details: dict = {}


class Envelope(BaseModel, Generic[T]):
    data: T | None = None
    error: ErrorBody | None = None


class PageMeta(BaseModel):
    page: int
    page_size: int
    total: int


class PaginatedEnvelope(BaseModel, Generic[T]):
    data: list[T]
    error: ErrorBody | None = None
    meta: PageMeta


class PageParams(BaseModel):
    page: int
    page_size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def page_params(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PageParams:
    return PageParams(page=page, page_size=page_size)


Pagination = Annotated[PageParams, Depends(page_params)]


def ok(data: T) -> Envelope[T]:
    return Envelope[T](data=data)


def paginated(items: list[T], params: PageParams, total: int) -> PaginatedEnvelope[T]:
    return PaginatedEnvelope[T](
        data=items,
        meta=PageMeta(page=params.page, page_size=params.page_size, total=total),
    )
