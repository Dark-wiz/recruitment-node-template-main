import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { HttpStatusCode } from "axios";
// import { FarmService } from "../farms.service";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { UsersService } from "modules/users/users.service";
// import { SortedFarm } from "../dto/sorted-farm.dto";
import { AuthService } from "modules/auth/auth.service";
import { LoginUserDto } from "modules/auth/dto/login-user.dto";
import { AccessToken } from "modules/auth/entities/access-token.entity";
import { CreateUserDto } from "modules/users/dto/create-user.dto";
import { FarmService } from "../farms.service";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  //   let farmService: FarmService;
  let userService: UsersService;
  let authService: AuthService;
  let farmService: FarmService;
  let jwt_value: AccessToken;
  let jwt_value_test: AccessToken;
  let test_farmId: string = "";

  beforeAll(async () => {
    app = setupServer();
    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    await ds.initialize();
    agent = supertest.agent(app);

    userService = new UsersService();
    authService = new AuthService();
    farmService = new FarmService();

    const createUserDto: CreateUserDto = { email: "user@mail.com", password: "password", address: "famagusta, cyprus" };

    const createAnotherUserDto: CreateUserDto = { email: "user2@mail.com", password: "password", address: "famagusta, cyprus" };

    const email = "user@mail.com";
    const password = "password";

    const email_test = "user2@mail.com";
    const password_test = "password";

    const createFarmDto: CreateFarmDto = {
      userEmail: email,
      name: "Users next farm ",
      address: "16 Evagoras Ave, Nicosia, Cyprus",
      size: 32,
      farm_yield: 645,
    };

    await userService.createUser(createUserDto);
    await userService.createUser(createAnotherUserDto);

    const farm = await farmService.createFarm(createFarmDto);
    test_farmId = farm.id;
    const loginDto: LoginUserDto = {
      email,
      password,
    };
    const newLoginDto: LoginUserDto = {
      email: email_test,
      password: password_test,
    };
    jwt_value = await authService.login(loginDto);
    jwt_value_test = await authService.login(newLoginDto);
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe(" /v1/farms", () => {
    const email = "user@mail.com";
    const createFarmDto: CreateFarmDto = {
      userEmail: email,
      name: "Users new farm",
      address: "5 Kyprianou St, Limassol, Cyprus",
      size: 20.1,
      farm_yield: 497,
    };

    it("should create new farm", async () => {
      const res = await agent.post("/api/v1/farms").send(createFarmDto).set("token", jwt_value.token);

      test_farmId = res.body.id;

      expect(res.statusCode).toBe(HttpStatusCode.Created);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        address: expect.any(String),
        distance_coordinate: expect.any(Number),
        duration_coordinate: expect.any(Number),
        size: expect.any(String),
        farm_yield: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should return sorted farm for user", async () => {
      const user = await userService.findOneBy({ email });
      const res = await agent
        .get("/api/v1/farms/sortedFarm")
        .query({
          userId: user?.id.toString(),
          page: 0,
          pageSize: 10,
          sortByName: "asc",
          sortByDate: "desc",
          sortByDistance: "asc",
        })
        .set("token", jwt_value.token);

      expect(res.body).toHaveLength(1);
      expect(res.statusCode).toBe(HttpStatusCode.Ok);
    });

    it("should return unauthorized error if jwt isn't passed for filtered farm", async () => {
      const user = await userService.findOneBy({ email });
      const res = await agent.get("/api/v1/farms/sortedFarm").query({
        userId: user?.id.toString(),
        page: 0,
        pageSize: 10,
        sortByName: "asc",
        sortByDate: "desc",
        sortByDistance: "asc",
      });
      expect(res.statusCode).toBe(HttpStatusCode.Unauthorized);
    });
    it("should return filtered users farms", async () => {
      const user = await userService.findOneBy({ email });
      const res = await agent
        .get("/api/v1/farms/filteredFarm")
        .query({
          userId: user?.id.toString(),
          page: 0,
          pageSize: 10,
          sortByName: "asc",
          sortByDate: "desc",
          sortByDistance: "asc",
          outliers: true,
        })
        .set("token", jwt_value.token);
      expect(res.body).toHaveLength(1);
      expect(res.statusCode).toBe(HttpStatusCode.Ok);
    });

    it("should return unauthorized error if jwt of another user is passed for filtered farm", async () => {
      const user = await userService.findOneBy({ email });
      const res = await agent
        .get("/api/v1/farms/filteredFarm")
        .query({
          userId: user?.id.toString(),
          page: 0,
          pageSize: 10,
          sortByName: "asc",
          sortByDate: "desc",
          sortByDistance: "asc",
          outliers: true,
        })
        .set("token", jwt_value_test.token);

      expect(res.statusCode).toBe(HttpStatusCode.Unauthorized);
    });
    it("should delete users farms", async () => {
      const user = await userService.findOneBy({ email });
      const res = await agent
        .delete("/api/v1/farms")
        .query({
          userId: user?.id.toString(),
          farmId: test_farmId,
        })
        .set("token", jwt_value.token);
      expect(res.statusCode).toBe(HttpStatusCode.Ok);
    });
    it("should not delete farm that doesn't belong to user", async () => {
      const user = await userService.findOneBy({ email });
      const res = await agent
        .delete(`/api/v1/farms?userId=${user?.id.toString()}&farmId=${test_farmId}`)
        .set("token", jwt_value_test.token);
      expect(res.statusCode).toBe(HttpStatusCode.Unauthorized);
    });
  });
});
