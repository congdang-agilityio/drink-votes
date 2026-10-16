import { config } from "../config.js";
import { todayIn } from "../lib/time.js";

export const VENUES_MESSAGE = "Cần chọn ít nhất 2 quán.";
export const PAST_DATE_MESSAGE = "Ngày không được ở trong quá khứ.";
export const CLOSE_TIME_MESSAGE = "Giờ chốt phải trước giờ ngồi.";

export interface NewOutingInput {
  date: string;
  sitTime: string;
  closeTime: string;
  venueIds: ReadonlyArray<string | number>;
}

export type OutingValidation =
  | { ok: true }
  | { ok: false; errors: { venues?: string; date?: string; closeTime?: string } };

/** Checks a new outing against BR-12. Strings are zero-padded, so lexical order works. */
export function validateNewOuting(
  input: NewOutingInput,
  { tz = config.appTz, now = new Date() }: { tz?: string; now?: Date } = {},
): OutingValidation {
  const errors: { venues?: string; date?: string; closeTime?: string } = {};
  if (new Set(input.venueIds).size < 2) errors.venues = VENUES_MESSAGE;
  if (input.date < todayIn(tz, now)) errors.date = PAST_DATE_MESSAGE;
  if (input.closeTime >= input.sitTime) errors.closeTime = CLOSE_TIME_MESSAGE;
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true };
}
