import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { Farm } from "./entities/farm.entity";
import dataSource from "orm/orm.config";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { ConflictError, NotFoundError } from "errors/errors";
import { UsersService } from "modules/users/users.service";

export class FarmService {
  private readonly farmRepository: Repository<Farm>;
  private readonly userService: UsersService;
  constructor() {
    this.farmRepository = dataSource.getRepository(Farm);
    this.userService = new UsersService();
  }

  public async createFarm(data: CreateFarmDto): Promise<Farm> {
    let { userEmail, name, address, size, farmYield } = data;

    const user = await this.userService.findOneBy({ email: userEmail });
    if (!user) throw new NotFoundError("A user with this email does not exist");

    name = name.toLowerCase();

    const existingFarm = await this.findOneBy({ name: name });

    if(existingFarm) throw new ConflictError(`Farm with name ${name} already exists`);

    const farmData: DeepPartial<Farm> = { user, name, address, size, farmYield };

    const newFarm = this.farmRepository.create(farmData);
    return this.farmRepository.save(newFarm);
  }

  public async findOneBy(param: FindOptionsWhere<Farm>): Promise<Farm | null> {
    return this.farmRepository.findOneBy({ ...param });
  }

  public async getFarm(val: string){
    return `Test`;
  }
}
