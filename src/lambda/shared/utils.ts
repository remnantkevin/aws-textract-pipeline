import { err } from "neverthrow";
import type { Err } from "neverthrow";

export function log(error: unknown, customMessage?: string): void {
  if (customMessage) {
    console.log(customMessage);
  }

  if (error instanceof Error) {
    console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)));
  } else {
    console.log(error);
  }
}

export function wrapError(error: unknown): Err<never, Error> {
  if (error instanceof Error) {
    return err(error);
  } else if (typeof error === "string") {
    return err(new Error(error));
  } else {
    return err(new Error("Failed to upload"));
  }
}

export function getType(value: unknown): string {
  if (value === null) {
    return "null";
  } else if (value === undefined) {
    return "undefined";
  } else if (value instanceof Object) {
    return value.constructor.name.toLowerCase();
  } else {
    return typeof value;
  }
}
