export const NAME_REQUIRED_MESSAGE = "Vui lòng nhập tên quán.";
export const ADDRESS_REQUIRED_MESSAGE = "Vui lòng nhập địa chỉ.";
export const DUPLICATE_VENUE_NAME_MESSAGE = "Đã có quán với tên này.";

/** Upper bounds (characters) for venue fields: the shared list must stay readable. */
export const VENUE_FIELD_MAX_LENGTH = {
  name: 100,
  address: 200,
  mapsUrl: 2048,
  notes: 500,
} as const;

export type VenueField = keyof typeof VENUE_FIELD_MAX_LENGTH;

const VENUE_FIELD_LABEL: Record<VenueField, string> = {
  name: "Tên quán",
  address: "Địa chỉ",
  mapsUrl: "Link Google Maps",
  notes: "Ghi chú",
};

/** The Vietnamese message for the first field over its limit, or null when all fit. */
export function venueLengthError(input: Record<VenueField, string>): string | null {
  for (const field of Object.keys(VENUE_FIELD_MAX_LENGTH) as VenueField[]) {
    const max = VENUE_FIELD_MAX_LENGTH[field];
    if (input[field].length > max) return `${VENUE_FIELD_LABEL[field]} tối đa ${max} ký tự.`;
  }
  return null;
}

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
