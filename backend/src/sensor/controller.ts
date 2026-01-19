import {
  Controller,
  Route,
  Get,
  Post,
  Put,
  Delete,
  Path,
  Query,
  Body,
  Response,
  SuccessResponse,
} from "tsoa";

import { PrismaClient } from "../generated/prisma/client.js";
import { SensorResponse, SensorMeasurement } from "./interface.js";
import { getSensorData } from "../lib/influxDbHelper.js";

const prisma = new PrismaClient();

@Route("sensor")
export class SensorController extends Controller {
  @Get("{id}")
  @Response<{ message: string }>(404, "No sensor found")
  @Response<{ message: string }>(500, "Something went wrong")
  public async getSensorsInformation(
    @Path() id: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ): Promise<SensorResponse | { message: string }> {
    console.log("Received on backend:", from, to);

    const finalFrom = from && from !== "undefined" ? from : "-1h";
    const finalTo = to && to !== "undefined" ? to : new Date().toISOString();

    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return { message: "Invalid sensor ID" };
    }

    try {
      const sensor = await prisma.sensor.findUnique({
        where: { id: numericId },
        select: { id: true, name: true, type: true, machineId: true },
      });

      if (!sensor) {
        this.setStatus(404);
        return { message: "No sensor found" };
      }

      const measurements = await getSensorData(
        sensor.id.toString(),
        sensor.machineId?.toString(),
        finalFrom,
        finalTo
      );

      return { ...sensor, measurements };
    } catch (error) {
      console.error(error);
      this.setStatus(500);
      return { message: "Something went wrong" };
    }
  }

  @Post("{id}")
  @SuccessResponse("201", "Created")
  @Response<{ message: string }>(400, "Name and type required")
  @Response<{ message: string }>(500, "Failed to create machine")
  public createSensor(
    @Path() id: string,
    @Body() body: { name: string; type: string }
  ): Promise<{ message: string } | SensorResponse> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return Promise.resolve({ message: "Invalid machine ID" });
    }

    if (!body.name || !body.type) {
      this.setStatus(400);
      return Promise.resolve({ message: "Name and type required" });
    }

    return prisma.sensor
      .create({
        data: {
          name: body.name,
          type: body.type,
          machine: { connect: { id: numericId } },
        },
      })
      .then((sensor) => {
        this.setStatus(201);
        return sensor;
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        return { message: "Failed to create sensor" };
      });
  }

  @Put("{id}")
  @SuccessResponse("200", "Updated")
  @Response<{ message: string }>(400, "Invalid sensor ID")
  @Response<{ message: string }>(404, "Sensor not found")
  @Response<{ message: string }>(500, "Failed to update sensor")
  public updateSensor(
    @Path() id: string,
    @Body() body: { name?: string; type?: string }
  ): Promise<{ message: string } | SensorResponse> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return Promise.resolve({ message: "Invalid sensor ID" });
    }

    return prisma.sensor
      .update({
        where: { id: numericId },
        data: {
          name: body.name,
          type: body.type,
        },
      })
      .then((sensor) => {
        this.setStatus(200);
        return sensor;
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        return { message: "Failed to update sensor" };
      });
  }

  @Delete("{id}")
  @SuccessResponse("204", "No Content")
  @Response<{ message: string }>(400, "Invalid sensor ID")
  @Response<{ message: string }>(404, "Sensor not found")
  @Response<{ message: string }>(500, "Failed to delete sensor")
  public deleteSensor(@Path() id: string): Promise<{ message: string }> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return Promise.resolve({ message: "Invalid sensor ID" });
    }

    return prisma.sensor
      .delete({
        where: { id: numericId },
      })
      .then(() => {
        this.setStatus(204);
        return { message: "Sensor deleted successfully" };
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        return { message: "Failed to delete sensor" };
      });
  }
}
