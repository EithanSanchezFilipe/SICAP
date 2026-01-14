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
import prisma from "../lib/prisma.js";
import type {
  MachineSummary,
  GetMachinesQuery,
  MachineResponse,
  CreateMachineBody,
  UpdateMachineBody,
} from "./interface.js";

@Route("machine")
export class MachineController extends Controller {
  @Get()
  @Response<{ message: string }>(404, "No machines found")
  @Response<{ message: string }>(500, "Something went wrong")
  public getMachines(@Query() name?: string): Promise<MachineSummary[]> {
    return prisma.machine
      .findMany({
        where: name ? { name: { contains: name, mode: "insensitive" } } : {},
        select: { id: true, name: true },
      })
      .then((machines) => {
        if (!machines.length) {
          this.setStatus(404);
          throw new Error("No machines found matching your search criteria.");
        }
        return machines;
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        throw new Error("Something went wrong");
      });
  }

  /** Get a machine by ID */
  @Get("{id}")
  @Response<{ message: string }>(404, "Machine not found")
  @Response<{ message: string }>(500, "Internal server error")
  public getMachineById(@Path() id: string): Promise<MachineResponse> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return Promise.reject(new Error("Invalid machine ID"));
    }

    return prisma.machine
      .findUnique({
        where: { id: numericId },
        include: { sensors: { select: { id: true, name: true, type: true } } },
      })
      .then((machine) => {
        if (!machine) {
          this.setStatus(404);
          throw new Error("Machine not found");
        }
        return machine;
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        throw new Error("Internal server error");
      });
  }

  /** Create a new machine */
  @Post()
  @SuccessResponse("201", "Created")
  @Response<{ message: string }>(400, "Name and location required")
  @Response<{ message: string }>(500, "Failed to create machine")
  public createMachine(
    @Body() body: CreateMachineBody
  ): Promise<MachineResponse> {
    const { name, location } = body;

    if (!name || !location) {
      this.setStatus(400);
      return Promise.reject(new Error("Name and location are required."));
    }

    return prisma.machine
      .create({ data: { name, location } })
      .then((newMachine) => {
        this.setStatus(201);
        return newMachine;
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        throw new Error("Failed to create machine");
      });
  }

  /** Update a machine by ID */
  @Put("{id}")
  @Response<{ message: string }>(404, "Machine not found or update failed")
  public updateMachine(
    @Path() id: string,
    @Body() body: UpdateMachineBody
  ): Promise<MachineResponse> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return Promise.reject(new Error("Invalid machine ID"));
    }

    return prisma.machine
      .update({ where: { id: numericId }, data: body })
      .catch((error) => {
        this.setStatus(404);
        throw new Error("Machine not found or update failed");
      });
  }

  /** Delete a machine by ID */
  @Delete("{id}")
  @Response<{ message: string }>(500, "Could not delete machine")
  @SuccessResponse("204", "Deleted")
  public deleteMachine(@Path() id: string): Promise<void> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      this.setStatus(400);
      return Promise.reject(new Error("Invalid machine ID"));
    }

    return prisma.machine
      .delete({ where: { id: numericId } })
      .then(() => this.setStatus(204))
      .catch((error) => {
        console.error(error);
        this.setStatus(500);
        throw new Error("Could not delete machine");
      });
  }
}
