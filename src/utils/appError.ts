export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (err: any) => {
  if (err.isOperational) {
    return {
      status: err.status,
      message: err.message
    };
  }

  // Programmatic error
  console.error('ERROR 💥', err);
  return {
    status: 'error',
    message: 'Something went wrong!'
  };
}; 