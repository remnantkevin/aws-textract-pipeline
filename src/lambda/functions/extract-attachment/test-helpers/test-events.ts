import type { S3CreateEvent } from "aws-lambda";

export function generateS3PutEvent(): S3CreateEvent {
  return {
    Records: [
      {
        awsRegion: "us-east-1",
        eventName: "ObjectCreated:Put",
        eventSource: "aws:s3",
        eventTime: "1970-01-01T00:00:00.000Z",
        eventVersion: "2.0",
        requestParameters: {
          sourceIPAddress: "127.0.0.1"
        },
        responseElements: {
          "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH",
          "x-amz-request-id": "EXAMPLE123456789"
        },
        s3: {
          bucket: {
            arn: "arn:aws:s3:::example-bucket",
            name: "example-bucket",
            ownerIdentity: {
              principalId: "EXAMPLE"
            }
          },
          configurationId: "testConfigRule",
          object: {
            eTag: "0123456789abcdef0123456789abcdef",
            key: "test/key",
            sequencer: "0A1B2C3D4E5F678901",
            size: 1024
          },
          s3SchemaVersion: "1.0"
        },
        userIdentity: {
          principalId: "EXAMPLE"
        }
      }
    ]
  };
}
