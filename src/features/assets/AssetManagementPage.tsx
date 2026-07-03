import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Container,
  Drawer,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconChevronDown,
  IconChevronRight,
  IconDeviceFloppy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconPlus,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { AuthModal } from "../../AuthModal";
import { useAuth } from "../../auth";
import { isSupabaseConfigured, supabase } from "../../supabaseClient";
import { useEffect, useMemo, useState } from "react";
import {
  assetGroups,
  assetTypes,
  assetTypesById,
  type AssetAccount,
  type AssetType,
} from "./asset-data";

type AccountFormValues = {
  name: string;
  note: string;
  balance: number;
  includeInTotal: boolean;
};

type AssetAccountRow = {
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

type AccountSaveInput = AccountFormValues & {
  typeId: string;
};

function fromDbRow(row: AssetAccountRow): AssetAccount {
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

function toDbPayload(input: AccountSaveInput, userId: string) {
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

const amountFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(value: number, visible: boolean) {
  return visible ? amountFormatter.format(value) : "••••••";
}

export function AssetManagementPage() {
  const { currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const shouldUseRemote = Boolean(isSupabaseConfigured && supabase && currentUser);
  const [remoteAccounts, setRemoteAccounts] = useState<AssetAccount[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const accounts = remoteAccounts;
  const [pickerOpened, picker] = useDisclosure(false);
  const [formOpened, form] = useDisclosure(false);
  const [authOpened, { open: openAuthModal, close: closeAuthModal }] = useDisclosure(false);
  const [selectedTypeId, setSelectedTypeId] = useState(assetTypes[0].id);
  const [typePickerMode, setTypePickerMode] = useState<"create" | "change">("create");
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [amountVisible, setAmountVisible] = useState(true);

  const selectedType = assetTypesById[selectedTypeId] ?? assetTypes[0];
  const editingAccount = accounts.find((account) => account.id === editingAccountId) ?? null;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      openAuthModal();
    }
  }, [isAuthLoading, isAuthenticated, openAuthModal]);

  useEffect(() => {
    if (!shouldUseRemote || !supabase || !currentUser) {
      setRemoteAccounts([]);
      setAccountsError(null);
      setIsAccountsLoading(false);
      return;
    }

    let mounted = true;
    setIsAccountsLoading(true);
    setAccountsError(null);

    supabase
      .from("asset_accounts")
      .select("id,user_id,type_id,name,note,balance,currency,include_in_total,sort_order,created_at,updated_at")
      .eq("user_id", currentUser.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!mounted) {
          return;
        }

        if (error) {
          setAccountsError(error.message);
          setRemoteAccounts([]);
        } else {
          setRemoteAccounts(((data ?? []) as AssetAccountRow[]).map(fromDbRow));
        }

        setIsAccountsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser, shouldUseRemote]);

  const totals = useMemo(() => {
    return accounts.reduce(
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
  }, [accounts]);

  const netAssets = totals.assets - totals.liabilities;

  const groupedAccounts = useMemo(() => {
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
  }, [accounts]);

  const openCreateFlow = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (!shouldUseRemote) {
      setAccountsError("Supabase 尚未配置，暂时无法保存资产账户。");
      return;
    }

    setTypePickerMode("create");
    setEditingAccountId(null);
    picker.open();
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedTypeId(typeId);
    if (typePickerMode === "create") {
      setEditingAccountId(null);
    }
    picker.close();
    form.open();
  };

  const handleEdit = (account: AssetAccount) => {
    setSelectedTypeId(account.typeId);
    setEditingAccountId(account.id);
    form.open();
  };

  const handleSave = async (values: AccountFormValues) => {
    const input: AccountSaveInput = {
      ...values,
      typeId: selectedType.id,
    };

    if (shouldUseRemote && supabase && currentUser) {
      setAccountsError(null);

      if (editingAccount) {
        const { data, error } = await supabase
          .from("asset_accounts")
          .update(toDbPayload(input, currentUser.id))
          .eq("id", editingAccount.id)
          .eq("user_id", currentUser.id)
          .select("id,user_id,type_id,name,note,balance,currency,include_in_total,sort_order,created_at,updated_at")
          .single();

        if (error) {
          setAccountsError(error.message);
          return;
        }

        setRemoteAccounts((current) => current.map((account) => (account.id === editingAccount.id ? fromDbRow(data as AssetAccountRow) : account)));
      } else {
        const { data, error } = await supabase
          .from("asset_accounts")
          .insert(toDbPayload(input, currentUser.id))
          .select("id,user_id,type_id,name,note,balance,currency,include_in_total,sort_order,created_at,updated_at")
          .single();

        if (error) {
          setAccountsError(error.message);
          return;
        }

        setRemoteAccounts((current) => [fromDbRow(data as AssetAccountRow), ...current]);
      }

      form.close();
      return;
    }

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setAccountsError("Supabase 尚未配置，暂时无法保存资产账户。");
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  return (
    <Box className="asset-shell">
      <Container size="lg" className="asset-page">
        <Group className="asset-topbar" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ActionIcon component={Link} to="/" variant="subtle" className="asset-nav-button" aria-label="返回首页">
              <IconArrowLeft size={22} stroke={2} />
            </ActionIcon>
            <Box>
              <Text className="asset-kicker">Life Tools</Text>
              <Title className="asset-title" order={1}>
                资产管理
              </Title>
            </Box>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Tooltip label={amountVisible ? "隐藏金额" : "显示金额"}>
              <ActionIcon
                variant="subtle"
                className="asset-nav-button"
                aria-label={amountVisible ? "隐藏金额" : "显示金额"}
                onClick={() => setAmountVisible((visible) => !visible)}
              >
                {amountVisible ? <IconEye size={21} stroke={1.9} /> : <IconEyeOff size={21} stroke={1.9} />}
              </ActionIcon>
            </Tooltip>
            <Button className="asset-add-button" leftSection={<IconPlus size={20} stroke={2.2} />} onClick={openCreateFlow}>
              添加
            </Button>
          </Group>
        </Group>

        <section className="asset-layout" aria-label="资产管理概览">
          <Stack gap="md" className="asset-summary-column">
            <Paper className="asset-net-card">
              <Text className="asset-card-label">净资产</Text>
              <Text className="asset-net-amount">{formatAmount(netAssets, amountVisible)}</Text>
              <SimpleGrid cols={2} spacing="md" className="asset-metric-grid">
                <Box>
                  <Text className="asset-card-label">总资产</Text>
                  <Text className="asset-metric-value">{formatAmount(totals.assets, amountVisible)}</Text>
                </Box>
                <Box>
                  <Text className="asset-card-label">总负债</Text>
                  <Text className="asset-metric-value">{formatAmount(totals.liabilities, amountVisible)}</Text>
                </Box>
              </SimpleGrid>
            </Paper>

            <SimpleGrid cols={2} spacing="md" className="asset-flow-grid">
              <Paper className="asset-small-card">
                <Text className="asset-card-label">账户数</Text>
                <Text className="asset-metric-value">{accounts.length}</Text>
              </Paper>
              <Paper className="asset-small-card">
                <Text className="asset-card-label">币种</Text>
                <Text className="asset-metric-value">CNY</Text>
              </Paper>
            </SimpleGrid>
          </Stack>

          <Paper className="asset-list-panel">
            <AssetDataStatus
              error={accountsError}
              isAuthenticated={isAuthenticated}
              isConfigured={isSupabaseConfigured}
              isLoading={isAuthLoading || isAccountsLoading}
              isRemote={shouldUseRemote}
            />
            {groupedAccounts.length === 0 ? (
              <Stack className="asset-empty" align="center" justify="center">
                <Text className="asset-empty-title">{isAuthLoading || isAccountsLoading ? "正在加载资产账户" : isAuthenticated ? "还没有资产账户" : "请先登录"}</Text>
                <Text className="asset-empty-copy">
                  {isAuthLoading || isAccountsLoading
                    ? "稍等一下，正在从数据库同步。"
                    : isAuthenticated
                      ? "先添加一个账户，汇总页会自动计算净资产和分组余额。"
                      : "资产账户会按登录用户同步到数据库。"}
                </Text>
                <Button className="asset-add-button" leftSection={<IconPlus size={18} />} onClick={openCreateFlow}>
                  {isAuthenticated ? "添加资产" : "去登录"}
                </Button>
              </Stack>
            ) : (
              groupedAccounts.map((group) => {
                const collapsed = collapsedGroups[group.id];

                return (
                  <section className="asset-group" key={group.id} aria-label={group.name}>
                    <UnstyledButton className="asset-group-header" onClick={() => toggleGroup(group.id)}>
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
                              onClick={() => handleEdit(account)}
                            />
                          );
                        })}
                      </Stack>
                    )}
                  </section>
                );
              })
            )}
          </Paper>
        </section>
      </Container>

      <Drawer
        opened={pickerOpened}
        onClose={picker.close}
        position="bottom"
        size="82%"
        title="选择资产类型"
        classNames={{ content: "asset-drawer-content", header: "asset-drawer-header", title: "asset-drawer-title", body: "asset-picker-body" }}
      >
        <AssetTypePicker onSelect={handleTypeSelect} />
      </Drawer>

      <Drawer
        opened={formOpened}
        onClose={form.close}
        position="right"
        size="min(520px, 100vw)"
        title={editingAccount ? "编辑资产" : `添加资产-${selectedType.name}`}
        classNames={{ content: "asset-form-drawer", header: "asset-drawer-header", title: "asset-drawer-title", body: "asset-form-body" }}
      >
        <AssetAccountForm
          account={editingAccount}
          type={selectedType}
          onChangeType={() => {
            setTypePickerMode("change");
            form.close();
            picker.open();
          }}
          onSave={handleSave}
        />
      </Drawer>

      <AuthModal opened={authOpened} onClose={closeAuthModal} />
    </Box>
  );
}

