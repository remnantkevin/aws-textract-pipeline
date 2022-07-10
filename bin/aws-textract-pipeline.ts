#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as sourceMapSupport from "source-map-support";
import { AwsTextractPipelineStack } from "../lib/aws-textract-pipeline-stack.js";
import { envConfig } from "../lib/stack-config.js";

// `npx cdk`, which uses ts-node, does not like the import "source-map-support"/register" version.
// TODO: Check that this is actually working. When I was getting lambda entry point errors, I was seeing
//       bundled CDK code, rather than source maps.
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
sourceMapSupport.install();

const app = new cdk.App();

new AwsTextractPipelineStack(app, "AwsTextractPipelineStack", {
  env: { region: "us-east-1" },
  ...envConfig
});
