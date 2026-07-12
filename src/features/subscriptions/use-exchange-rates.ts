import { useQuery } from "@tanstack/react-query";
import {
  exchangeRateCacheMaxAge,
  fetchExchangeRates,
  loadExchangeRates,
} from "./exchange-rates";

const staleTime = 24 * 60 * 60 * 1000;

export function useExchangeRates(enabled: boolean) {
  const cached = loadExchangeRates();
  return useQuery({
    queryKey: ["60s-exchange-rates"],
    queryFn: fetchExchangeRates,
    initialData: cached ?? undefined,
    initialDataUpdatedAt: cached?.cachedAt,
    enabled,
    staleTime,
    gcTime: exchangeRateCacheMaxAge,
    retry: 1,
  });
}
