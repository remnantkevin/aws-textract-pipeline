import { createError, runtype, use } from "simple-runtypes";

export const DateRuntype = runtype((v) => {
  if (v instanceof Date) {
    return v;
  } else {
    return createError("must be a Date");
  }
});

export const DateAsString = runtype((v) => {
  const dateCheck = use(DateRuntype, v);

  if (!dateCheck.ok) {
    return dateCheck.error;
  }

  return dateCheck.result.toString();
});
