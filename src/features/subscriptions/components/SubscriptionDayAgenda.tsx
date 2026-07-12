import { ActionIcon, Group, Paper, Table, Text, UnstyledButton } from "@mantine/core";
import { IconChevronRight, IconEdit } from "@tabler/icons-react";
import { subscriptionCategories, type Subscription } from "../subscription-data";
import type { SubscriptionOccurrence } from "../subscription-dates";
import { parseDateOnly } from "../subscription-dates";
import { formatCurrencyAmount } from "../subscription-metrics";
import { SubscriptionMark } from "./SubscriptionMark";

const categoryLabels = new Map(subscriptionCategories.map((category) => [category.value, category.label]));

function dayTitle(date: string) {
  const parsed = parseDateOnly(date);
  return `${parsed.getUTCMonth() + 1} 月 ${parsed.getUTCDate()} 日`;
}

function cycleLabel(subscription: Subscription) {
  const count = subscription.billingIntervalCount;
  if (subscription.billingIntervalUnit === "day") return count === 1 ? "每日" : `每 ${count} 天`;
  if (subscription.billingIntervalUnit === "year") return count === 1 ? "年付" : `每 ${count} 年`;
  if (count === 1) return "月付";
  if (count === 3) return "季付";
  if (count === 6) return "半年付";
  return `每 ${count} 个月`;
}

function reminderLabel(offsets: number[]) {
  return [...offsets]
    .sort((left, right) => left - right)
    .map((offset) => (offset === 0 ? "当天" : `提前 ${offset} 天`))
    .join("、");
}

export function SubscriptionDayAgenda({
  date,
  occurrences,
  onEdit,
}: {
  date: string;
  occurrences: SubscriptionOccurrence[];
  onEdit: (subscription: Subscription) => void;
}) {
  return (
    <Paper className="subscription-panel subscription-day-panel">
      <Text className="subscription-day-title">{dayTitle(date)} · {occurrences.length} 项订阅</Text>
      {occurrences.length === 0 ? (
        <Text className="subscription-panel-empty">这一天没有续费。</Text>
      ) : (
        <>
          <Table.ScrollContainer minWidth={760} className="subscription-day-table-wrap">
            <Table className="subscription-day-table" verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>服务</Table.Th>
                  <Table.Th>分类 / 套餐</Table.Th>
                  <Table.Th>续费周期</Table.Th>
                  <Table.Th>提醒时间</Table.Th>
                  <Table.Th ta="right">金额</Table.Th>
                  <Table.Th ta="center">操作</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {occurrences.map((occurrence) => (
                  <Table.Tr key={occurrence.id}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <SubscriptionMark subscription={occurrence.subscription} size="sm" />
                        <Text className="subscription-day-name">{occurrence.subscription.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text className="subscription-day-plan">
                        {categoryLabels.get(occurrence.subscription.category)} · {occurrence.subscription.planName || "会员订阅"}
                      </Text>
                    </Table.Td>
                    <Table.Td>{cycleLabel(occurrence.subscription)}</Table.Td>
                    <Table.Td>{reminderLabel(occurrence.subscription.reminderOffsets)}</Table.Td>
                    <Table.Td ta="right" className="subscription-day-amount">
                      {formatCurrencyAmount(occurrence.subscription.amount, occurrence.subscription.currency)}
                    </Table.Td>
                    <Table.Td ta="center">
                      <ActionIcon
                        variant="subtle"
                        color="orange"
                        aria-label={`编辑 ${occurrence.subscription.name}`}
                        onClick={() => onEdit(occurrence.subscription)}
                      >
                        <IconEdit size={17} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <div className="subscription-day-mobile-list">
            {occurrences.map((occurrence) => (
              <UnstyledButton
                className="subscription-day-mobile-row"
                key={occurrence.id}
                onClick={() => onEdit(occurrence.subscription)}
              >
                <Group gap="sm" wrap="nowrap" className="subscription-day-service">
                  <SubscriptionMark subscription={occurrence.subscription} size="sm" />
                  <div className="subscription-day-copy">
                    <Text className="subscription-day-name">{occurrence.subscription.name}</Text>
                    <Text className="subscription-day-plan">
                      {occurrence.subscription.planName || categoryLabels.get(occurrence.subscription.category)}
                      {' · '}{cycleLabel(occurrence.subscription)}
                    </Text>
                    <Text className="subscription-day-reminder">
                      {reminderLabel(occurrence.subscription.reminderOffsets)}提醒
                    </Text>
                  </div>
                </Group>
                <Group gap={6} wrap="nowrap">
                  <Text className="subscription-day-amount">
                    {formatCurrencyAmount(occurrence.subscription.amount, occurrence.subscription.currency)}
                  </Text>
                  <IconChevronRight size={17} color="#9b8d84" />
                </Group>
              </UnstyledButton>
            ))}
          </div>
        </>
      )}
    </Paper>
  );
}
