import { Request, Response } from "express";
import { getRandomObject } from "../services/s3Service";

export const getRandomFile = async (req: Request, res: Response) => {
  try {
    const data = await getRandomObject();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
