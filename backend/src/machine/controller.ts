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

import type {
  MachineSummary,
  MachineResponse,
  CreateMachineBody,
  UpdateMachineBody,
} from "./interface.js";

import { getSensorData } from "../lib/influxDbHelper.js";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

@Route("machine")
export class MachineController extends Controller {
  @Get()
  @Response<{ message: string }>(404, "No machines found")
  @Response<{ message: string }>(500, "Something went wrong")
  public getMachines(
    @Query() name?: string
  ): Promise<MachineSummary[] | { message: string }> {
    return prisma.machine
      .findMany({
        where: name ? { name: { contains: name, mode: "insensitive" } } : {},
        select: { id: true, name: true },
      })
      .then((machines) => {
        if (!machines.length) {
          this.setStatus(404);
          return {
            message: "No machines found matching your search criteria.",
          };
        }

        return machines;
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        return { message: "Something went wrong" };
      });
  }

  /** Get a machine by ID */
  @Get("{id}")
  @Response<{ message: string }>(400, "Invalid machine ID")
  @Response<{ message: string }>(404, "Machine not found")
  @Response<{ message: string }>(500, "Internal server error")
  public getMachineById(
    @Path() id: string
  ): Promise<MachineResponse | { message: string }> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return Promise.resolve({ message: "Invalid machine ID" });
    }

    return prisma.machine
      .findUnique({
        where: { id: numericId },
        include: {
          sensors: { select: { id: true, name: true, type: true } },
        },
      })
      .then((machine) => {
        if (!machine) {
          this.setStatus(404);
          return { message: "Machine not found" };
        }

        // If the machine has sensors, fetch last 5 minutes of data for each
        if (machine.sensors.length > 0) {
          const sensorPromises = machine.sensors.map((sensor) =>
            getSensorData(sensor.id.toString(), machine.id.toString(), "-5m")
              .then((measurements) => ({
                ...sensor,
                measurements, // attach the last 5 min data
              }))
              .catch((error: any) => {
                console.error(
                  `Error fetching data for sensor ${sensor.id}:`,
                  error
                );
                return { ...sensor, measurements: [] }; // fallback empty array
              })
          );

          return Promise.all(sensorPromises).then((sensorsWithData) => ({
            ...machine,
            sensors: sensorsWithData,
          }));
        }

        return machine;
      })
      .catch((error: any) => {
        console.error(error);
        this.setStatus(500);
        return { message: "Internal server error" };
      });
  }

  /** Create a new machine */
  @Post()
  @SuccessResponse("201", "Created")
  @Response<{ message: string }>(400, "Name and location required")
  @Response<{ message: string }>(500, "Failed to create machine")
  public createMachine(
    @Body() body: CreateMachineBody
  ): Promise<MachineResponse | { message: string }> {
    const { name, location } = body;

    if (!name || !location) {
      this.setStatus(400);
      return Promise.resolve({ message: "Name and location are required." });
    }

    return prisma.machine
      .create({ data: { name, location } })
      .then((newMachine) => {
        this.setStatus(201);
        return {
          ...newMachine,
          sensors: null,
        };
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        return { message: "Failed to create machine" };
      });
  }

  /** Update a machine by ID */
  @Put("{id}")
  @Response<{ message: string }>(400, "Invalid machine ID")
  @Response<{ message: string }>(404, "Machine not found or update failed")
  public updateMachine(
    @Path() id: string,
    @Body() body: UpdateMachineBody
  ): Promise<MachineResponse | { message: string }> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return Promise.resolve({ message: "Invalid machine ID" });
    }

    return prisma.machine
      .update({
        where: { id: numericId },
        data: body,
      })
      .then((updatedMachine) => ({
        ...updatedMachine,
        sensors: null,
      }))
      .catch((error) => {
        console.error(error);
        this.setStatus(404);
        return { message: "Machine not found or update failed" };
      });
  }

  /** Delete a machine by ID */
  @Delete("{id}")
  @SuccessResponse("204", "Deleted")
  @Response<{ message: string }>(400, "Invalid machine ID")
  @Response<{ message: string }>(500, "Could not delete machine")
  public deleteMachine(
    @Path() id: string
  ): Promise<void | { message: string }> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return Promise.resolve({ message: "Invalid machine ID" });
    }

    return prisma.machine
      .delete({ where: { id: numericId } })
      .then(() => {
        this.setStatus(204);
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        return { message: "Could not delete machine" };
      });
  }
}
