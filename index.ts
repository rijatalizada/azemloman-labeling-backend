import express, { Application } from "express";
import dotenv from "dotenv";
import s3Routes from "./router/s3Routes";
import cors from "cors";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

app.use("/s3", s3Routes);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
