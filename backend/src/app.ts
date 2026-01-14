import express from "express";
import "reflect-metadata";
import { RegisterRoutes } from "./generated/routes.js";

const port = process.env.PORT || "3000";
const host = process.env.HOST || "localhost";

const app = express();

app.use(express.json());

RegisterRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

export default app;
