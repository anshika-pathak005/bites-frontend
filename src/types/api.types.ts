// Error detail returned by the backend when a request fails.
export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

// Every backend endpoint wraps its payload in this envelope, regardless of
// success or failure — check `success`/`error` before trusting `data`.
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: ApiError | null;
}

// Shape of `data` for any list endpoint that supports pagination.
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
