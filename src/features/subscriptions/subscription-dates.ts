import type { BillingUnit, Subscription } from "./subscription-data";

const millisecondsPerDay = 86_400_000;

export type SubscriptionOccurrence = {
  id: string;
  date: string;
  subscription: Subscription;
};

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(date: Date) {
  return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
}

export function todayDateOnly() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

export function addDays(value: string, days: number) {
  const date = parseDateOnly(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateOnly(date);
}

export function differenceInDays(later: string, earlier: string) {
  return Math.round((parseDateOnly(later).getTime() - parseDateOnly(earlier).getTime()) / millisecondsPerDay);
}

export function compareDateOnly(left: string, right: string) {
  return left.localeCompare(right);
}

function daysInUtcMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function addBillingPeriods(anchor: string, steps: number, intervalCount: number, unit: BillingUnit) {
  const date = parseDateOnly(anchor);
  if (unit === "day") {
    date.setUTCDate(date.getUTCDate() + steps * intervalCount);
    return formatDateOnly(date);
  }

  const anchorYear = date.getUTCFullYear();
  const anchorMonth = date.getUTCMonth();
  const anchorDay = date.getUTCDate();
  if (unit === "year") {
    const targetYear = anchorYear + steps * intervalCount;
    const day = Math.min(anchorDay, daysInUtcMonth(targetYear, anchorMonth));
    return formatDateOnly(new Date(Date.UTC(targetYear, anchorMonth, day)));
  }

  const absoluteMonth = anchorYear * 12 + anchorMonth + steps * intervalCount;
  const targetYear = Math.floor(absoluteMonth / 12);
  const targetMonth = ((absoluteMonth % 12) + 12) % 12;
  const day = Math.min(anchorDay, daysInUtcMonth(targetYear, targetMonth));
  return formatDateOnly(new Date(Date.UTC(targetYear, targetMonth, day)));
}

function approximateStep(anchor: string, target: string, intervalCount: number, unit: BillingUnit) {
  const anchorDate = parseDateOnly(anchor);
  const targetDate = parseDateOnly(target);
  if (unit === "day") {
    return Math.floor(differenceInDays(target, anchor) / intervalCount);
  }
  if (unit === "year") {
    return Math.floor((targetDate.getUTCFullYear() - anchorDate.getUTCFullYear()) / intervalCount);
  }
  const monthDifference =
    (targetDate.getUTCFullYear() - anchorDate.getUTCFullYear()) * 12 +
    targetDate.getUTCMonth() -
    anchorDate.getUTCMonth();
  return Math.floor(monthDifference / intervalCount);
}

function firstStepOnOrAfter(subscription: Subscription, target: string) {
  let step = approximateStep(
    subscription.renewalAnchorOn,
    target,
    subscription.billingIntervalCount,
    subscription.billingIntervalUnit,
  );
  let date = addBillingPeriods(
    subscription.renewalAnchorOn,
    step,
    subscription.billingIntervalCount,
    subscription.billingIntervalUnit,
  );
  while (compareDateOnly(date, target) < 0) {
    step += 1;
    date = addBillingPeriods(
      subscription.renewalAnchorOn,
      step,
      subscription.billingIntervalCount,
      subscription.billingIntervalUnit,
    );
  }
  while (
    compareDateOnly(
      addBillingPeriods(
        subscription.renewalAnchorOn,
        step - 1,
        subscription.billingIntervalCount,
        subscription.billingIntervalUnit,
      ),
      target,
    ) >= 0
  ) {
    step -= 1;
  }
  return step;
}

export function getOccurrencesInRange(subscription: Subscription, rangeStart: string, rangeEnd: string) {
  const effectiveStart = compareDateOnly(subscription.trackingStartedOn, rangeStart) > 0 ? subscription.trackingStartedOn : rangeStart;
  const archiveEnd = subscription.status === "archived" ? subscription.archivedOn : null;
  const effectiveEnd = archiveEnd && compareDateOnly(archiveEnd, rangeEnd) < 0 ? archiveEnd : rangeEnd;
  if (compareDateOnly(effectiveStart, effectiveEnd) > 0) {
    return [];
  }

  const occurrences: SubscriptionOccurrence[] = [];
  let step = firstStepOnOrAfter(subscription, effectiveStart);
  let date = addBillingPeriods(
    subscription.renewalAnchorOn,
    step,
    subscription.billingIntervalCount,
    subscription.billingIntervalUnit,
  );
  while (compareDateOnly(date, effectiveEnd) <= 0) {
    occurrences.push({ id: `${subscription.id}:${date}`, date, subscription });
    step += 1;
    date = addBillingPeriods(
      subscription.renewalAnchorOn,
      step,
      subscription.billingIntervalCount,
      subscription.billingIntervalUnit,
    );
  }
  return occurrences;
}

export function getUpcomingOccurrences(subscriptions: Subscription[], today: string, days = 30) {
  return subscriptions
    .filter((subscription) => subscription.status === "active")
    .flatMap((subscription) => getOccurrencesInRange(subscription, today, addDays(today, days)))
    .sort((left, right) => compareDateOnly(left.date, right.date));
}

export function getMonthGridRange(monthDate: string) {
  const month = parseDateOnly(monthDate);
  const first = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const last = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0));
  const startOffset = (first.getUTCDay() + 6) % 7;
  const endOffset = 6 - ((last.getUTCDay() + 6) % 7);
  return {
    start: addDays(formatDateOnly(first), -startOffset),
    end: addDays(formatDateOnly(last), endOffset),
    monthStart: formatDateOnly(first),
    monthEnd: formatDateOnly(last),
  };
}
