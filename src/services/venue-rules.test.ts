import { describe, expect, it } from "vitest";
import { DUPLICATE_VENUE_NAME_MESSAGE, validateNewVenue } from "./venue-rules.js";

const NAME_MSG = "Vui lòng nhập tên quán.";
const ADDRESS_MSG = "Vui lòng nhập địa chỉ.";

describe("validateNewVenue", () => {
  it.each([undefined, "", "   "])("refuses name %j", (name) => {
    const r = validateNewVenue({ name: name as string, address: "1 Lê Lợi" });
    expect(r).toEqual({ ok: false, errors: { name: NAME_MSG } });
  });

  it.each([undefined, "", "   "])("refuses address %j", (address) => {
    const r = validateNewVenue({ name: "Quán Ốc Đào", address: address as string });
    expect(r).toEqual({ ok: false, errors: { address: ADDRESS_MSG } });
  });

  it("returns both errors together", () => {
    const r = validateNewVenue({ name: "", address: " " });
    expect(r).toEqual({ ok: false, errors: { name: NAME_MSG, address: ADDRESS_MSG } });
  });

  it("does not check the Maps link", () => {
    expect(
      validateNewVenue({ name: "Quán Ốc Đào", address: "1 Lê Lợi", mapsUrl: "not a link" }),
    ).toEqual({ ok: true });
  });

  it("accepts name and address only", () => {
    expect(validateNewVenue({ name: "Quán Ốc Đào", address: "1 Lê Lợi" })).toEqual({ ok: true });
  });

  it("exports the duplicate-name message", () => {
    expect(DUPLICATE_VENUE_NAME_MESSAGE).toBe("Đã có quán với tên này.");
  });
});
