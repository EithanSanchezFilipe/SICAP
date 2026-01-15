import express from "express";
import "reflect-metadata";
import { RegisterRoutes } from "./generated/routes.js";
import swaggerDocument from "./generated/swagger.json" with { type: "json" };
import swaggerUi from "swagger-ui-express";
import "dotenv/config";

const port = process.env.PORT || "3000";
const host = process.env.HOST || "localhost";

const app = express();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
RegisterRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}`);
    console.log(`Swagger docs available at http://${host}:${port}/docs`);
});

export default app;
