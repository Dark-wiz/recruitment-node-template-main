import config from "config/config";
import { Express } from "express";
import http from "http";
import { CreateUserDto } from "modules/users/dto/create-user.dto";
import { UsersService } from "modules/users/users.service";
import ds from "orm/orm.config";
import * as supertest from "supertest";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import { LoginUserDto } from "../dto/login-user.dto";
import { AccessToken } from "../entities/access-token.entity";
import { HttpStatusCode } from "axios";

describe("AuthController", () => {
  let app: Express;
  let agent: supertest.SuperAgentTest;
  let server: http.Server;

  let usersService: UsersService;

  beforeAll(() => {
    app = setupServer();
    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    await ds.initialize();
    agent = supertest.agent(app);

    usersService = new UsersService();
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe("POST /auth", () => {
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password", address: "famagusta, cyprus" };

    it("should login existing user", async () => {
      await createUser(createUserDto);

      const res = await agent.post("/api/v1/auth/login").send(loginDto);
      const { token } = res.body as AccessToken;

      expect(res.statusCode).toBe(HttpStatusCode.Created);
      expect(token).toBeDefined();
    });

    it("should throw UnprocessableEntityError when user logs in with invalid email", async () => {
      const res = await agent.post("/api/v1/auth/login").send({ email: "invalidEmail", password: "pwd" });

      expect(res.statusCode).toBe(HttpStatusCode.UnprocessableEntity);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "Invalid user email or password",
      });
    });

    it("should throw UnprocessableEntityError when user logs in with invalid password", async () => {
      await createUser(createUserDto);

      const res = await agent.post("/api/v1/auth/login").send({ email: loginDto.email, password: "invalidPassword" });

      expect(res.statusCode).toBe(HttpStatusCode.UnprocessableEntity);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "Invalid user email or password",
      });
    });
  });
});
