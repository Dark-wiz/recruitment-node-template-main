import { UnprocessableEntityError, NotFoundError, ConflictError } from "errors/errors";
import { NextFunction, Request, Response } from "express";

export function handleErrorMiddleware(error: Error, _: Request, res: Response, next: NextFunction): void {
  const { message } = error;

  switch (true) {
    case (error instanceof UnprocessableEntityError):
    res.status(422).send({ name: "UnprocessableEntityError", message });
    break;
    case (error instanceof NotFoundError):
    res.status(404).send({ name: "NotFoundError", message });
    break;
    case (error instanceof ConflictError):
    res.status(409).send({ name: "ConflictError", message });
    break;
    default:
    res.status(500).send({ message: "Internal Server Error" });
    }

  next();
}