function AssetDataStatus({
  error,
  isAuthenticated,
  isConfigured,
  isLoading,
  isRemote,
}: {
  error: string | null;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  isRemote: boolean;
}) {
  if (isLoading) {
    return <Text className="asset-data-status">正在同步数据库...</Text>;
  }

  if (error) {
    return <Text className="asset-data-status asset-data-status-error">数据库同步失败：{error}</Text>;
  }

  if (!isAuthenticated) {
    return <Text className="asset-data-status">请先登录，资产账户会按用户同步到数据库。</Text>;
  }

  if (!isRemote) {
    return <Text className="asset-data-status">{isConfigured ? "正在建立数据库会话..." : "Supabase 尚未配置，暂时无法保存资产账户。"}</Text>;
  }

  return null;
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

function AssetTypePicker({ onSelect }: { onSelect: (typeId: string) => void }) {
  return (
    <ScrollArea className="asset-picker-scroll" offsetScrollbars>
      <Stack gap="lg">
        {assetGroups.map((group) => {
          const groupTypes = assetTypes.filter((type) => type.groupId === group.id);

          return (
            <section className="asset-type-section" key={group.id}>
              <Text className="asset-type-section-title">{group.name}</Text>
              <SimpleGrid cols={{ base: 4, xs: 5, sm: 8 }} spacing="sm" verticalSpacing="md">
                {groupTypes.map((type) => (
                  <UnstyledButton className="asset-type-option" key={type.id} onClick={() => onSelect(type.id)}>
                    <TypeIcon type={type} size="lg" />
                    <Text className="asset-type-name">{type.name}</Text>
                  </UnstyledButton>
                ))}
              </SimpleGrid>
            </section>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}

function AssetAccountForm({
  account,
  type,
  onChangeType,
  onSave,
}: {
  account: AssetAccount | null;
  type: AssetType;
  onChangeType: () => void;
  onSave: (values: AccountFormValues) => void | Promise<void>;
}) {
  const [name, setName] = useState(account?.name ?? "");
  const [note, setNote] = useState(account?.note ?? "");
  const [balance, setBalance] = useState<string | number>(account?.balance ?? 0);
  const [includeInTotal, setIncludeInTotal] = useState(account?.includeInTotal ?? type.kind === "asset");

  useEffect(() => {
    setName(account?.name ?? "");
    setNote(account?.note ?? "");
    setBalance(account?.balance ?? 0);
    setIncludeInTotal(account?.includeInTotal ?? type.kind === "asset");
  }, [account, type.id, type.kind]);

  const normalizedBalance = typeof balance === "number" ? balance : Number(balance || 0);
  const canSave = name.trim().length > 0 && Number.isFinite(normalizedBalance);

  return (
    <Stack gap="md" className="asset-form">
      <Paper className="asset-form-section">
        <UnstyledButton className="asset-form-type-row" onClick={onChangeType}>
          <Text className="asset-form-label">账户类型</Text>
          <Group gap="xs" wrap="nowrap">
            <TypeIcon type={type} />
            <Text className="asset-form-type-name">{type.name}</Text>
            <IconChevronRight size={18} stroke={1.8} />
          </Group>
        </UnstyledButton>

        <div className="asset-form-inline-field">
          <Text className="asset-form-label">名称</Text>
          <TextInput
            classNames={{ root: "asset-inline-input-wrap", input: "asset-input" }}
            placeholder="点此输入..."
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </div>
      </Paper>

      <Paper className="asset-form-section">
        <div className="asset-form-inline-field">
          <Text className="asset-form-label">账户余额</Text>
          <NumberInput
            classNames={{ root: "asset-inline-input-wrap", input: "asset-input" }}
            decimalScale={2}
            fixedDecimalScale
            min={0}
            value={balance}
            onChange={setBalance}
          />
        </div>

        <div className="asset-form-inline-field asset-form-inline-field-start">
          <Text className="asset-form-label">备注</Text>
          <Textarea
            autosize
            minRows={2}
            classNames={{ root: "asset-inline-input-wrap", input: "asset-input" }}
            placeholder="可不填，例如尾号、用途或平台说明"
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
          />
        </div>
      </Paper>

      <Paper className="asset-form-section">
        <Group className="asset-switch-row" justify="space-between" wrap="nowrap">
          <Box>
            <Text className="asset-switch-title">是否计入总资产</Text>
            <Text className="asset-switch-copy">开启后，账户余额将计入汇总页</Text>
          </Box>
          <Switch checked={includeInTotal} onChange={(event) => setIncludeInTotal(event.currentTarget.checked)} />
        </Group>
      </Paper>

      <Group className="asset-form-actions" grow>
        <Button
          className="asset-save-button"
          disabled={!canSave}
          leftSection={<IconDeviceFloppy size={18} />}
          onClick={() =>
            void onSave({
              name: name.trim(),
              note: note.trim(),
              balance: normalizedBalance,
              includeInTotal,
            })
          }
        >
          保存
        </Button>
      </Group>
    </Stack>
  );
}

function TypeIcon({ type, size = "md" }: { type: AssetType; size?: "md" | "lg" }) {
  const iconSize = size === "lg" ? 30 : 24;

  return (
    <span className={`asset-type-icon asset-type-icon-${size}`} style={{ backgroundColor: type.color }}>
      <type.Icon size={iconSize} stroke={1.9} />
    </span>
  );
}
