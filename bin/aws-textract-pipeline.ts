#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { AwsTextractPipelineStack } from "../lib/aws-textract-pipeline-stack";

const app = new cdk.App();
new AwsTextractPipelineStack(app, "AwsTextractPipelineStack", {
  env: { region: "us-east-1" },
});
