import { IApiError, IApiResponse } from '@/api/client.api';

export function isApiResponse<T>(
  response: IApiResponse<T> | IApiError
): response is IApiResponse<T> {
  return (response as IApiResponse<T>).success !== undefined;
}
