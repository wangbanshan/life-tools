import { Button, Group, Stack, Text } from "@mantine/core";
import { IconRefresh, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import type { Subscription } from "../subscription-data";
import { formatCurrencyAmount } from "../subscription-metrics";
import { SubscriptionMark } from "./SubscriptionMark";

export function SubscriptionArchive({
  subscriptions,
  onRestore,
  onDelete,
}: {
  subscriptions: Subscription[];
  onRestore: (subscription: Subscription) => Promise<boolean>;
  onDelete: (subscription: Subscription) => void;
}) {
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  if (subscriptions.length === 0) {
    return <Text className="subscription-archive-empty">还没有归档的订阅。</Text>;
  }
  return (
    <Stack gap="sm">
      {restoreError && <Text role="alert" className="subscription-form-error">{restoreError}</Text>}
      {subscriptions.map((subscription) => (
        <div className="subscription-archive-row" key={subscription.id}>
          <Group gap="sm" wrap="nowrap">
            <SubscriptionMark subscription={subscription} />
            <div className="subscription-archive-copy">
              <Text className="subscription-archive-name">{subscription.name}</Text>
              <Text className="subscription-archive-meta">
                {formatCurrencyAmount(subscription.amount, subscription.currency)} · 归档于 {subscription.archivedOn}
              </Text>
            </div>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Button
              variant="light"
              color="green"
              size="xs"
              loading={restoringId === subscription.id}
              disabled={restoringId !== null}
              leftSection={<IconRefresh size={15} />}
              onClick={async () => {
                setRestoringId(subscription.id);
                setRestoreError(null);
                try {
                  if (!await onRestore(subscription)) setRestoreError("恢复失败，请检查网络后重试。");
                } catch {
                  setRestoreError("恢复失败，请检查网络后重试。");
                } finally {
                  setRestoringId(null);
                }
              }}
            >
              恢复
            </Button>
            <Button variant="subtle" color="red" size="xs" disabled={restoringId !== null} aria-label={`删除 ${subscription.name}`} onClick={() => onDelete(subscription)}>
              <IconTrash size={16} />
            </Button>
          </Group>
        </div>
      ))}
    </Stack>
  );
}
