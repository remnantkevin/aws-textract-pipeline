import { record, string } from "simple-runtypes";
import config from "../env.config.js";

const Config = record({
  EMAIL_RECEIVING_EMAIL_ADDRESS: string({ match: /@/, minLength: 1 }),
  S3_PREFIX_ATTACHMENT: string({ minLength: 1 }),
  S3_PREFIX_RAW_EMAIL: string({ minLength: 1 }),
  S3_PREFIX_TEXT_DETECTION_RESULT: string({ minLength: 1 })
});

export const envConfig = Config(config);
