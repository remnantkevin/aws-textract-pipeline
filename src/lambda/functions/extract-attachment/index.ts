import * as process from "node:process";
import { Readable } from "node:stream";
import type { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { Context, S3Event } from "aws-lambda";
import { MailParser } from "mailparser";
import type { AttachmentStream, MessageText } from "mailparser";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";
import { use } from "simple-runtypes";
import { log, wrapError } from "../../shared/utils.js";
import { EmailHeaders, EnvironmentVariables } from "./runtypes.js";
import type { UploadConfig, UploadEmailAttachmentResult, UploadMetadata } from "./types.js";

const s3Client = new S3Client({});
const envVariables = EnvironmentVariables(process.env);

export async function main(event: S3Event, context: Context) {
  const sourceBucket = event.Records[0].s3.bucket.name;
  const sourceKey = event.Records[0].s3.object.key;

  const emailHeadersResult = await getEmailHeaders(s3Client, sourceBucket, sourceKey);
  if (emailHeadersResult.isErr()) {
    log(emailHeadersResult.error);
    return;
  }

  const uploadResult = await uploadEmailAttachment(
    s3Client,
    sourceBucket,
    sourceKey,
    emailHeadersResult.value,
    context.awsRequestId
  );
  if (uploadResult.isErr()) {
    log(uploadResult.error);
    return;
  }
  return { success: true };
}

async function getEmailHeaders(s3Client: S3Client, bucket: string, key: string): Promise<Result<EmailHeaders, Error>> {
  const rawEmailObjectStreamResult = await createS3ObjectReadStream(s3Client, bucket, key);
  if (rawEmailObjectStreamResult.isErr()) {
    return err(rawEmailObjectStreamResult.error);
  }

  const rawEmailObjectStream = rawEmailObjectStreamResult.value;

  const mailParser = new MailParser();

  const headersPromise = new Promise((resolve: (value: Result<EmailHeaders, Error>) => void) => {
    let readHeaders = false;

    mailParser.on("headers", (headers) => {
      readHeaders = true;

      const headersObject = Object.fromEntries(headers);
      const emailHeaders = use(EmailHeaders, headersObject);
      if (emailHeaders.ok) {
        resolve(ok(emailHeaders.result));
      } else {
        resolve(err(new Error(emailHeaders.error.reason)));
      }
      // TODO: Is it possible to `mailParser.destroy()` once we're done processing the headers?
    });

    mailParser.on("end", () => {
      if (!readHeaders) {
        resolve(err(new Error("No headers read")));
      }
    });
  });

  void pipeline(rawEmailObjectStream, mailParser);

  return await headersPromise;
}

async function uploadEmailAttachment(
  s3Client: S3Client,
  sourceBucket: string,
  sourceKey: string,
  emailHeaders: EmailHeaders,
  requestId: string
): Promise<UploadEmailAttachmentResult> {
  const emailReadStreamResult = await createS3ObjectReadStream(s3Client, sourceBucket, sourceKey);
  if (emailReadStreamResult.isErr()) {
    return err(emailReadStreamResult.error);
  }

  const attachmentParserStream = new MailParser();
  const attachmentReadStreamPromise = createAttachmentReadStreamPromise(attachmentParserStream);

  void pipeline(emailReadStreamResult.value, attachmentParserStream);

  const attachmentReadStreamResult = await attachmentReadStreamPromise;
  if (attachmentReadStreamResult.isErr()) {
    return err(attachmentReadStreamResult.error);
  }

  const attachmentWriteStream = createS3UploadWriteStream(
    s3Client,
    {
      bucket: envVariables.S3_BUCKET,
      contentType: "application/pdf",
      key: `${envVariables.S3_PREFIX_ATTACHMENT}/${requestId}`,
      readStream: attachmentReadStreamResult.value
    },
    getMetadataFromEmailHeaders(emailHeaders)
  );
  try {
    return ok(await attachmentWriteStream.done());
  } catch (error: unknown) {
    return wrapError(error);
  }
}

function createAttachmentReadStreamPromise(attachmentParserStream: MailParser): Promise<Result<Transform, Error>> {
  return new Promise((resolve) => {
    let readAttachment = false;

    // @types/mailparser's function overloads for the "data" event callback are in the wrong order, so the
    // correct overload is not selected. To fix this, I've specified the correct types for the `data` argument.
    attachmentParserStream.on("data", (data: AttachmentStream | MessageText) => {
      if (data.type === "attachment") {
        readAttachment = true;

        data.content.on("end", () => {
          data.release();
        });

        // @types/mailparser types `data.content` as a `Stream`, but in the current case, it can more specifically
        // be typed as a `Transform`. See:
        //   https://github.com/nodemailer/mailparser/blob/b6bba6edd16de30c57566d776b59675c24ed7064/lib/mail-parser.js#L819
        resolve(ok(data.content as Transform));
      }
    });

    attachmentParserStream.on("end", () => {
      if (!readAttachment) {
        resolve(err(new Error("No attachment read by end of attachment parser stream")));
      }
    });
  });
}

function getMetadataFromEmailHeaders(headers: EmailHeaders): UploadMetadata {
  return {
    date: headers.date,
    from: headers.from.value[0].address,
    subject: headers.subject,
    to: headers.to.value[0].address
  };
}

async function createS3ObjectReadStream(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<Result<Readable, Error>> {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  try {
    const getObjectCommandOutput = await s3Client.send(getObjectCommand);

    if (getObjectCommandOutput.Body instanceof Readable) {
      return ok(getObjectCommandOutput.Body);
    } else {
      return err(new Error("Invalid type of 'getObjectCommandOutput.Body'"));
    }
  } catch (error: unknown) {
    return wrapError(error);
  }
}

function createS3UploadWriteStream(
  s3Client: S3Client,
  uploadConfig: UploadConfig,
  uploadMetadata: UploadMetadata
): Upload {
  return new Upload({
    client: s3Client,
    params: {
      Body: uploadConfig.readStream,
      Bucket: uploadConfig.bucket,
      ContentType: uploadConfig.contentType,
      Key: uploadConfig.key,
      Metadata: uploadMetadata
    }
  });
}
