class ApiResponse {
  success: boolean;

  constructor(
    private statusCode: number,
    private data: any,
    private message = 'Success'
  ) {
    this.success = statusCode < 400;
    return this;
  }
}

export { ApiResponse };
