import { Router } from "express";
import { getRandomFile } from "../controller/s3Controller";

const router = Router();

// Route to get a random file
router.get("/random-file", getRandomFile);

export default router;
