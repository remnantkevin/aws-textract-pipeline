import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ses from "aws-cdk-lib/aws-ses";
import * as sesActions from "aws-cdk-lib/aws-ses-actions";
import { Construct } from "constructs";

/*
  It is assumed that there is already a Route 53 domain and hosted zone, and a verified
  SES domain, available in the environment this stack is deployed to.

  The `EMAIL_RECEIVING_EMAIL_ADDRESS` stack prop needs to be an email address that uses
  the verified SES domain.
*/

interface AwsTextractPipelineStackProps extends cdk.StackProps {
  EMAIL_RECEIVING_EMAIL_ADDRESS: string;
}

export class AwsTextractPipelineStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: AwsTextractPipelineStackProps
  ) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "bucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(7),
        },
      ],
    });

    const emailReceivingRuleSet = new ses.ReceiptRuleSet(this, "rule-set", {
      rules: [
        {
          recipients: [props.EMAIL_RECEIVING_EMAIL_ADDRESS],
          enabled: true,
          scanEnabled: true,
          tlsPolicy: ses.TlsPolicy.REQUIRE,
          actions: [
            new sesActions.S3({ bucket, objectKeyPrefix: "raw-email" }),
          ],
        },
      ],
    });
  }
}
