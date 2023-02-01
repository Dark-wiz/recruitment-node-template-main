import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateFarmDto {
  @IsEmail()
  @IsNotEmpty()
  public userEmail: string;

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public address: string;

  @IsNumber()
  @IsNotEmpty()
  public size: number;

  @IsNumber()
  @IsNotEmpty()
  public farm_yield: number;
}
