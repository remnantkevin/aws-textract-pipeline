import { sloppyRecord, string } from "simple-runtypes";

export const EnvironmentVariables = sloppyRecord({
  IAM_ROLE_ARN_TEXTRACT_PUBLISH_TO_SNS_TOPIC: string({ minLength: 1 }),
  S3_BUCKET: string({ minLength: 1 }),
  S3_PREFIX_TEXT_DETECTION_RESULT: string({ minLength: 1 }),
  SNS_TOPIC_ARN_COMPLETION_STATUS: string({ minLength: 1 })
});
export type EnvironmentVariables = ReturnType<typeof EnvironmentVariables>;
