import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import AWS from 'aws-sdk';
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, 
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
