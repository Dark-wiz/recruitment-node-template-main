import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase, distanceCalculator } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import { FarmService } from "../farms.service";
import { UsersService } from "modules/users/users.service";
import { CreateUserDto } from "modules/users/dto/create-user.dto";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { Farm } from "../entities/farm.entity";
import { LocationResponse } from "middlewares/dto/location-response.dto";
import { ConflictError, NotFoundError } from "errors/errors";
import { SortedFarm } from "../dto/sorted-farm.dto";
import { FilteredFarm } from "../dto/filtered-farm.dto";
import { QueryFailedError } from "typeorm";

describe("UserService", () => {
  let app: Express;
  let server: Server;

  let farmService: FarmService;
  let usersService: UsersService;
  let createUserDto: CreateUserDto;
  let createFarmDto: CreateFarmDto;
  //   let createdFarmInstance = new Farm();
  //   let createdUser = new User();

  beforeAll(() => {
    app = setupServer();
    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    await ds.initialize();
    usersService = new UsersService();
    farmService = new FarmService();
    createUserDto = { email: "user_farm@test.com", password: "password", address: "famagusta, cyprus" };

    await usersService.createUser(createUserDto);

    createFarmDto = {
      userEmail: createUserDto.email,
      name: "Users next farm ",
      address: "16 Evagoras Ave, Nicosia, Cyprus",
      size: 32,
      farm_yield: 645,
    };
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe(".createFarm", () => {
    it("should create farm", async () => {
      const createdFarm = await farmService.createFarm(createFarmDto);
      expect(createdFarm).toBeInstanceOf(Farm);
    });

    it("should return ConflictError if farm alredy exists", async () => {
      await farmService.createFarm(createFarmDto);
      await farmService.createFarm(createFarmDto).catch((error: ConflictError) => {
        expect(error).toBeInstanceOf(ConflictError);
      });
    });
  });

  describe(".findOneBy", () => {
    it("should return farm object", async () => {
      const createFarmDto = {
        userEmail: createUserDto.email,
        name: "Joe farm ",
        address: "16 Evagoras Ave, Nicosia, Cyprus",
        size: 32,
        farm_yield: 903,
      };
      const result = await farmService.createFarm(createFarmDto);
      const farm = await farmService.findOneBy({ id: result.id });
      expect(farm).toBeInstanceOf(Farm);
    });
  });

  describe(".getFarm", () => {
    it("should return sorted farm array", async () => {
      const createDanto = { email: "dan_farm@test.com", password: "password", address: "famagusta, cyprus" };

      const dan_user = await usersService.createUser(createDanto);
      const createFarmDto = {
        userEmail: createDanto.email,
        name: "Dan farm ",
        address: "16 Evagoras Ave, Nicosia, Cyprus",
        size: 32,
        farm_yield: 903,
      };
      await farmService.createFarm(createFarmDto);
      const sortFarm: SortedFarm = {
        userId: dan_user.id,
        page: "0",
        pageSize: "10",
        sortByName: "asc",
        sortByDate: "desc",
        sortByDistance: "desc",
      };
      const createdFarm = await farmService.getFarm(sortFarm);
      expect(createdFarm).toHaveLength(1);
    });
  });

  describe(".filterFarm", () => {
    it("should return filtered farm objects", async () => {
      const createDanto = { email: "dan_farm@test.com", password: "password", address: "famagusta, cyprus" };

      const dan_user = await usersService.createUser(createDanto);
      const createFarmDto = {
        userEmail: createDanto.email,
        name: "Dan farm ",
        address: "16 Evagoras Ave, Nicosia, Cyprus",
        size: 32,
        farm_yield: 903,
      };
      await farmService.createFarm(createFarmDto);
      const filteredFarm: FilteredFarm = {
        userId: dan_user.id,
        page: "0",
        pageSize: "10",
        sortByName: "asc",
        sortByDate: "desc",
        sortByDistance: "desc",
        outliers: "true",
      };
      const createdFarm = await farmService.filterFarm(filteredFarm);
      expect(createdFarm).toHaveLength(1);
    });
  });

  describe(".deleteFarm", () => {
    it("should return error message if farm isn't found", async () => {
      const createDanto = { email: "dan_farm@test.com", password: "password", address: "famagusta, cyprus" };

      const dan_user = await usersService.createUser(createDanto);
      const createFarmDto = {
        userEmail: createDanto.email,
        name: "Dan farm ",
        address: "16 Evagoras Ave, Nicosia, Cyprus",
        size: 32,
        farm_yield: 903,
      };
      await farmService.createFarm(createFarmDto);
      await farmService.deleteFarm(dan_user.id, "hbshbskkskds ").catch((error: NotFoundError) => {
        expect(error).toBeInstanceOf(QueryFailedError);
      });
    });
  });

  describe(".distanceCalculator", () => {
    it("should return accurate distance", async () => {
      const origin = "11 Stasinou St, Nicosia, Cyprus";
      const destination = "Paphos Street, Paphos";
      const result = await distanceCalculator(origin, destination);
      expect(result).toBeInstanceOf(LocationResponse);
    });
  });
});
