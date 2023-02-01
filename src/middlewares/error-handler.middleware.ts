import { HttpStatusCode } from "axios";
import { UnprocessableEntityError, NotFoundError, ConflictError, UnauthorizedError, BadGatewayError } from "errors/errors";
import { NextFunction, Request, Response } from "express";

export function handleErrorMiddleware(error: Error, _: Request, res: Response, next: NextFunction): void {
  const { message } = error;

  switch (true) {
    case error instanceof UnprocessableEntityError:
      res.status(HttpStatusCode.UnprocessableEntity).send({ name: "UnprocessableEntityError", message });
      break;
    case error instanceof NotFoundError:
      res.status(HttpStatusCode.NotFound).send({ name: "NotFoundError", message });
      break;
    case error instanceof ConflictError:
      res.status(HttpStatusCode.Conflict).send({ name: "ConflictError", message });
      break;
    case error instanceof UnauthorizedError:
      res.status(HttpStatusCode.Unauthorized).send({ name: "UnauthorizedError", message });
      break;
    case error instanceof BadGatewayError:
      res.status(HttpStatusCode.BadGateway).send({ name: "BadGatewayError", message });
      break;
    default:
      res.status(HttpStatusCode.InternalServerError).send({ message: "Internal Server Error" });
  }

  next();
}
