import { Badge, Box, Button, Group, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconChevronRight, IconEdit, IconPlus } from "@tabler/icons-react";
import { assetTypes, assetTypesById, type AssetAccount, type AssetType } from "../asset-data";
import { formatAmount } from "../asset-format";
import type { GroupedAssetAccounts } from "../asset-metrics";
import { AssetDataStatus } from "./AssetDataStatus";
import { TypeIcon } from "./TypeIcon";

export function AssetAccountList({
  amountVisible,
  collapsedGroups,
  error,
  groupedAccounts,
  isAuthenticated,
  isConfigured,
  isLoading,
  isRemote,
  onAccountClick,
  onCreate,
  onToggleGroup,
}: {
  amountVisible: boolean;
  collapsedGroups: Record<string, boolean>;
  error: string | null;
  groupedAccounts: GroupedAssetAccounts[];
  isAuthenticated: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  isRemote: boolean;
  onAccountClick: (account: AssetAccount) => void;
  onCreate: () => void;
  onToggleGroup: (groupId: string) => void;
}) {
  return (
    <Paper className="asset-list-panel">
      <AssetDataStatus
        error={error}
        isAuthenticated={isAuthenticated}
        isConfigured={isConfigured}
        isLoading={isLoading}
        isRemote={isRemote}
      />
      {groupedAccounts.length === 0 ? (
        <AssetEmptyState isAuthenticated={isAuthenticated} isLoading={isLoading} onCreate={onCreate} />
      ) : (
        groupedAccounts.map((group) => (
          <AssetAccountGroup
            amountVisible={amountVisible}
            collapsed={Boolean(collapsedGroups[group.id])}
            group={group}
            key={group.id}
            onAccountClick={onAccountClick}
            onToggle={() => onToggleGroup(group.id)}
          />
        ))
      )}
    </Paper>
  );
}

function AssetEmptyState({
  isAuthenticated,
  isLoading,
  onCreate,
}: {
  isAuthenticated: boolean;
  isLoading: boolean;
  onCreate: () => void;
}) {
  return (
    <Stack className="asset-empty" align="center" justify="center">
      <Text className="asset-empty-title">{isLoading ? "正在加载资产账户" : isAuthenticated ? "还没有资产账户" : "请先登录"}</Text>
      <Text className="asset-empty-copy">
        {isLoading
          ? "稍等一下，正在从数据库同步。"
          : isAuthenticated
            ? "先添加一个账户，汇总页会自动计算净资产和分组余额。"
            : "资产账户会按登录用户同步到数据库。"}
      </Text>
      <Button className="asset-add-button" leftSection={<IconPlus size={18} />} onClick={onCreate}>
        {isAuthenticated ? "添加资产" : "去登录"}
      </Button>
    </Stack>
  );
}

function AssetAccountGroup({
  amountVisible,
  collapsed,
  group,
  onAccountClick,
  onToggle,
}: {
  amountVisible: boolean;
  collapsed: boolean;
  group: GroupedAssetAccounts;
  onAccountClick: (account: AssetAccount) => void;
  onToggle: () => void;
}) {
  return (
    <section className="asset-group" aria-label={group.name}>
      <UnstyledButton className="asset-group-header" onClick={onToggle}>
        <Group gap="xs" wrap="nowrap">
          <Text className="asset-group-title">{group.name}</Text>
          {collapsed ? <IconChevronRight size={19} /> : <IconChevronDown size={19} />}
        </Group>
        <Text className="asset-group-total">{formatAmount(group.total, amountVisible)}</Text>
      </UnstyledButton>

      {!collapsed && (
        <Stack gap={0}>
          {group.accounts.map((account) => {
            const type = assetTypesById[account.typeId] ?? assetTypes[0];
            return (
              <AccountRow
                account={account}
                amountVisible={amountVisible}
                key={account.id}
                type={type}
                onClick={() => onAccountClick(account)}
              />
            );
          })}
        </Stack>
      )}
    </section>
  );
}

function AccountRow({
  account,
  amountVisible,
  type,
  onClick,
}: {
  account: AssetAccount;
  amountVisible: boolean;
  type: AssetType;
  onClick: () => void;
}) {
  return (
    <UnstyledButton className="asset-account-row" onClick={onClick}>
      <Group gap="md" wrap="nowrap" className="asset-account-main">
        <TypeIcon type={type} />
        <Box className="asset-account-copy">
          <Group gap="xs" wrap="nowrap">
            <Text className="asset-account-name">{account.name}</Text>
            {!account.includeInTotal && <Badge className="asset-muted-badge">不计入</Badge>}
          </Group>
          {account.note && <Text className="asset-account-note">{account.note}</Text>}
        </Box>
      </Group>
      <Group gap="xs" wrap="nowrap" className="asset-account-balance">
        <Text className={type.kind === "liability" ? "asset-amount-negative" : "asset-amount"}>
          {formatAmount(Math.abs(account.balance), amountVisible)}
        </Text>
        <IconEdit size={16} stroke={1.9} />
      </Group>
    </UnstyledButton>
  );
}
