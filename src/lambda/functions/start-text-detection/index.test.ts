/* eslint-disable @typescript-eslint/no-magic-numbers */
import { StartDocumentTextDetectionCommand, TextractClient } from "@aws-sdk/client-textract";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EnvironmentVariables } from "./runtypes.js";
import { generateS3PutEvent } from "./test-helpers/test-events.js";
import { main } from "./index.js";

const TextractClientMock = mockClient(TextractClient);

vi.mock("node:process", () => {
  const env: EnvironmentVariables = {
    IAM_ROLE_ARN_TEXTRACT_PUBLISH_TO_SNS_TOPIC: "iam-role-arn-textract-publish-to-sns-topic",
    S3_BUCKET: "s3-bucket",
    S3_PREFIX_TEXT_DETECTION_RESULT: "s3-prefix-text-detection-result/",
    SNS_TOPIC_ARN_COMPLETION_STATUS: "sns-topic-arn-completion-status"
  };

  return {
    env
  };
});

beforeEach(() => {
  TextractClientMock.reset();
  TextractClientMock.on(StartDocumentTextDetectionCommand).resolvesOnce({ JobId: "job-id" });
});

describe("when attachment file is added to S3 bucket", () => {
  it("starts Textract text detection job", async () => {
    const event = generateS3PutEvent();

    const response = await main(event);

    expect(response).toStrictEqual({ JobId: "job-id", success: true });
    expect(TextractClientMock.calls()).toHaveLength(1);
    expect(TextractClientMock.commandCalls(StartDocumentTextDetectionCommand)).toHaveLength(1);
    expect(TextractClientMock.commandCalls(StartDocumentTextDetectionCommand)[0].args[0].input).toStrictEqual({
      DocumentLocation: {
        S3Object: {
          Bucket: event.Records[0].s3.bucket.name,
          Name: event.Records[0].s3.object.key
        }
      },
      NotificationChannel: {
        RoleArn: "iam-role-arn-textract-publish-to-sns-topic",
        SNSTopicArn: "sns-topic-arn-completion-status"
      },
      OutputConfig: {
        S3Bucket: "s3-bucket",
        S3Prefix: "s3-prefix-text-detection-result"
      }
    });
  });
});
