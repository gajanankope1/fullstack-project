import { NextResponse } from "next/server";

import { ZodError } from "zod";

import { AppError } from "@/lib/errors/AppError";
import { ApiResponse } from "@/lib/api/response";

function formatZodErrors(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((accumulator, issue) => {
    const key = issue.path.join(".") || "form";
    accumulator[key] = issue.message;
    return accumulator;
  }, {});
}

export function handleControllerError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        data: null,
        errors: formatZodErrors(error),
      } satisfies ApiResponse<null>,
      { status: 422 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        data: null,
        errors: error.errors,
      } satisfies ApiResponse<null>,
      { status: error.statusCode },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Internal server error",
      data: null,
      errors: null,
    } satisfies ApiResponse<null>,
    { status: 500 },
  );
}
