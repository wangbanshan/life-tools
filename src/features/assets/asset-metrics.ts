import { assetGroups, assetTypesById, type AssetAccount, type AssetGroup } from "./asset-data";

export type AssetTotals = {
  assets: number;
  liabilities: number;
};

export type GroupedAssetAccounts = AssetGroup & {
  accounts: AssetAccount[];
  total: number;
};

export function getAssetTotals(accounts: AssetAccount[]): AssetTotals {
  return accounts.reduce<AssetTotals>(
    (acc, account) => {
      if (!account.includeInTotal) {
        return acc;
      }

      const type = assetTypesById[account.typeId];
      if (type?.kind === "liability") {
        acc.liabilities += Math.abs(account.balance);
      } else {
        acc.assets += account.balance;
      }

      return acc;
    },
    { assets: 0, liabilities: 0 },
  );
}

export function getGroupedAssetAccounts(accounts: AssetAccount[]): GroupedAssetAccounts[] {
  return assetGroups
    .map((group) => {
      const items = accounts.filter((account) => assetTypesById[account.typeId]?.groupId === group.id);
      const total = items.reduce((sum, account) => {
        if (!account.includeInTotal) {
          return sum;
        }

        return sum + Math.abs(account.balance);
      }, 0);

      return { ...group, accounts: items, total };
    })
    .filter((group) => group.accounts.length > 0);
}
