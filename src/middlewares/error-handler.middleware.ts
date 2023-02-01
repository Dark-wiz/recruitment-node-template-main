import { UnprocessableEntityError, NotFoundError, ConflictError, UnauthorizedError, BadGatewayError } from "errors/errors";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function handleErrorMiddleware(error: Error, _: Request, res: Response, next: NextFunction): void {
  const { message } = error;

  switch (true) {
    case error instanceof UnprocessableEntityError:
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ name: "UnprocessableEntityError", message });
      break;
    case error instanceof NotFoundError:
      res.status(StatusCodes.NOT_FOUND).send({ name: "NotFoundError", message });
      break;
    case error instanceof ConflictError:
      res.status(StatusCodes.CONFLICT).send({ name: "ConflictError", message });
      break;
    case error instanceof UnauthorizedError:
      res.status(StatusCodes.UNAUTHORIZED).send({ name: "UnauthorizedError", message });
      break;
    case error instanceof BadGatewayError:
      res.status(StatusCodes.BAD_GATEWAY).send({ name: "BadGatewayError", message });
      break;
    default:
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }

  next();
}
