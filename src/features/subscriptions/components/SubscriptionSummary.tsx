import { Paper, SimpleGrid, Skeleton, Text } from "@mantine/core";
import {
  IconBellRinging,
  IconCalendarCheck,
  IconCalendarDollar,
  IconWallet,
  type Icon,
} from "@tabler/icons-react";
import type { CurrencyTotals } from "../subscription-metrics";
import { formatCompactCny } from "../exchange-rates";
import { formatCurrencyTotals } from "../subscription-metrics";

type SummaryCard = {
  label: string;
  value: string;
  icon: Icon;
  tone: "green" | "orange";
  loading: boolean;
};

export function SubscriptionSummary({
  activeCount,
  monthly,
  yearly,
  yearlyCny,
  dueSoonCount,
  isLoading,
  isYearlyConverting,
}: {
  activeCount: number;
  monthly: CurrencyTotals;
  yearly: CurrencyTotals;
  yearlyCny: number | null;
  dueSoonCount: number;
  isLoading: boolean;
  isYearlyConverting: boolean;
}) {
  const cards: SummaryCard[] = [
    {
      label: "正在管理",
      value: `${activeCount} 项订阅`,
      icon: IconCalendarCheck,
      tone: "green",
      loading: isLoading,
    },
    {
      label: "本月预计",
      value: formatCurrencyTotals(monthly),
      icon: IconWallet,
      tone: "orange",
      loading: isLoading,
    },
    {
      label: "本年预计",
      value: Object.keys(yearly).length === 0
        ? "—"
        : yearlyCny === null
          ? formatCurrencyTotals(yearly)
          : formatCompactCny(yearlyCny),
      icon: IconCalendarDollar,
      tone: "orange",
      loading: isLoading || isYearlyConverting,
    },
    {
      label: "续费提醒",
      value: `${dueSoonCount} 项即将到期`,
      icon: IconBellRinging,
      tone: "green",
      loading: isLoading,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, md: 4 }} spacing={{ base: 10, sm: "md" }} className="subscription-summary-grid">
      {cards.map((card) => {
        const CardIcon = card.icon;
        return (
          <Paper className="subscription-summary-card" key={card.label}>
            <span className={`subscription-summary-icon subscription-summary-icon-${card.tone}`} aria-hidden="true">
              <CardIcon size={22} stroke={1.9} />
            </span>
            <div className="subscription-summary-copy">
              <Text className="subscription-summary-label">{card.label}</Text>
              {card.loading ? (
                <Skeleton height={24} width="72%" mt={5} />
              ) : (
                <Text className="subscription-summary-value">{card.value}</Text>
              )}
            </div>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
