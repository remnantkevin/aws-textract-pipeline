import { array, sloppyRecord, string } from "simple-runtypes";
import { dateAsString } from "../../shared/runtype-factories.js";

export const EnvironmentVariables = sloppyRecord({
  S3_BUCKET: string({ minLength: 1 }),
  S3_PREFIX_ATTACHMENT: string({ match: /\/$/, minLength: 2 })
});
export type EnvironmentVariables = ReturnType<typeof EnvironmentVariables>;

const Email = string({ match: /@/, minLength: 3 });

export const EmailAddress = sloppyRecord({ address: Email });

// TODO: validate MIME type
export const EmailHeaders = sloppyRecord({
  date: dateAsString(),
  from: sloppyRecord({ value: array(EmailAddress) }),
  subject: string({ minLength: 1 }),
  to: sloppyRecord({ value: array(EmailAddress) })
});
export type EmailHeaders = ReturnType<typeof EmailHeaders>;
