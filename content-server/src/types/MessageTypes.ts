type MessageResponse = {
  message: string;
  data?: unknown;
}

type ErrorResponse = MessageResponse & {
  stack?: string;
}

export {MessageResponse, ErrorResponse};
