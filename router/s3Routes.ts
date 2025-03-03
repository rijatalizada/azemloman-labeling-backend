import { Router } from "express";
import { getRandomFile, getSongStream } from "../controller/s3Controller";

const router = Router();

router.get("/random-file", getRandomFile);
router.get("/stream/:id", getSongStream);


export default router;
