import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string> | null;
}

export function apiSuccess<T>(
  message: string,
  data: T,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      errors: null,
    },
    { status },
  );
}

export function apiError<T = null>(
  message: string,
  status: number,
  errors: Record<string, string> | null = null,
  data: T | null = null,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: false,
      message,
      data,
      errors,
    },
    { status },
  );
}
