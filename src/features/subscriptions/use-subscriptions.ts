import { useEffect, useState } from "react";
import type { User } from "../auth/auth-context";
import { isSupabaseConfigured, supabase } from "../../lib/supabase/client";
import type { Subscription } from "./subscription-data";
import {
  fromSubscriptionRow,
  subscriptionSelect,
  toSubscriptionPayload,
  type SubscriptionFormValues,
  type SubscriptionRow,
} from "./subscription-model";
import { todayDateOnly } from "./subscription-dates";

export function useSubscriptions(currentUser: User | null) {
  const shouldUseRemote = Boolean(isSupabaseConfigured && supabase && currentUser);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldUseRemote || !supabase || !currentUser) {
      setSubscriptions([]);
      setError(null);
      setIsLoading(false);
      setLoadedUserId(null);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);
    supabase
      .from("subscriptions")
      .select(subscriptionSelect)
      .eq("user_id", currentUser.id)
      .order("status", { ascending: true })
      .order("renewal_anchor_on", { ascending: true })
      .then(({ data, error: queryError }) => {
        if (!mounted) return;
        if (queryError) {
          setError(queryError.message);
          setSubscriptions([]);
        } else {
          setSubscriptions(((data ?? []) as SubscriptionRow[]).map(fromSubscriptionRow));
        }
        setLoadedUserId(currentUser.id);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser, shouldUseRemote]);

  const saveSubscription = async (values: SubscriptionFormValues, editing: Subscription | null) => {
    if (!shouldUseRemote || !supabase || !currentUser) {
      setError("Supabase 尚未配置，暂时无法保存订阅。");
      return false;
    }
    setError(null);
    if (editing) {
      const { data, error: updateError } = await supabase
        .from("subscriptions")
        .update(toSubscriptionPayload(values, currentUser.id))
        .eq("id", editing.id)
        .eq("user_id", currentUser.id)
        .select(subscriptionSelect)
        .single();
      if (updateError) {
        setError(updateError.message);
        return false;
      }
      setSubscriptions((current) =>
        current.map((subscription) =>
          subscription.id === editing.id ? fromSubscriptionRow(data as SubscriptionRow) : subscription,
        ),
      );
      return true;
    }

    const { data, error: insertError } = await supabase
      .from("subscriptions")
      .insert(toSubscriptionPayload(values, currentUser.id))
      .select(subscriptionSelect)
      .single();
    if (insertError) {
      setError(insertError.message);
      return false;
    }
    setSubscriptions((current) => [fromSubscriptionRow(data as SubscriptionRow), ...current]);
    return true;
  };

  const setArchived = async (subscription: Subscription, archived: boolean) => {
    if (!shouldUseRemote || !supabase || !currentUser) return false;
    setError(null);
    const { data, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: archived ? "archived" : "active",
        archived_on: archived ? todayDateOnly() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id)
      .eq("user_id", currentUser.id)
      .select(subscriptionSelect)
      .single();
    if (updateError) {
      setError(updateError.message);
      return false;
    }
    setSubscriptions((current) =>
      current.map((item) => (item.id === subscription.id ? fromSubscriptionRow(data as SubscriptionRow) : item)),
    );
    return true;
  };

  const deleteSubscription = async (subscription: Subscription) => {
    if (!shouldUseRemote || !supabase || !currentUser) return false;
    setError(null);
    const { error: deleteError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", subscription.id)
      .eq("user_id", currentUser.id);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    setSubscriptions((current) => current.filter((item) => item.id !== subscription.id));
    return true;
  };

  return {
    subscriptions,
    error,
    isLoading: isLoading || Boolean(shouldUseRemote && loadedUserId !== currentUser?.id),
    shouldUseRemote,
    saveSubscription,
    setArchived,
    deleteSubscription,
    setError,
  };
}
