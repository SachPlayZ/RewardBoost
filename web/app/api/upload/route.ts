import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";
    const filename = (formData.get("filename") as string) || file?.name || "upload";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const region = getEnv("AWS_REGION");
    const bucket = getEnv("S3_BUCKET_NAME");
    const accessKeyId = getEnv("AWS_ACCESS_KEY_ID");
    const secretAccessKey = getEnv("AWS_SECRET_ACCESS_KEY");

    const arrayBuffer = await file.arrayBuffer();
    const key = `${folder}/${randomUUID()}-${filename}`.replace(/\s+/g, "-");

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type || "application/octet-stream",
      })
    );

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return NextResponse.json({ url });
  } catch (error: unknown) {
    console.error("S3 upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}


