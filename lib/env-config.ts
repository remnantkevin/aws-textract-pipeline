import { cleanEnv, email } from "envalid";
import config from "../env.config";

export const envConfig = cleanEnv(config, {
  EMAIL_RECEIVING_EMAIL_ADDRESS: email(),
});
