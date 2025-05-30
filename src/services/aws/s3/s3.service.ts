import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  PutObjectCommandInput,
  GetObjectCommandOutput,
  ListObjectsV2CommandOutput,
  _Object as S3Object,
  ListObjectsV2CommandInput,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { AppError } from "@app/shared";
import { logger } from "@app/utils";
import { S3File } from "./s3.dtos";
import { env } from "@app/config/env";
import mime from "mime-types";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk as Buffer));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  constructor({
    bucketName,
    region,
    accessKeyId,
    secretAccessKey,
  }: {
    bucketName: string;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  }) {
    this.bucketName = bucketName;
    this.region = region;

    const s3ClientConfig: {
      region: string;
      credentials?: { accessKeyId: string; secretAccessKey: string };
    } = {
      region: this.region,
    };
    if (accessKeyId && secretAccessKey) {
      s3ClientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    this.s3Client = new S3Client(s3ClientConfig);
    logger.info(
      `S3Service initialized for bucket: ${this.bucketName} in region: ${this.region}`,
    );
  }
  async uploadFile(
    fileKey: string,
    fileBuffer: Buffer | Readable,
    contentType: string,
    acl:
      | "private"
      | "public-read"
      | "public-read-write"
      | "authenticated-read" = "private",
  ): Promise<{ eTag?: string; s3Uri: string; versionId?: string }> {
    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: acl,
    };

    try {
      const command = new PutObjectCommand(params);
      const data = await this.s3Client.send(command);
      logger.info(
        `File uploaded successfully to S3: ${fileKey}, ETag: ${data.ETag}`,
      );
      return {
        eTag: data.ETag,
        s3Uri: `s3://${this.bucketName}/${fileKey}`,
        versionId: data.VersionId,
      };
    } catch (error) {
      logger.error(`Error uploading file ${fileKey} to S3:`, error);
      this.handleError(error);
    }
  }

  async downloadFile(fileKey: string): Promise<S3File> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      const command = new GetObjectCommand(params);
      const data: GetObjectCommandOutput = await this.s3Client.send(command);

      if (!data.Body) {
        throw AppError.notFound(`File not found or body is empty: ${fileKey}`);
      }

      const content = await streamToBuffer(data.Body as Readable);
      logger.info(`File downloaded successfully from S3: ${fileKey}`);
      return {
        key: fileKey,
        content,
        contentType: data.ContentType || "image/png",
        lastModified: data.LastModified!,
        size: data.ContentLength,
      };
    } catch (error) {
      logger.error(`Error downloading file ${fileKey} from S3:`, error);
      this.handleError(error);
    }
  }
  async listFiles(
    prefix?: string,
    maxKeys: number = 1000,
    continuationToken?: string,
  ): Promise<{
    files: S3File[];
    nextContinuationToken?: string;
    isTruncated?: boolean;
  }> {
    const params: ListObjectsV2CommandInput = {
      Bucket: this.bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    };

    try {
      const command = new ListObjectsV2Command(params);
      const data: ListObjectsV2CommandOutput =
        await this.s3Client.send(command);
      const files: S3File[] = (data.Contents || []).map((item: S3Object) =>
        this.formatDetails({
          key: item.Key!,
          lastModified: item.LastModified!,
          contentType: "",
          size: item.Size,
        }),
      );
      logger.info(
        `Listed ${files.length} files from S3 with prefix: '${prefix || ""}'`,
      );
      return {
        files,
        nextContinuationToken: data.NextContinuationToken,
        isTruncated: data.IsTruncated,
      };
    } catch (error) {
      logger.error(
        `Error listing files from S3 with prefix '${prefix || ""}':`,
        error,
      );
      this.handleError(error);
    }
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
      logger.info(`File deleted successfully from S3: ${fileKey}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting file ${fileKey} from S3:`, error);
      this.handleError(error);
    }
  }
  handleError(error: unknown): never {
    logger.error("S3 Error", error);
    throw AppError.internal();
  }
  private formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }
  private formatDetails(img: S3File) {
    const name =
      img.key.split(".")[0].split("/")[1].split("-").join(" ") || img.key;
    const contentType = mime
      .contentType(img.key)
      .toString()
      .split("/")[0]
      .replace("s", "");
    const size = this.formatFileSize(Number(img.size) || 0);
    const url = `${env.url_prod}/api/v1/files/${img.key}`;
    return {
      name,
      contentType,
      size,
      url,
      key: img.key,
      lastModified: img.lastModified,
    } as S3File;
  }
}
