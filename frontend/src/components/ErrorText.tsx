import { ApiError } from "../api/client";

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function ErrorText({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-accent-purple text-sm">
      {message}
    </p>
  );
}
