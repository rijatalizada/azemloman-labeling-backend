import express, { Application } from "express";
import dotenv from "dotenv";
import s3Routes from "./router/s3Routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/s3", s3Routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
