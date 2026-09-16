import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let b2ClientInstance: S3Client | null = null;

/**
 * Normalizes B2 endpoint to ensure valid protocol
 */
function normalizeEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Lazy initialization of S3 client configured for Backblaze B2
 */
export function getB2Client(): S3Client {
  if (b2ClientInstance) {
    return b2ClientInstance;
  }

  const keyId = process.env.B2_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;
  const endpoint = process.env.B2_ENDPOINT;
  const region = process.env.B2_REGION || "us-east-005";

  if (!keyId || !applicationKey) {
    throw new Error("Missing Backblaze B2 credentials (B2_KEY_ID and B2_APPLICATION_KEY required).");
  }

  if (!endpoint) {
    throw new Error("Missing Backblaze B2 endpoint (B2_ENDPOINT required, e.g. s3.us-east-005.backblazeb2.com).");
  }

  b2ClientInstance = new S3Client({
    endpoint: normalizeEndpoint(endpoint),
    region,
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: applicationKey,
    },
  });

  return b2ClientInstance;
}

/**
 * Generates a temporary pre-signed URL for a private object in the Backblaze B2 bucket.
 * 
 * @param fileKey The key (path) of the file inside the B2 bucket.
 * @param expiresInSeconds Duration in seconds for which the signed URL remains valid (default 300 = 5 minutes).
 * @returns Promise<string> The pre-signed URL.
 */
export async function getSignedFileUrl(
  fileKey: string,
  expiresInSeconds: number = 300
): Promise<string> {
  if (!fileKey || typeof fileKey !== "string") {
    throw new Error("A valid fileKey string is required.");
  }

  const bucketName = process.env.B2_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Missing B2_BUCKET_NAME environment variable.");
  }

  const s3 = getB2Client();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: expiresInSeconds,
  });

  return signedUrl;
}
