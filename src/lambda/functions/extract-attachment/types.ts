import type { AbortMultipartUploadCommandOutput, CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import type { Result } from "neverthrow";
import type { Readable } from "node:stream";

export type UploadConfig = {
  bucket: string;
  key: string;
  readStream: Readable;
  contentType: string;
};

export type UploadMetadata = Record<string, string>;

export type UploadEmailAttachmentResult = Result<
  CompleteMultipartUploadCommandOutput | AbortMultipartUploadCommandOutput,
  Error
>;
