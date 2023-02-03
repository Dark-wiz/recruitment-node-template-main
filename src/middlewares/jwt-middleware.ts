import { AccessToken } from "modules/auth/entities/access-token.entity";
import { Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { JwtPayload, verify } from "jsonwebtoken";
import config from "config/config";
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "axios";

export class JwtMiddleware {
  private readonly accessTokenRepository: Repository<AccessToken>;
  constructor() {
    this.accessTokenRepository = dataSource.getRepository(AccessToken);
  }

  public async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
    const token = req.body.token || req.query.token || req.headers["token"];
    const tokenUserId = req.body.userId || req.query.userId || req.headers["userId"];
    const tokenUserEmail = req.body.userEmail || req.query.userEmail || req.headers["userEmail"];
    if (!token) {
      return res.status(HttpStatusCode.Unauthorized).send({ name: "UnauthorizedError", message: "Please pass jwt" });
    }
    const userId = this.getUserId(token);
    const userEmail = this.getUserEmail(token);
    if (!userId) {
      return res.status(HttpStatusCode.Unauthorized).send({ name: "UnauthorizedError", message: "Please pass valid jwt" });
    } else if (tokenUserId != null && tokenUserId != userId) {
      return res.status(HttpStatusCode.Unauthorized).send({ name: "UnauthorizedError", message: "Please pass valid jwt" });
    } else if (tokenUserEmail != null && tokenUserEmail != userEmail) {
      return res.status(HttpStatusCode.Unauthorized).send({ name: "UnauthorizedError", message: "Please pass valid jwt" });
    }

    const lastRecord = await this.accessTokenRepository
      .createQueryBuilder("access_token")
      .where("access_token.userId = :userId", { userId })
      .andWhere("access_token.token = :token", { token })
      .orderBy("access_token.createdAt", "DESC")
      .getOne();

    const currentTime = new Date();

    if (!lastRecord || currentTime > lastRecord.expiresAt) {
      return res.status(HttpStatusCode.Unauthorized).send({ name: "UnauthorizedError", message: "Invalid jwt, please re login" });
    }
    next();
    } catch (error) {
      return res.status(HttpStatusCode.Unauthorized).send({ name: "UnauthorizedError", message: error });
    }
  }

  public getUserId(token: string): string {
    const tokenValue = this.decodedToken(token);
    return (tokenValue as JwtPayload).id;
  }

  public getUserEmail(token: string): string {
    const tokenValue = this.decodedToken(token);
    return (tokenValue as JwtPayload).email;
  }

  private decodedToken(token: string) {
    const decodedToken = verify(token, config.JWT_SECRET);
    return decodedToken;
  }
}
