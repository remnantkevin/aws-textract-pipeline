import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import type { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { deepmerge } from "deepmerge-ts";

const DEFAULT_LAMBDA_TIMEOUT_SECONDS = 3;

function getDefaultLambdaProps(): Partial<NodejsFunctionProps> {
  return {
    architecture: lambda.Architecture.ARM_64,
    bundling: {
      externalModules: ["aws-sdk"],
      mainFields: ["module", "main"], // prefer ESM over CJS
      minify: true,
      sourceMap: true,
      sourceMapMode: lambdaNodeJS.SourceMapMode.DEFAULT,
      sourcesContent: false
    },
    environment: {
      NODE_OPTIONS: "--enable-source-maps" // use source maps in logs
    },
    handler: "main",
    memorySize: 128,
    reservedConcurrentExecutions: 1,
    retryAttempts: 0,
    runtime: lambda.Runtime.NODEJS_16_X,
    timeout: cdk.Duration.seconds(DEFAULT_LAMBDA_TIMEOUT_SECONDS)
  };
}

export function lambdaProps(overrides: Partial<NodejsFunctionProps>): NodejsFunctionProps {
  return deepmerge(getDefaultLambdaProps(), overrides);
}
