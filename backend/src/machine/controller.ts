import prisma from "../lib/prisma.js";
import type { Request, Response } from "express";
import type { GetMachinesQuery, MachineSummary } from "./interface.js";
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
