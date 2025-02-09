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

  // Select a random key
  const randomIndex = Math.floor(Math.random() * cachedKeys.length);
  const randomKey = cachedKeys[randomIndex];

  try {
    return {
      fileId: randomKey.split("/")[0],
      fileName: randomKey.split("/")[1],
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${randomKey}`,
    };
  } catch (error: any) {
    throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
  }
};

// export const getRandomObject = async (): Promise<any> => {
//   await ensureCacheIsFresh();

//   // Select a random key
//   const randomIndex = Math.floor(Math.random() * cachedKeys.length);
//   const randomKey = cachedKeys[randomIndex];

//   // Fetch the object details
//   const params = {
//     Bucket: BUCKET_NAME,
//     Key: randomKey,
//   };

//   try {
//     const data = await s3.getObject(params).promise();
//     return {
//       fileName: randomKey,
//       contentType: data.ContentType,
//       size: data.ContentLength,
//       lastModified: data.LastModified,
//       url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${randomKey}`,
//     };
//   } catch (error: any) {
//     throw new Error(`Failed to retrieve object: ${error.message}`);
//   }
// };
