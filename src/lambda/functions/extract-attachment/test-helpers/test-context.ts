import type { Context } from "aws-lambda";

export function generateContext(): Context {
  return {
    awsRequestId: "aws-request-id-test",
    callbackWaitsForEmptyEventLoop: true,
    done() {}, // eslint-disable-line @typescript-eslint/no-empty-function
    fail() {}, // eslint-disable-line @typescript-eslint/no-empty-function
    functionName: "",
    functionVersion: "",
    getRemainingTimeInMillis() {
      return 1; // eslint-disable-line @typescript-eslint/no-magic-numbers
    },
    invokedFunctionArn: "",
    logGroupName: "",
    logStreamName: "",
    memoryLimitInMB: "",
    succeed() {} // eslint-disable-line @typescript-eslint/no-empty-function
  };
}
