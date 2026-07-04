import type { AssetAccount } from "./asset-data";

export const assetAccountSelect =
  "id,user_id,type_id,name,note,balance,currency,include_in_total,sort_order,created_at,updated_at";

export type AccountFormValues = {
  name: string;
  note: string;
  balance: number;
  includeInTotal: boolean;
};

export type AssetAccountRow = {
  id: string;
  user_id: string;
  type_id: string;
  name: string;
  note: string | null;
  balance: number | string;
  currency: string;
  include_in_total: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AccountSaveInput = AccountFormValues & {
  typeId: string;
};

export function fromDbRow(row: AssetAccountRow): AssetAccount {
  return {
    id: row.id,
    typeId: row.type_id,
    name: row.name,
    note: row.note ?? "",
    balance: Number(row.balance),
    currency: row.currency,
    includeInTotal: row.include_in_total,
    createdAt: row.created_at,
  };
}

export function toDbPayload(input: AccountSaveInput, userId: string) {
  return {
    user_id: userId,
    type_id: input.typeId,
    name: input.name,
    note: input.note,
    balance: input.balance,
    currency: "CNY",
    include_in_total: input.includeInTotal,
    updated_at: new Date().toISOString(),
  };
}
