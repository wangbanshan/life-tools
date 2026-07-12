import { describe, expect, it } from "vitest";
import {
  convertCurrencyTotalsToCny,
  exchangeRateCacheMaxAge,
  formatCompactCny,
  loadExchangeRates,
  parse60sExchangeRates,
  saveExchangeRates,
} from "./exchange-rates";

const exchangeRatePayload = {
  code: 200,
  data: {
    base_code: "CNY",
    updated: "2026/07/12 08:02:31",
    updated_at: 1_783_814_551_000,
    rates: [
      { currency: "CNY", rate: 1 },
      { currency: "USD", rate: 0.15 },
    ],
  },
};

describe("60s exchange rates", () => {
  it("parses CNY-based rates and converts mixed totals to CNY", () => {
    const snapshot = parse60sExchangeRates(exchangeRatePayload, 1_000);
    expect(snapshot).toEqual({
      ratesPerCny: { CNY: 1, USD: 0.15 },
      asOf: "2026/07/12 08:02:31",
      cachedAt: 1_000,
    });
    expect(convertCurrencyTotalsToCny({ CNY: 20, USD: 120 }, snapshot)).toBeCloseTo(820);
  });

  it("returns null when a required exchange rate is unavailable", () => {
    const snapshot = parse60sExchangeRates(exchangeRatePayload, 1_000);
    expect(convertCurrencyTotalsToCny({ HKD: 100 }, snapshot)).toBeNull();
  });

  it("uses a seven-day cache and rejects expired data", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const snapshot = parse60sExchangeRates(exchangeRatePayload, 1_000);
    saveExchangeRates(snapshot, storage);
    expect(loadExchangeRates(storage, 1_000 + exchangeRateCacheMaxAge)).toEqual(snapshot);
    expect(loadExchangeRates(storage, 1_001 + exchangeRateCacheMaxAge)).toBeNull();
  });

  it("formats large annual totals with a compact CNY unit", () => {
    expect(formatCompactCny(12_800)).toContain("1.28万");
  });
});
