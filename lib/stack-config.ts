import { record, string } from "simple-runtypes";
import config from "../env.config.js";

const Config = record({ EMAIL_RECEIVING_EMAIL_ADDRESS: string({ minLength: 1, match: /@/ }) });

export const envConfig = Config(config);
