import { NextFunction, Request, Response } from "express";
import { getRandomObject, streamSong } from "../services/s3Service";

export const getRandomFile = async (req: Request, res: Response) => {
  try {
    const data = await getRandomObject();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const getSongStream = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const songId = req.params.id;

  if (!songId) {
    res.status(400).send("Song ID is required");
    return;
  }

  try {
    const s3Stream = await streamSong(songId);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `inline; filename="${songId}"`);

    s3Stream.pipe(res);

    s3Stream.on("end", () => {
      res.end();
    });

    s3Stream.on("error", (err) => {
      console.error("S3 stream error:", err);
      res.status(500).send("Failed to stream the song.");
    });

    return;
  } catch (error: any) {
    console.error("Error streaming song:", error.message);
    res.status(500).send("Failed to stream the song.");
    return; 
  }
};
