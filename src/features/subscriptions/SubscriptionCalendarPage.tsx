import { ActionIcon, Box, Button, Container, Drawer, Group, Loader, Modal, Paper, Text, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconArchive, IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase/client";
import { AuthModal } from "../auth/AuthModal";
import { useAuth } from "../auth/auth-context";
import { SubscriptionArchive } from "./components/SubscriptionArchive";
import { SubscriptionCalendar } from "./components/SubscriptionCalendar";
import { SubscriptionDayAgenda } from "./components/SubscriptionDayAgenda";
import { SubscriptionForm } from "./components/SubscriptionForm";
import { SubscriptionSummary } from "./components/SubscriptionSummary";
import { SubscriptionUpcoming } from "./components/SubscriptionUpcoming";
import type { Subscription } from "./subscription-data";
import { differenceInDays, getOccurrencesInRange, getUpcomingOccurrences, todayDateOnly } from "./subscription-dates";
import { convertCurrencyTotalsToCny } from "./exchange-rates";
import { getEstimatedTotals } from "./subscription-metrics";
import type { SubscriptionFormValues } from "./subscription-model";
import { useExchangeRates } from "./use-exchange-rates";
import { useSubscriptions } from "./use-subscriptions";

export function SubscriptionCalendarPage() {
  const isMobile = useMediaQuery("(max-width: 40em)");
  const { currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    subscriptions,
    error,
    isLoading,
    shouldUseRemote,
    saveSubscription,
    setArchived,
    deleteSubscription,
    setError,
  } = useSubscriptions(currentUser);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [archiveOpened, { open: openArchive, close: closeArchive }] = useDisclosure(false);
  const [authOpened, { open: openAuth, close: closeAuth }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const today = todayDateOnly();
  const [displayMonth, setDisplayMonth] = useState(`${today.slice(0, 7)}-01`);
  const [selectedDate, setSelectedDate] = useState(today);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) openAuth();
  }, [isAuthenticated, isAuthLoading, openAuth]);

  const activeSubscriptions = useMemo(() => subscriptions.filter((item) => item.status === "active"), [subscriptions]);
  const archivedSubscriptions = useMemo(() => subscriptions.filter((item) => item.status === "archived"), [subscriptions]);
  const totals = useMemo(() => getEstimatedTotals(subscriptions, today), [subscriptions, today]);
  const needsExchangeRates = Object.keys(totals.yearly).some((currency) => currency !== "CNY");
  const exchangeRates = useExchangeRates(needsExchangeRates);
  const upcoming = useMemo(() => getUpcomingOccurrences(activeSubscriptions, today), [activeSubscriptions, today]);
  const dueSoonCount = useMemo(
    () => upcoming.filter((occurrence) => differenceInDays(occurrence.date, today) <= 7).length,
    [today, upcoming],
  );
  const yearlyCny = useMemo(
    () => convertCurrencyTotalsToCny(totals.yearly, exchangeRates.data),
    [exchangeRates.data, totals.yearly],
  );
  const selectedOccurrences = useMemo(
    () => subscriptions.flatMap((subscription) => getOccurrencesInRange(subscription, selectedDate, selectedDate)),
    [selectedDate, subscriptions],
  );
  const pageLoading = isAuthLoading || isLoading;

  const openCreate = () => {
    if (!isAuthenticated) {
      openAuth();
      return;
    }
    if (!shouldUseRemote) {
      setError("Supabase 尚未配置，暂时无法保存订阅。");
      return;
    }
    setEditingSubscription(null);
    openForm();
  };

  const openEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    openForm();
  };

  const handleSave = async (values: SubscriptionFormValues) => {
    const saved = await saveSubscription(values, editingSubscription);
    if (saved) closeForm();
    return saved;
  };

  const handleArchive = async (subscription: Subscription) => {
    const archived = await setArchived(subscription, true);
    if (archived) closeForm();
    return archived;
  };

  const handleDelete = async () => {
    if (!deletingSubscription) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (await deleteSubscription(deletingSubscription)) {
        setDeletingSubscription(null);
        closeDelete();
      } else {
        setDeleteError("删除失败，请检查网络后重试。");
      }
    } catch {
      setDeleteError("删除失败，请检查网络后重试。");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box className="subscription-shell">
      <Container size="xl" className="subscription-page">
        <Group className="subscription-topbar" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ActionIcon component={Link} to="/" variant="subtle" className="asset-nav-button" aria-label="返回首页">
              <IconArrowLeft size={22} stroke={2} />
            </ActionIcon>
            <Title className="subscription-title" order={1}>订阅日历</Title>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Button variant="light" className="subscription-archive-button" leftSection={<IconArchive size={18} />} onClick={openArchive}>
              已归档 {archivedSubscriptions.length}
            </Button>
            <Button className="subscription-add-button" leftSection={<IconPlus size={20} />} onClick={openCreate}>添加订阅</Button>
          </Group>
        </Group>

        {error && <Text className="subscription-data-status subscription-data-status-error">数据库同步失败：{error}</Text>}
        {!error && !isAuthenticated && <Text className="subscription-data-status">请先登录，订阅会按用户同步到数据库。</Text>}
        {!error && isAuthenticated && !shouldUseRemote && (
          <Text className="subscription-data-status">{isSupabaseConfigured ? "正在建立数据库会话..." : "Supabase 尚未配置，暂时无法保存订阅。"}</Text>
        )}

        <SubscriptionSummary
          activeCount={activeSubscriptions.length}
          monthly={totals.monthly}
          yearly={totals.yearly}
          yearlyCny={yearlyCny}
          dueSoonCount={dueSoonCount}
          isLoading={pageLoading}
          isYearlyConverting={needsExchangeRates && exchangeRates.isLoading}
        />
        {needsExchangeRates && exchangeRates.isError && (
          <Text className="subscription-data-status">汇率换算暂时不可用，金额按原币种显示。</Text>
        )}

        {pageLoading ? (
          <Paper className="subscription-loading"><Loader color="green" /><Text>正在加载订阅日历…</Text></Paper>
        ) : (
          <section className="subscription-dashboard" aria-label="订阅日历概览">
            <div className="subscription-dashboard-overview">
              <SubscriptionCalendar
                subscriptions={subscriptions}
                monthDate={displayMonth}
                selectedDate={selectedDate}
                onMonthChange={setDisplayMonth}
                onDateSelect={setSelectedDate}
                onCreate={openCreate}
              />
              <SubscriptionUpcoming occurrences={upcoming} today={today} onEdit={openEdit} />
            </div>
            <SubscriptionDayAgenda date={selectedDate} occurrences={selectedOccurrences} onEdit={openEdit} />
          </section>
        )}
      </Container>

      <Drawer
        opened={formOpened}
        onClose={closeForm}
        position={isMobile ? "bottom" : "right"}
        size={isMobile ? "100dvh" : 600}
        title={editingSubscription ? `编辑 ${editingSubscription.name}` : "添加订阅"}
        classNames={{ content: "subscription-form-drawer", header: "subscription-drawer-header", title: "subscription-drawer-title", body: "subscription-drawer-body" }}
      >
        <SubscriptionForm subscription={editingSubscription} onSave={handleSave} onArchive={handleArchive} />
      </Drawer>

      <Drawer
        opened={archiveOpened}
        onClose={closeArchive}
        position={isMobile ? "bottom" : "right"}
        size={isMobile ? "100dvh" : 560}
        title="已归档订阅"
        classNames={{ content: "asset-form-drawer", header: "asset-drawer-header", title: "asset-drawer-title", body: "asset-form-body" }}
      >
        <SubscriptionArchive
          subscriptions={archivedSubscriptions}
          onRestore={(subscription) => setArchived(subscription, false)}
          onDelete={(subscription) => {
            setDeletingSubscription(subscription);
            setDeleteError(null);
            openDelete();
          }}
        />
      </Drawer>

      <Modal
        opened={deleteOpened}
        onClose={() => { if (!isDeleting) closeDelete(); }}
        closeOnClickOutside={!isDeleting}
        closeOnEscape={!isDeleting}
        title="删除订阅"
        centered
      >
        <Text>确定永久删除“{deletingSubscription?.name}”吗？这项操作无法恢复。</Text>
        {deleteError && <Text role="alert" className="subscription-form-error" mt="sm">{deleteError}</Text>}
        <Group justify="flex-end" mt="lg">
          <Button variant="default" disabled={isDeleting} onClick={closeDelete}>取消</Button>
          <Button color="red" loading={isDeleting} onClick={() => void handleDelete()}>永久删除</Button>
        </Group>
      </Modal>
      <AuthModal opened={authOpened} onClose={closeAuth} />
    </Box>
  );
}
