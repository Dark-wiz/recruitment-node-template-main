import { DistanceMatrixDto } from "middlewares/dto/distance-matrix.dto";
import { DataSource } from "typeorm";
import config from "config/config";
import axios from "axios";
import { LocationResponse } from "middlewares/dto/location-response.dto";
import { BadGatewayError } from "errors/errors";

export const disconnectAndClearDatabase = async (ds: DataSource): Promise<void> => {
  const { entityMetadatas } = ds;

  await Promise.all(entityMetadatas.map(data => ds.query(`truncate table "${data.tableName}" cascade`)));
  await ds.destroy();
};

export const distanceCalculator = async (origin: string, destination: string):Promise<LocationResponse> => {
  try {
    const url = `${config.MATRIX_API}?origins=${origin}&destinations=${destination}&key=${config.MATRIX_TOKEN}`;
    const response: DistanceMatrixDto = await (await axios.get(url)).data;

    const locationResponse = new LocationResponse();
    locationResponse.distance = response.rows[0].elements[0].distance.value;
    locationResponse.duration = response.rows[0].elements[0].duration.value;
    return locationResponse;
  } catch (error) {
    throw new BadGatewayError(error);
  }
};
