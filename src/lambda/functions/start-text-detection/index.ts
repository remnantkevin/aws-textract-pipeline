import * as process from "node:process";
import { StartDocumentTextDetectionCommand, TextractClient } from "@aws-sdk/client-textract";
import type { S3Event } from "aws-lambda";
import { EnvironmentVariables } from "./runtypes";

const textractClient = new TextractClient({});
const envVariables = EnvironmentVariables(process.env);

export async function main(event: S3Event) {
  const sourceBucket = event.Records[0].s3.bucket.name;
  const sourceKey = event.Records[0].s3.object.key;

  const response = await textractClient.send(
    new StartDocumentTextDetectionCommand({
      DocumentLocation: {
        S3Object: {
          Bucket: sourceBucket,
          Name: sourceKey
        }
      },
      NotificationChannel: {
        RoleArn: envVariables.IAM_ROLE_ARN_TEXTRACT_PUBLISH_TO_SNS_TOPIC,
        SNSTopicArn: envVariables.SNS_TOPIC_ARN_COMPLETION_STATUS
      },
      OutputConfig: {
        S3Bucket: envVariables.S3_BUCKET,
        S3Prefix: getTextractOutputConfigS3Prefix(envVariables.S3_PREFIX_TEXT_DETECTION_RESULT)
      }
    })
  );

  return { JobId: response.JobId, success: true };
}

function getTextractOutputConfigS3Prefix(s3Prefix: string): string {
  return s3Prefix.slice(0, s3Prefix.length - 1);
}
