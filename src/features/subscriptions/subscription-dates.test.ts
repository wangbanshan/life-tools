import { describe, expect, it } from "vitest";
import type { Subscription } from "./subscription-data";
import {
  addBillingPeriods,
  getOccurrencesInRange,
  getUpcomingOccurrences,
} from "./subscription-dates";
import { getEstimatedTotals } from "./subscription-metrics";

function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "subscription-1",
    providerKey: "chatgpt",
    name: "ChatGPT",
    category: "ai",
    planName: "Plus",
    note: "",
    amount: 20,
    currency: "USD",
    billingIntervalCount: 1,
    billingIntervalUnit: "month",
    trackingStartedOn: "2026-01-31",
    renewalAnchorOn: "2026-01-31",
    reminderOffsets: [0, 7],
    status: "active",
    archivedOn: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("subscription recurrence", () => {
  it("keeps a month-end anchor instead of drifting after February", () => {
    expect(addBillingPeriods("2026-01-31", 1, 1, "month")).toBe("2026-02-28");
    expect(addBillingPeriods("2026-01-31", 2, 1, "month")).toBe("2026-03-31");
  });

  it("clamps leap-day yearly renewals only in non-leap years", () => {
    expect(addBillingPeriods("2024-02-29", 1, 1, "year")).toBe("2025-02-28");
    expect(addBillingPeriods("2024-02-29", 4, 1, "year")).toBe("2028-02-29");
  });

  it("supports custom day intervals across month boundaries", () => {
    expect(addBillingPeriods("2026-01-28", 1, 10, "day")).toBe("2026-02-07");
  });

  it("stops archived subscription occurrences at the archive date", () => {
    const archived = makeSubscription({ status: "archived", archivedOn: "2026-03-15" });
    expect(getOccurrencesInRange(archived, "2026-01-01", "2026-04-30").map((item) => item.date)).toEqual([
      "2026-01-31",
      "2026-02-28",
    ]);
  });
});

describe("upcoming subscriptions", () => {
  it("shows all renewals in the upcoming window regardless of reminder offsets", () => {
    const sevenDaysAway = makeSubscription({ id: "future", renewalAnchorOn: "2026-07-17", trackingStartedOn: "2026-07-01" });
    const unselectedDay = makeSubscription({ id: "tomorrow", renewalAnchorOn: "2026-07-11", trackingStartedOn: "2026-07-01" });
    expect(getUpcomingOccurrences([sevenDaysAway, unselectedDay], "2026-07-10").map((item) => item.id)).toEqual([
      "tomorrow:2026-07-11",
      "future:2026-07-17",
    ]);
  });
});

describe("subscription estimates", () => {
  it("keeps different currencies separate and estimates current periods", () => {
    const cnyMonthly = makeSubscription({
      id: "cny",
      amount: 10,
      currency: "CNY",
      trackingStartedOn: "2026-01-15",
      renewalAnchorOn: "2026-01-15",
    });
    const usdYearly = makeSubscription({
      id: "usd",
      amount: 20,
      currency: "USD",
      billingIntervalUnit: "year",
      trackingStartedOn: "2025-06-01",
      renewalAnchorOn: "2025-06-01",
    });
    expect(getEstimatedTotals([cnyMonthly, usdYearly], "2026-03-10")).toEqual({
      monthly: { CNY: 10 },
      yearly: { CNY: 120, USD: 20 },
    });
  });
});
