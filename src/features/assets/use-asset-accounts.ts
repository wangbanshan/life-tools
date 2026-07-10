import { useEffect, useState } from "react";
import type { User } from "../auth/auth-context";
import { isSupabaseConfigured, supabase } from "../../lib/supabase/client";
import type { AssetAccount } from "./asset-data";
import {
  assetAccountSelect,
  fromDbRow,
  toDbPayload,
  type AccountFormValues,
  type AssetAccountRow,
} from "./asset-model";

type SaveAssetAccountParams = {
  editingAccount: AssetAccount | null;
  typeId: string;
  values: AccountFormValues;
};

export function useAssetAccounts(currentUser: User | null) {
  const shouldUseRemote = Boolean(isSupabaseConfigured && supabase && currentUser);
  const [accounts, setAccounts] = useState<AssetAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldUseRemote || !supabase || !currentUser) {
      setAccounts([]);
      setError(null);
      setIsLoading(false);
      setLoadedUserId(null);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    supabase
      .from("asset_accounts")
      .select(assetAccountSelect)
      .eq("user_id", currentUser.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!mounted) {
          return;
        }

        if (queryError) {
          setError(queryError.message);
          setAccounts([]);
        } else {
          setAccounts(((data ?? []) as AssetAccountRow[]).map(fromDbRow));
        }

        setLoadedUserId(currentUser.id);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser, shouldUseRemote]);

  const saveAccount = async ({ editingAccount, typeId, values }: SaveAssetAccountParams) => {
    if (!shouldUseRemote || !supabase || !currentUser) {
      setError("Supabase 尚未配置，暂时无法保存资产账户。");
      return false;
    }

    const input = {
      ...values,
      typeId,
    };

    setError(null);

    if (editingAccount) {
      const { data, error: updateError } = await supabase
        .from("asset_accounts")
        .update(toDbPayload(input, currentUser.id))
        .eq("id", editingAccount.id)
        .eq("user_id", currentUser.id)
        .select(assetAccountSelect)
        .single();

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setAccounts((current) =>
        current.map((account) => (account.id === editingAccount.id ? fromDbRow(data as AssetAccountRow) : account)),
      );
      return true;
    }

    const { data, error: insertError } = await supabase
      .from("asset_accounts")
      .insert(toDbPayload(input, currentUser.id))
      .select(assetAccountSelect)
      .single();

    if (insertError) {
      setError(insertError.message);
      return false;
    }

    setAccounts((current) => [fromDbRow(data as AssetAccountRow), ...current]);
    return true;
  };

  return {
    accounts,
    error,
    isLoading: isLoading || Boolean(shouldUseRemote && loadedUserId !== currentUser?.id),
    saveAccount,
    setError,
    shouldUseRemote,
  };
}
