import type { Readable } from "node:stream";
import type { AbortMultipartUploadCommandOutput, CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import type { Result } from "neverthrow";

export type UploadConfig = {
  bucket: string;
  contentType: string;
  key: string;
  readStream: Readable;
};

export type UploadMetadata = Record<string, string>;

export type UploadEmailAttachmentResult = Result<
  AbortMultipartUploadCommandOutput | CompleteMultipartUploadCommandOutput,
  Error
>;
