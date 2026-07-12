import type { Subscription } from "./subscription-data";
import { getMonthGridRange, getOccurrencesInRange, parseDateOnly } from "./subscription-dates";

export type CurrencyTotals = Record<string, number>;

function addAmount(totals: CurrencyTotals, currency: string, amount: number) {
  totals[currency] = (totals[currency] ?? 0) + amount;
}

export function getEstimatedTotals(subscriptions: Subscription[], today: string) {
  const todayDate = parseDateOnly(today);
  const monthRange = getMonthGridRange(today);
  const yearStart = `${todayDate.getUTCFullYear()}-01-01`;
  const yearEnd = `${todayDate.getUTCFullYear()}-12-31`;
  const monthly: CurrencyTotals = {};
  const yearly: CurrencyTotals = {};

  subscriptions.forEach((subscription) => {
    getOccurrencesInRange(subscription, monthRange.monthStart, monthRange.monthEnd).forEach(() =>
      addAmount(monthly, subscription.currency, subscription.amount),
    );
    getOccurrencesInRange(subscription, yearStart, yearEnd).forEach(() =>
      addAmount(yearly, subscription.currency, subscription.amount),
    );
  });

  return { monthly, yearly };
}

export function formatCurrencyAmount(value: number, currency: string) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
  }).format(value);
}

export function formatCurrencyTotals(totals: CurrencyTotals) {
  const entries = Object.entries(totals).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0) return "—";
  return entries.map(([currency, amount]) => formatCurrencyAmount(amount, currency)).join(" · ");
}
