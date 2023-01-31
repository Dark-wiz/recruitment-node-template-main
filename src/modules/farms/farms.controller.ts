import { NextFunction, Request, Response } from "express";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { FarmDto } from "./dto/farm.dto";
import { FarmService } from "./farms.service";

export class FarmController {
  private readonly farmService: FarmService;

  constructor() {
    this.farmService = new FarmService();
  }

  public async addFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await this.farmService.createFarm(req.body as CreateFarmDto);
      res.status(201).send(FarmDto.createFromEntity(farm));
    } catch (error) {
      next(error);
    }
  }

  public async getFarm(req: Request, res: Response, next: NextFunction) {
    try {
        const farms = await this.farmService.getFarm(req.body as string);
        res.status(201).send(farms);
    } catch (error) {
        next(error);
    }
  }
}
