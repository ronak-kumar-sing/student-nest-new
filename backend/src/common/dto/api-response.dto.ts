export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  error: null;
  timestamp: string;
  path: string;
}

export interface ApiErrorDetail {
  statusCode: number;
  message: string | string[];
  errorName?: string;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  error: {
    statusCode: number;
    message: string | string[];
    errorName?: string;
    timestamp: string;
    path: string;
  };
}
