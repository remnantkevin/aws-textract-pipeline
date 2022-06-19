/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ses from "aws-cdk-lib/aws-ses";
import * as sesActions from "aws-cdk-lib/aws-ses-actions";
import type { Construct } from "constructs";

/*
  It is assumed that there is already a Route 53 domain and hosted zone, and a verified
  SES domain, available in the environment this stack is deployed to.

  The `EMAIL_RECEIVING_EMAIL_ADDRESS` stack prop needs to be an email address that uses
  the verified SES domain.
*/

type AwsTextractPipelineStackProps = cdk.StackProps & {
  EMAIL_RECEIVING_EMAIL_ADDRESS: string;
};

const ENVIRONMENT_VARIABLES = {
  S3_PREFIX_FOR_ATTACHMENT: "attachment/"
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

    const emailReceivingRuleSet = new ses.ReceiptRuleSet(this, "rule-set", {
      rules: [
        {
          actions: [new sesActions.S3({ bucket, objectKeyPrefix: "raw-email" })],
          enabled: true,
          recipients: [props.EMAIL_RECEIVING_EMAIL_ADDRESS],
          scanEnabled: true,
          tlsPolicy: ses.TlsPolicy.REQUIRE
        }
      ]
    });

    const extractAttachmentFunction = new lambdaNodeJS.NodejsFunction(this, "extract-attachment", {
      architecture: lambda.Architecture.ARM_64,
      bundling: {
        externalModules: ["aws-sdk"],
        mainFields: ["module", "main"], // prefer ESM over CJS
        minify: true,
        sourceMap: true,
        sourceMapMode: lambdaNodeJS.SourceMapMode.DEFAULT,
        sourcesContent: false
      },
      entry: path.join(__dirname, "../src/lambda/extract-attachment/index.ts"),
      environment: {
        NODE_OPTIONS: "--enable-source-maps", // use source maps in logs
        S3_BUCKET_FOR_ATTACHMENT: bucket.bucketName,
        S3_PREFIX_FOR_ATTACHMENT: ENVIRONMENT_VARIABLES.S3_PREFIX_FOR_ATTACHMENT
      },
      handler: "main",
      memorySize: 128,
      retryAttempts: 0,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.minutes(1) // downloading the raw email and uploading the attachment can take a while
    });
  }
}
