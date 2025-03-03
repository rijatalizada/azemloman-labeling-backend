import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = "songs2-cropped";

let cachedKeys: string[] = [];
let lastCacheRefresh: number | null = null;

const fetchAllKeys = async (): Promise<string[]> => {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const params = {
      Bucket: BUCKET_NAME,
      ContinuationToken: continuationToken,
    };

    const data = await s3.listObjectsV2(params).promise();
    data.Contents?.forEach((item) => {
      if (item.Key) keys.push(item.Key);
    });

    continuationToken = data.NextContinuationToken;
  } while (continuationToken);

  cachedKeys = keys;
  lastCacheRefresh = Date.now();
  return keys;
};

const ensureCacheIsFresh = async (): Promise<void> => {
  const TEN_MINUTES = 10 * 60 * 1000;

  if (!lastCacheRefresh || Date.now() - lastCacheRefresh > TEN_MINUTES) {
    console.log("Refreshing cache...");
    await fetchAllKeys();
  }
};

export const getRandomObject = async (): Promise<any> => {
  await ensureCacheIsFresh();

  const randomIndex = Math.floor(Math.random() * cachedKeys.length);
  const randomKey = cachedKeys[randomIndex];

  try {
    return {
      fileId: randomKey.split("/")[0],
      fileName: randomKey.split("/")[1],
    };
  } catch (error: any) {
    throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
  }
};

export async function streamSong(songId: string) {
  try {
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: songId
    };
    
    const listResult = await s3.listObjectsV2(listParams).promise();
    const matchingFile = listResult.Contents?.[0];
    
    if (!matchingFile?.Key) {
      throw new Error(`No files found with prefix: ${songId}`);
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: matchingFile.Key, 
    };

    console.log('Fetching file:', matchingFile.Key);
    
    const s3Object = s3.getObject(params)
    return s3Object.createReadStream();
  } catch (error: any) {
    console.error("Error fetching song from S3:", error.message);
    throw new Error(`Song not found or could not be retrieved. Key: ${songId}`);
  }
}
