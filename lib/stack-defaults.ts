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
    // Try to ensure mistakes in lambda function configurations don't lead to large lambda runtime costs by restricting
    // the number of current executions of any given function to 1.
    //
    // NOTE: In order to use this option, your "ConcurrentExecutions" account limit needs to be larger than 100, because
    //       the minimum "UnreservedConcurrentExecutions" is 100 and reserved concurrency is taken from the account's
    //       total "ConcurrentExecutions". For example, if your "ConcurrentExecutions" account limit is 101, then you
    //       will be able to use a `reservedConcurrentExecutions` of 1 on one lambda function.
    //       For more details, see:
    //         - https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    //         - https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html
    //         - https://docs.aws.amazon.com/lambda/latest/dg/invocation-scaling.html
    //         - https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html
    reservedConcurrentExecutions: 1,
    retryAttempts: 0,
    runtime: lambda.Runtime.NODEJS_16_X,
    timeout: cdk.Duration.seconds(DEFAULT_LAMBDA_TIMEOUT_SECONDS)
  };
}

export function lambdaProps(overrides: Partial<NodejsFunctionProps>): NodejsFunctionProps {
  return deepmerge(getDefaultLambdaProps(), overrides);
}
