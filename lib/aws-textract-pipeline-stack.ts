/* eslint-disable @typescript-eslint/no-magic-numbers */

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ses from "aws-cdk-lib/aws-ses";
import * as sesActions from "aws-cdk-lib/aws-ses-actions";
import * as sns from "aws-cdk-lib/aws-sns";
import type { Construct } from "constructs";
import { lambdaProps } from "./stack-defaults.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AwsTextractPipelineStackProps = cdk.StackProps & {
  /**
   * The email address that receives the email which triggers the text extraction pipeline.
   *
   * The email address must use a verified SES domain, and it is assumed that there is already
   * a Route 53 domain and hosted zone available in the environment this stack is deployed to.
   */
  EMAIL_RECEIVING_EMAIL_ADDRESS: string;
  S3_PREFIX_ATTACHMENT: string;
  S3_PREFIX_RAW_EMAIL: string;
  S3_PREFIX_TEXT_DETECTION_RESULT: string;
};

export class AwsTextractPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsTextractPipelineStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "bucket", {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(7)
        }
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // eslint-disable-next-line unused-imports/no-unused-vars
    const emailReceivingRuleSet = new ses.ReceiptRuleSet(this, "rule-set", {
      rules: [
        {
          actions: [new sesActions.S3({ bucket, objectKeyPrefix: props.S3_PREFIX_RAW_EMAIL })],
          enabled: true,
          recipients: [props.EMAIL_RECEIVING_EMAIL_ADDRESS],
          scanEnabled: true,
          tlsPolicy: ses.TlsPolicy.REQUIRE
        }
      ]
    });

    const extractAttachmentFunction = new lambdaNodeJS.NodejsFunction(
      this,
      "extract-attachment",
      lambdaProps({
        entry: path.join(__dirname, "../src/lambda/functions/extract-attachment/index.ts"),
        environment: {
          S3_BUCKET: bucket.bucketName,
          S3_PREFIX_ATTACHMENT: props.S3_PREFIX_ATTACHMENT
        },
        timeout: cdk.Duration.minutes(1) // downloading the raw email and uploading the attachment can take a while
      })
    );

    extractAttachmentFunction.addEventSource(
      new lambdaEventSources.S3EventSource(bucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: `${props.S3_PREFIX_RAW_EMAIL}/` }]
      })
    );

    extractAttachmentFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        resources: [bucket.arnForObjects(`${props.S3_PREFIX_RAW_EMAIL}/*`)]
      })
    );

    extractAttachmentFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:PutObject"],
        effect: iam.Effect.ALLOW,
        resources: [bucket.arnForObjects(`${props.S3_PREFIX_ATTACHMENT}/*`)]
      })
    );

    const textractPublishCompletionRole = new iam.Role(this, "allow-textract-to-publish-completion", {
      assumedBy: new iam.ServicePrincipal("textract.amazonaws.com")
    });

    const textDetectionCompleteTopic = new sns.Topic(this, "text-detection-complete-topic");
    textDetectionCompleteTopic.grantPublish(textractPublishCompletionRole);

    const startTextDetectionFunction = new lambdaNodeJS.NodejsFunction(
      this,
      "start-text-detection",
      lambdaProps({
        entry: path.join(__dirname, "../src/lambda/functions/start-text-detection/index.ts"),
        environment: {
          IAM_ROLE_ARN_TEXTRACT_PUBLISH_TO_SNS_TOPIC: textractPublishCompletionRole.roleArn,
          S3_BUCKET: bucket.bucketName,
          S3_PREFIX_TEXT_DETECTION_RESULT: props.S3_PREFIX_TEXT_DETECTION_RESULT,
          SNS_TOPIC_ARN_COMPLETION_STATUS: textDetectionCompleteTopic.topicArn
        }
      })
    );

    startTextDetectionFunction.addEventSource(
      new lambdaEventSources.S3EventSource(bucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: props.S3_PREFIX_ATTACHMENT }]
      })
    );

    // TODO: does the function's execution role need s3 get and put access (because textract will get and
    // store in s3); or does textract service need the permission? see also TestingTextractAllowStartDetectionPolicy in iam on admin account
    //
    // or is it om the s3 bucket policy side?
    startTextDetectionFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:StartDocumentTextDetection"],
        effect: iam.Effect.ALLOW,
        resources: ["*"]
      })
    );
  }
}
