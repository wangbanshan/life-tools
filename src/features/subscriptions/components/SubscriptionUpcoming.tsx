import { Badge, Group, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import type { Subscription } from "../subscription-data";
import { differenceInDays, isReminderDue, parseDateOnly, type SubscriptionOccurrence } from "../subscription-dates";
import { formatCurrencyAmount } from "../subscription-metrics";
import { SubscriptionMark } from "./SubscriptionMark";

function upcomingLabel(date: string, today: string) {
  const days = differenceInDays(date, today);
  if (days === 0) return "今天";
  if (days === 1) return "明天";
  return `${days} 天后`;
}

function renewalDateLabel(date: string) {
  const parsed = parseDateOnly(date);
  return `${parsed.getUTCMonth() + 1}月${parsed.getUTCDate()}日`;
}

export function SubscriptionUpcoming({
  occurrences,
  today,
  onEdit,
}: {
  occurrences: SubscriptionOccurrence[];
  today: string;
  onEdit: (subscription: Subscription) => void;
}) {
  const visibleOccurrences = occurrences.slice(0, 5);

  return (
    <Paper className="subscription-panel subscription-upcoming-panel">
      <Group className="subscription-panel-heading" justify="space-between">
        <Text className="subscription-panel-title">即将续费</Text>
        <Text className="subscription-panel-caption">未来 30 天 · {occurrences.length} 项</Text>
      </Group>
      {visibleOccurrences.length === 0 ? (
        <Text className="subscription-panel-empty">未来 30 天没有续费项目。</Text>
      ) : (
        <Stack gap={0}>
          {visibleOccurrences.map((occurrence) => {
            const reminderDue = isReminderDue(occurrence, today);
            return (
              <UnstyledButton
                className="subscription-upcoming-row"
                key={occurrence.id}
                onClick={() => onEdit(occurrence.subscription)}
              >
                <Group gap="sm" wrap="nowrap" className="subscription-upcoming-service">
                  <SubscriptionMark subscription={occurrence.subscription} size="sm" />
                  <div className="subscription-upcoming-copy">
                    <Text className="subscription-upcoming-name">{occurrence.subscription.name}</Text>
                    <Text className="subscription-upcoming-date">
                      {renewalDateLabel(occurrence.date)} · {upcomingLabel(occurrence.date, today)}
                    </Text>
                  </div>
                </Group>
                <div className="subscription-upcoming-meta">
                  <Text className="subscription-upcoming-amount">
                    {formatCurrencyAmount(occurrence.subscription.amount, occurrence.subscription.currency)}
                  </Text>
                  <Badge color={reminderDue ? "orange" : "green"} variant="light" size="sm">
                    {reminderDue ? "提醒中" : "正常"}
                  </Badge>
                </div>
              </UnstyledButton>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
