import { FarmService } from "modules/farms/farms.service";
import { UsersService } from "modules/users/users.service";
import { CreateUserDto } from "modules/users/dto/create-user.dto";
import { User } from "modules/users/entities/user.entity";
import { CreateFarmDto } from "modules/farms/dto/create-farm.dto";
import { Repository } from "typeorm";
import { Farm } from "modules/farms/entities/farm.entity";
import dataSource from "orm/orm.config";

export class Seeder {
  private readonly usersRepository: Repository<User>;
  private readonly farmRepository: Repository<Farm>;
  private readonly userService: UsersService;
  private readonly farmService: FarmService;

  private readonly originAddresses = [
    "5 Kyprianou St, Limassol, Cyprus",
    "16 Evagoras Ave, Nicosia, Cyprus",
    "3 Archbishop Kyprianou St, Paphos, Cyprus",
    "7 Kanika Business Center, Limassol, Cyprus",
    "11 Stasinou St, Nicosia, Cyprus",
    "2 Makariou III Ave, Larnaca, Cyprus",
    "1 Evagora Papachristofi St, Nicosia, Cyprus",
    "8 Kostantinou St, Paphos, Cyprus",
    "6 Aristotelous St, Larnaca, Cyprus",
    "9 Spyrou Kyprianou St, Limassol, Cyprus"
  ];

  private readonly destinationAddresses = [
    "Limassol Avenue, Limassol",
    "Larnaca Road, Larnaca",
    "Nicosia Boulevard, Nicosia",
    "Paphos Street, Paphos",
    "Famagusta Road, Famagusta",
    "Kyrenia Avenue, Kyrenia",
    "Paralimni Road, Paralimni",
    "Protaras Street, Protaras",
    "Ayia Napa Boulevard, Ayia Napa",
    "Polis Chrysochous Road, Polis Chrysochous",
    "Peyia Street, Peyia",
    "Troodos Mountain, Troodos",
  ];

  constructor() {
    this.usersRepository = dataSource.getRepository(User);
    this.farmRepository = dataSource.getRepository(Farm);
    this.userService = new UsersService();
    this.farmService = new FarmService();
  }
  public async seedUser() {
    const users = await this.usersRepository.find();
    const farms = await this.farmRepository.find();
    if (users.length !== 0 || farms.length !== 0) return;

    const createUserPromises = [];
    for (let i = 1; i <= 4; i++) {
      const createUserDto: CreateUserDto = {
        email: `user${i}@test.com`,
        password: "password",
        address: this.pickLocation(this.originAddresses),
      };
      createUserPromises.push(this.userService.createUser(createUserDto));
    }

    const createdUsers = await Promise.all(createUserPromises);

    for (const user of createdUsers) {
      for (let j = 1; j <= 30; j++) {
        this.seedFarm(`${user.email.split("@")[0]} - farm ${j}`, user.email);
      }
    }
  }

  private async seedFarm(name: string, userEmail: string) {
    const createFarmDto: CreateFarmDto = {
      userEmail,
      name,
      address: this.pickLocation(this.destinationAddresses),
      size: this.pickNumber(),
      farm_yield: this.pickNumber(),
    };
    await this.farmService.createFarm(createFarmDto);
  }

  private pickLocation(location: any) {
    return location[Math.floor(Math.random() * location.length)];
  }

  private pickNumber() {
    return Math.random() * 1000 + 1;
  }
}
