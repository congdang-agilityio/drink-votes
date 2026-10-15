export const NAME_REQUIRED_MESSAGE = "Vui lòng nhập tên quán.";
export const ADDRESS_REQUIRED_MESSAGE = "Vui lòng nhập địa chỉ.";
export const DUPLICATE_VENUE_NAME_MESSAGE = "Đã có quán với tên này.";

export interface NewVenueInput {
  name?: string;
  address?: string;
  mapsUrl?: string;
  notes?: string;
}

export type VenueValidation =
  | { ok: true }
  | { ok: false; errors: { name?: string; address?: string } };

const isBlank = (value: unknown): boolean =>
  typeof value !== "string" || value.trim() === "";

/** Checks required venue fields. The Maps link and notes are never checked. */
export function validateNewVenue(input: NewVenueInput): VenueValidation {
  const errors: { name?: string; address?: string } = {};
  if (isBlank(input.name)) errors.name = NAME_REQUIRED_MESSAGE;
  if (isBlank(input.address)) errors.address = ADDRESS_REQUIRED_MESSAGE;
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true };
}
