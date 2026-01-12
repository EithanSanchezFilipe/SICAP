import prisma from "../lib/prisma.js";
import type { Request, Response } from "express";
import type { GetMachinesQuery, MachineSummary } from "./interface.js";
import { parseParamId } from "../lib/parseParams.js";

const getMachines = (req: Request, res: Response) => {
  const query = req.query as GetMachinesQuery;

  prisma.machine
    .findMany({
      where: query.name
        ? { name: { contains: query.name, mode: "insensitive" } }
        : {},
      select: { id: true, name: true },
    })
    .then((machines: MachineSummary[]) => {
      if (machines.length == 0)
        return res.status(404).json({
          message: "No machines found matching your search criteria.",
        });
      res.status(200).json(machines);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    });
};

const getMachineById = (req: Request, res: Response) => {
  const params = parseParamId(req.params, res);
  if (!params) return;
  prisma.machine
    .findUnique({
      where: { id: params.id },
      include: {
        sensors: { select: { id: true, name: true, type: true } },
      },
    })
    .then((machine) => {
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.status(200).json(machine);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
};

const createMachine = async (req: Request, res: Response) => {
  const { name, location } = req.body;

  if (!name || !location) {
    return res.status(400).json({ message: "Name and location are required." });
  }

  try {
    const newMachine = await prisma.machine.create({
      data: { name, location },
    });
    res.status(201).json(newMachine);
  } catch (error) {
    res.status(500).json({ message: "Failed to create machine" });
  }
};

const updateMachine = async (req: Request, res: Response) => {
  const parsed = parseParamId(req.params, res);
  if (!parsed) return;

  try {
    const updated = await prisma.machine.update({
      where: { id: parsed.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(404).json({ message: "Machine not found or update failed" });
  }
};

const deleteMachine = async (req: Request, res: Response) => {
  const parsed = parseParamId(req.params, res);
  if (!parsed) return;

  try {
    await prisma.machine.delete({
      where: { id: parsed.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Could not delete machine" });
  }
};

export {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
};
