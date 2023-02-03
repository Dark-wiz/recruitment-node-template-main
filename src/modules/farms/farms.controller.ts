import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { FarmDto } from "./dto/farm.dto";
import { FilteredFarm } from "./dto/filtered-farm.dto";
import { SortedFarm } from "./dto/sorted-farm.dto";
import { FarmService } from "./farms.service";

export class FarmController {
  private readonly farmService: FarmService;

  constructor() {
    this.farmService = new FarmService();
  }

  public async addFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await this.farmService.createFarm(req.body as CreateFarmDto);
      res.status(HttpStatusCode.Created).send(FarmDto.createFromEntity(farm));
    } catch (error) {
      next(error);
    }
  }

  public async getFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, page, pageSize, sortByName, sortByDate, sortByDistance } = req.query;
      const sortFarm: SortedFarm = {
        userId: userId as string,
        page: page as string,
        pageSize: pageSize as string,
        sortByName: sortByName as string,
        sortByDate: sortByDate as string,
        sortByDistance: sortByDistance as string,
      };
      const farms = await this.farmService.getFarm(sortFarm);
      res.status(HttpStatusCode.Ok).send(farms);
    } catch (error) {
      next(error);
    }
  }

  public async filterFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, page, pageSize, outliers, sortByName, sortByDate, sortByDistance } = req.query;
      const filteredFarm: FilteredFarm = {
        userId: userId as string,
        page: page as string,
        pageSize: pageSize as string,
        sortByName: sortByName as string,
        sortByDate: sortByDate as string,
        sortByDistance: sortByDistance as string,
        outliers: outliers as string,
      };
      const farms = await this.farmService.filterFarm(filteredFarm);
      res.status(HttpStatusCode.Ok).send(farms);
    } catch (error) {
      next(error);
    }
  }

  public async deleteFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, farmId } = req.query;
      await this.farmService.deleteFarm(userId as string, farmId as string);
      res.status(HttpStatusCode.Ok).send({ message: "Farm was deleted" });
    } catch (error) {
      next(error);
    }
  }
}
