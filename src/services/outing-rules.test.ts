import { describe, expect, it } from "vitest";
import { validateNewOuting } from "./outing-rules.js";

const VENUES = "Cần chọn ít nhất 2 quán.";
const DATE = "Ngày không được ở trong quá khứ.";
const CLOSE = "Giờ chốt phải trước giờ ngồi.";
// 2026-10-15 10:00 Vietnam time
const now = new Date("2026-10-15T03:00:00Z");
const base = { date: "2026-10-15", sitTime: "18:30", closeTime: "16:00", venueIds: [1, 2] };

describe("validateNewOuting", () => {
  it("accepts a valid outing", () => {
    expect(validateNewOuting(base, { now })).toEqual({ ok: true });
  });

  it.each([[[]], [[1]], [[1, 1]]])("refuses venues %j", (venueIds) => {
    expect(validateNewOuting({ ...base, venueIds }, { now })).toEqual({
      ok: false,
      errors: { venues: VENUES },
    });
  });

  it("refuses a past date and accepts today", () => {
    expect(validateNewOuting({ ...base, date: "2026-10-14" }, { now })).toEqual({
      ok: false,
      errors: { date: DATE },
    });
    expect(validateNewOuting({ ...base, date: "2026-10-15" }, { now })).toEqual({ ok: true });
  });

  it("uses Vietnam time for today", () => {
    const late = new Date("2026-10-14T20:00:00Z");
    expect(validateNewOuting({ ...base, date: "2026-10-15" }, { now: late })).toEqual({ ok: true });
    expect(validateNewOuting({ ...base, date: "2026-10-14" }, { now: late })).toEqual({
      ok: false,
      errors: { date: DATE },
    });
  });

  it.each(["18:30", "19:00"])("refuses close time %s", (closeTime) => {
    expect(validateNewOuting({ ...base, closeTime }, { now })).toEqual({
      ok: false,
      errors: { closeTime: CLOSE },
    });
  });

  it("accepts a close time already passed today", () => {
    expect(validateNewOuting({ ...base, closeTime: "08:00" }, { now })).toEqual({ ok: true });
  });

  it("returns several errors at once", () => {
    expect(
      validateNewOuting(
        { date: "2026-10-01", sitTime: "18:30", closeTime: "19:00", venueIds: [1] },
        { now },
      ),
    ).toEqual({ ok: false, errors: { venues: VENUES, date: DATE, closeTime: CLOSE } });
  });
});
