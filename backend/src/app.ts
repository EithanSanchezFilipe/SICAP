import express from "express";

const port = process.env.PORT || "3000";
const host = process.env.HOST || "localhost";

const app = express();

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
