import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { loadConfig } from "../config/loadConfig.js";
import { ApiError } from "./ApiError.js";

const secret = await loadConfig();

const s3Client = new S3Client({
  region: secret.AWS_REGION,
  credentials: {
    accessKeyId: secret.AWS_ACCESS_KEY_ID,
    secretAccessKey: secret.AWS_SECRET_ACCESS_KEY,
  },
});

export const deleteObject = async (fileUrlOrKey) => {
  try {
    // Extract key from URL if full URL provided
    const key = fileUrlOrKey.includes("amazonaws.com")
      ? fileUrlOrKey.split(".com/")[1]
      : fileUrlOrKey;

    const params = {
      Bucket: secret.AWS_BUCKET_NAME,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(params));
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error("S3 deletion error:", error);
    throw new ApiError(500, `Failed to delete file: ${error.message}`);
  }
};
