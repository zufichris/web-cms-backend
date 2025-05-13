import { Request, Response } from "express";
import { ApiHandler } from "@app/shared";
import { S3Service } from "./s3.service";
import { logger } from "@app/utils";
import mime from "mime-types";

export class S3Controllers {
  constructor(private readonly s3Service: S3Service) {}

  listFiles = ApiHandler(async (req: Request, res: Response) => {
    const result = await this.s3Service.listFiles(
      (req.query.prefix as string) || "",
    );
    res.json_structured({
      data: result.files,
      message: "Files Retrieved Successfully",
      success: true,
      status: 200,
    });
  });

  uploadFile = ApiHandler(async (req: Request, res: Response) => {
    const data = {
      key: req.body.key,
      type: req.body.type,
      buffer: req.body.file,
    };
    const uploaded = await this.s3Service.uploadFile(
      data.key,
      data.buffer,
      data.type,
      "public-read",
    );
    res.json_structured({
      message: "File Uploaded Successfully",
      status: 201,
      success: true,
      data: uploaded,
    });
  });

  download = ApiHandler(async (req: Request, res: Response) => {
    const key = Object.values(req.params).join("/");
    logger.debug("Key is", key);

    const file = await this.s3Service.downloadFile(key);

    res.json_structured({
      success: true,
      message: "File Retrieved Successfully",
      data: file,
      status: 200,
    });
  });

  sendFile = ApiHandler(async (req: Request, res: Response) => {
    const key = Object.values(req.params).join("/");
    logger.debug("Sending file with key:", key);

    const file = await this.s3Service.downloadFile(key);

    const contentType =
      mime.lookup(key) || file.contentType || "application/octet-stream";

    res.contentType(contentType);

    if (file.lastModified) {
      res.setHeader("Last-Modified", file.lastModified.toUTCString());
    }
    if (file.size) {
      res.setHeader("Content-Length", file.size.toString());
    }

    const filename = key.split("/").pop() || "download";
    const isInline =
      contentType.startsWith("image/") ||
      contentType.startsWith("text/") ||
      contentType === "application/pdf";

    res.setHeader(
      "Content-Disposition",
      isInline
        ? `inline; filename="${encodeURIComponent(filename)}"`
        : `attachment; filename="${encodeURIComponent(filename)}"`,
    );

    res.send(file.content);
  });

  deleteFile = ApiHandler(async (req: Request, res: Response) => {
    const key = Object.values(req.params)
      .map((v) => v)
      .join("/");
    await this.s3Service.deleteFile(key);
    res.json_structured({
      success: true,
      message: "File Deleted Successfully",
      data: true,
      status: 200,
    });
  });
}
