import type {
  BillingUnit,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
} from "./subscription-data";

export const subscriptionSelect =
  "id,user_id,provider_key,name,category,plan_name,note,amount,currency,billing_interval_count,billing_interval_unit,tracking_started_on,renewal_anchor_on,reminder_offsets,status,archived_on,created_at,updated_at";

export type SubscriptionFormValues = {
  providerKey: string | null;
  name: string;
  category: SubscriptionCategory;
  planName: string;
  note: string;
  amount: number;
  currency: string;
  billingIntervalCount: number;
  billingIntervalUnit: BillingUnit;
  trackingStartedOn: string;
  renewalAnchorOn: string;
  reminderOffsets: number[];
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  provider_key: string | null;
  name: string;
  category: SubscriptionCategory;
  plan_name: string;
  note: string;
  amount: number | string;
  currency: string;
  billing_interval_count: number;
  billing_interval_unit: BillingUnit;
  tracking_started_on: string;
  renewal_anchor_on: string;
  reminder_offsets: number[];
  status: SubscriptionStatus;
  archived_on: string | null;
  created_at: string;
  updated_at: string;
};

export function fromSubscriptionRow(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    providerKey: row.provider_key,
    name: row.name,
    category: row.category,
    planName: row.plan_name,
    note: row.note,
    amount: Number(row.amount),
    currency: row.currency,
    billingIntervalCount: row.billing_interval_count,
    billingIntervalUnit: row.billing_interval_unit,
    trackingStartedOn: row.tracking_started_on,
    renewalAnchorOn: row.renewal_anchor_on,
    reminderOffsets: [...row.reminder_offsets].sort((left, right) => left - right),
    status: row.status,
    archivedOn: row.archived_on,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSubscriptionPayload(values: SubscriptionFormValues, userId: string) {
  return {
    user_id: userId,
    provider_key: values.providerKey,
    name: values.name,
    category: values.category,
    plan_name: values.planName,
    note: values.note,
    amount: values.amount,
    currency: values.currency,
    billing_interval_count: values.billingIntervalCount,
    billing_interval_unit: values.billingIntervalUnit,
    tracking_started_on: values.trackingStartedOn,
    renewal_anchor_on: values.renewalAnchorOn,
    reminder_offsets: [...values.reminderOffsets].sort((left, right) => left - right),
    updated_at: new Date().toISOString(),
  };
}
