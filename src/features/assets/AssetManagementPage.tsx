import { ActionIcon, Box, Button, Container, Drawer, Group, Title, Tooltip } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconArrowLeft, IconEye, IconEyeOff, IconPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuthModal } from "../auth/AuthModal";
import { useAuth } from "../auth/auth-context";
import { isSupabaseConfigured } from "../../lib/supabase/client";
import { assetTypes, assetTypesById, type AssetAccount } from "./asset-data";
import { getAssetTotals, getGroupedAssetAccounts } from "./asset-metrics";
import type { AccountFormValues } from "./asset-model";
import { useAssetAccounts } from "./use-asset-accounts";
import { AssetAccountForm } from "./components/AssetAccountForm";
import { AssetAccountList } from "./components/AssetAccountList";
import { AssetSummary } from "./components/AssetSummary";
import { AssetTypePicker } from "./components/AssetTypePicker";

export function AssetManagementPage() {
  const isMobile = useMediaQuery("(max-width: 40em)");
  const { currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    accounts,
    error: accountsError,
    isLoading: isAccountsLoading,
    saveAccount,
    setError: setAccountsError,
    shouldUseRemote,
  } = useAssetAccounts(currentUser);
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

  const totals = useMemo(() => getAssetTotals(accounts), [accounts]);
  const netAssets = totals.assets - totals.liabilities;
  const groupedAccounts = useMemo(() => getGroupedAssetAccounts(accounts), [accounts]);
  const isAssetLoading = isAuthLoading || isAccountsLoading;

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
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    const saved = await saveAccount({
      editingAccount,
      typeId: selectedType.id,
      values,
    });

    if (saved) {
      form.close();
    }
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
            <Title className="asset-title" order={1}>
              资产管理
            </Title>
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
            <Button
              className="asset-add-button"
              leftSection={<IconPlus size={20} stroke={2.2} />}
              aria-label="添加账户"
              onClick={openCreateFlow}
            >
              添加账户
            </Button>
          </Group>
        </Group>

        <section className="asset-layout" aria-label="资产管理概览">
          <AssetSummary
            accountsCount={accounts.length}
            amountVisible={amountVisible}
            isLoading={isAssetLoading}
            netAssets={netAssets}
            totals={totals}
          />

          <AssetAccountList
            amountVisible={amountVisible}
            collapsedGroups={collapsedGroups}
            error={accountsError}
            groupedAccounts={groupedAccounts}
            isAuthenticated={isAuthenticated}
            isConfigured={isSupabaseConfigured}
            isLoading={isAssetLoading}
            isRemote={shouldUseRemote}
            onAccountClick={handleEdit}
            onCreate={openCreateFlow}
            onToggleGroup={toggleGroup}
          />
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
        position={isMobile ? "bottom" : "right"}
        size={isMobile ? "100dvh" : 520}
        title={editingAccount ? `编辑${selectedType.name}账户` : `添加${selectedType.name}账户`}
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
