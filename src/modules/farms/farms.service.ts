import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { Farm } from "./entities/farm.entity";
import dataSource from "orm/orm.config";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { ConflictError, NotFoundError } from "errors/errors";
import { UsersService } from "modules/users/users.service";
import { distanceCalculator } from "helpers/utils";
import { LocationResponse } from "middlewares/dto/location-response.dto";

export class FarmService {
  private readonly farmRepository: Repository<Farm>;
  private readonly userService: UsersService;
  constructor() {
    this.farmRepository = dataSource.getRepository(Farm);
    this.userService = new UsersService();
  }

  public async createFarm(data: CreateFarmDto): Promise<Farm> {
    let { userEmail, name, address, size, farm_yield } = data;

    const user = await this.userService.findOneBy({ email: userEmail });
    if (!user) throw new NotFoundError("A user with this email does not exist");

    name = name.toLowerCase();

    const existingFarm = await this.findOneBy({ name: name });

    if (existingFarm) throw new ConflictError(`Farm with name ${name} already exists`);

    const locationResponse: LocationResponse = await distanceCalculator(user.address, address);

    const distance_coordinate = locationResponse.distance;
    const duration_coordinate = locationResponse.duration; 

    const farmData: DeepPartial<Farm> = { user, name, address, size, farm_yield, distance_coordinate, duration_coordinate };

    const newFarm = this.farmRepository.create(farmData);
    return this.farmRepository.save(newFarm);
  }

  public async findOneBy(param: FindOptionsWhere<Farm>): Promise<Farm | null> {
    return this.farmRepository.findOneBy({ ...param });
  }

  public async getFarm(
    userId: string,
    page: string,
    pageSize: string,
    sortByName: string,
    sortByDate: string,
    sortByDistance: string,
  ) {
    const result = await this.farmRepository
      .createQueryBuilder("farm")
      .leftJoin("farm.user", "user")
      .addSelect("user.email")
      .where("farm.userId = :userId", { userId })
      .orderBy("farm.name", sortByName === "asc" ? "ASC" : "DESC")
      .addOrderBy("farm.createdAt", sortByDate === "asc" ? "ASC" : "DESC")
      .addOrderBy("farm.distance_coordinate", sortByDistance === "asc" ? "ASC" : "DESC")
      .skip(parseInt(page))
      .take(parseInt(pageSize))
      .getMany();
    return result;
  }

  public async filterFarm(
    userId: string,
    page: string,
    pageSize: string,
    outliers: string,
    sortByName: string,
    sortByDate: string,
    sortByDistance: string,
  ) {
    const outlierValue = Boolean(outliers);
    const result = await this.farmRepository
      .createQueryBuilder("farm")
      .leftJoin("farm.user", "user")
      .addSelect("user.email")
      .where("farm.userId = :userId", { userId })
      .andWhere(
        `farm.farm_yield BETWEEN ( SELECT AVG(farm_yield) - AVG(farm_yield) * 0.3 FROM farm ) AND ( SELECT AVG(farm_yield) + AVG(farm_yield) * 0.3 FROM farm )`,
        { outlierValue },
      )
      .orderBy("farm.name", sortByName === "asc" ? "ASC" : "DESC")
      .addOrderBy("farm.createdAt", sortByDate === "asc" ? "ASC" : "DESC")
      .addOrderBy("farm.distance_coordinate", sortByDistance === "asc" ? "ASC" : "DESC")
      .skip(parseInt(page))
      .take(parseInt(pageSize))
      .getMany();
    return result;
  }

  public async deleteFarm(userId: string, farmId: string): Promise<void> {
    const result = await this.farmRepository
      .createQueryBuilder("farm")
      .where("farm.id = :farmId", { farmId })
      .andWhere("farm.userId = :userId", { userId })
      .getOne();

    if (!result) {
      throw new NotFoundError("This farm wasn't found");
    }
    await this.farmRepository.remove(result as Farm);
  }
}
