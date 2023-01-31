import { Expose, Transform } from "class-transformer";
import { Farm } from "../entities/farm.entity";

export class FarmDto {
  constructor(partial?: Partial<FarmDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public readonly id: string;

  @Expose()
  public userId: string;

  @Transform(({ value }) => (value as Number).toString())
  @Expose()
  public farmYield: Number;

  @Transform(({ value }) => (value as Number).toString())
  @Expose()
  public distance_coordinate: Number;

  @Transform(({ value }) => (value as Number).toString())
  @Expose()
  public duration_coordinate: Number;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public createdAt: Date;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public updatedAt: Date;

  public static createFromEntity(farm: Farm | null): FarmDto | null {
    if (!farm) {
      return null;
    }

    return new FarmDto({ ...farm });
  }
}
