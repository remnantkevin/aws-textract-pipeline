import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient, mockLibStorageUpload } from "aws-sdk-client-mock";
import { Buffer } from "node:buffer";
import { createReadStream } from "node:fs";
import * as path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { main } from "./index.js";
import { EnvironmentVariables } from "./runtypes.js";
import { generateContext } from "./test-helpers/test-context.js";
import { generateS3PutEvent } from "./test-helpers/test-events.js";

const S3ClientMock = mockClient(S3Client);
mockLibStorageUpload(S3ClientMock);

vi.mock("process", () => {
  const env: EnvironmentVariables = {
    S3_BUCKET_FOR_ATTACHMENT: "bucket-name-test",
    S3_PREFIX_FOR_ATTACHMENT: "prefix-name-test/"
  };

  return {
    env
  };
});

beforeEach(() => {
  S3ClientMock.reset();
  S3ClientMock.on(GetObjectCommand)
    .resolvesOnce({ Body: createReadStream(path.join(__dirname, "test-helpers/test-raw-email")) })
    .resolvesOnce({ Body: createReadStream(path.join(__dirname, "test-helpers/test-raw-email")) });
});

describe("when email has an attachment", () => {
  it("uploads attachment to S3", async () => {
    const event = generateS3PutEvent();
    const context = generateContext();

    const response = await main(event, context);

    expect(response).toStrictEqual({ success: true });

    expect(S3ClientMock.calls()).toHaveLength(3);

    expect(S3ClientMock.commandCalls(GetObjectCommand)).toHaveLength(2);
    expect(S3ClientMock.commandCalls(GetObjectCommand)[0].args[0].input).toStrictEqual({
      Bucket: event.Records[0].s3.bucket.name,
      Key: event.Records[0].s3.object.key
    });
    expect(S3ClientMock.commandCalls(GetObjectCommand)[1].args[0].input).toStrictEqual({
      Bucket: event.Records[0].s3.bucket.name,
      Key: event.Records[0].s3.object.key
    });

    expect(S3ClientMock.commandCalls(PutObjectCommand)).toHaveLength(1);
    expect(S3ClientMock.commandCalls(PutObjectCommand)[0].args[0].input).toMatchObject({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      Body: expect.any(Buffer),
      Bucket: "bucket-name-test",
      Key: `prefix-name-test/${context.awsRequestId}`,
      ContentType: "application/pdf",
      Metadata: {
        from: "testing@gmail.com",
        to: "textract@email.com",
        subject: "Test subject 1",
        date: "Mon Jun 13 2022 08:07:59 GMT+0000 (Coordinated Universal Time)"
      }
    });
  });
});
