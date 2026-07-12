import type { CurrencyTotals } from "./subscription-metrics";

const exchangeRateUrl = "https://60s.pixidou.com/v2/exchange-rate";
const cacheKey = "life-tools:60s-exchange-rates";
export const exchangeRateCacheMaxAge = 7 * 24 * 60 * 60 * 1000;

export type ExchangeRateSnapshot = {
  ratesPerCny: Record<string, number>;
  asOf: string;
  cachedAt: number;
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

type ExchangeRateResponse = {
  code?: number;
  data?: {
    base_code?: string;
    updated?: string;
    rates?: Array<{ currency?: string; rate?: number }>;
  };
};

function browserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function parse60sExchangeRates(
  payload: ExchangeRateResponse,
  cachedAt = Date.now(),
): ExchangeRateSnapshot {
  if (payload.code !== 200 || payload.data?.base_code !== "CNY" || !payload.data.rates) {
    throw new Error("60s 汇率数据格式无效");
  }

  const ratesPerCny: Record<string, number> = {};
  payload.data.rates.forEach(({ currency, rate }) => {
    if (!currency || typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) return;
    ratesPerCny[currency] = rate;
  });

  if (ratesPerCny.CNY !== 1) throw new Error("60s 汇率缺少人民币基准");
  return { ratesPerCny, asOf: payload.data.updated ?? "", cachedAt };
}

export async function fetchExchangeRates(): Promise<ExchangeRateSnapshot> {
  const response = await fetch(exchangeRateUrl);
  if (!response.ok) throw new Error(`60s 汇率请求失败：${response.status}`);
  const snapshot = parse60sExchangeRates((await response.json()) as ExchangeRateResponse);
  saveExchangeRates(snapshot);
  return snapshot;
}

export function saveExchangeRates(snapshot: ExchangeRateSnapshot, storage = browserStorage()) {
  try {
    storage?.setItem(cacheKey, JSON.stringify(snapshot));
  } catch {
    // A successful network response remains usable even when browser storage is unavailable.
  }
}

export function loadExchangeRates(storage = browserStorage(), now = Date.now()) {
  let value: string | null | undefined;
  try {
    value = storage?.getItem(cacheKey);
  } catch {
    return null;
  }
  if (!value) return null;
  try {
    const snapshot = JSON.parse(value) as ExchangeRateSnapshot;
    if (
      snapshot.ratesPerCny?.CNY !== 1 ||
      !Number.isFinite(snapshot.cachedAt) ||
      now - snapshot.cachedAt > exchangeRateCacheMaxAge
    ) {
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}

export function convertCurrencyTotalsToCny(
  totals: CurrencyTotals,
  snapshot: ExchangeRateSnapshot | null | undefined,
) {
  let totalCny = 0;
  for (const [currency, amount] of Object.entries(totals)) {
    if (currency === "CNY") {
      totalCny += amount;
      continue;
    }
    const sourceRate = snapshot?.ratesPerCny[currency];
    if (
      typeof sourceRate !== "number" ||
      !Number.isFinite(sourceRate) ||
      sourceRate <= 0
    ) {
      return null;
    }
    totalCny += amount / sourceRate;
  }
  return totalCny;
}

export function formatCompactCny(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}
