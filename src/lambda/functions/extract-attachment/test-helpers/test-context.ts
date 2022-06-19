import { Context } from "aws-lambda";

export function generateContext(): Context {
  return {
    awsRequestId: "aws-request-id-test",
    callbackWaitsForEmptyEventLoop: true,
    functionName: "",
    functionVersion: "",
    invokedFunctionArn: "",
    logGroupName: "",
    logStreamName: "",
    memoryLimitInMB: "",
    getRemainingTimeInMillis() {
      return 1;
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    done() {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    fail() {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    succeed() {}
  };
}
