import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import "dayjs/locale/zh-cn";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Subscription } from "../subscription-data";
import { SubscriptionCalendar } from "./SubscriptionCalendar";
import { SubscriptionDayAgenda } from "./SubscriptionDayAgenda";
import { prepareSubscriptionForm, SubscriptionForm } from "./SubscriptionForm";
import { SubscriptionMark } from "./SubscriptionMark";
import { SubscriptionSummary } from "./SubscriptionSummary";
import { SubscriptionUpcoming } from "./SubscriptionUpcoming";

const datesSettings = {
  locale: "zh-cn",
  firstDayOfWeek: 1 as const,
  weekendDays: [0, 6] as [0, 6],
  consistentWeeks: true,
};
const subscriptionFixture: Subscription = {
  id: "subscription-1",
  providerKey: "chatgpt",
  name: "ChatGPT",
  category: "ai",
  planName: "Plus",
  note: "keep me",
  amount: 20,
  currency: "USD",
  billingIntervalCount: 1,
  billingIntervalUnit: "month",
  trackingStartedOn: "2026-01-01",
  renewalAnchorOn: "2026-07-30",
  reminderOffsets: [0, 7],
  status: "active",
  archivedOn: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderWithProviders(component: React.ReactNode) {
  return renderToStaticMarkup(
    <MantineProvider>
      <DatesProvider settings={datesSettings}>{component}</DatesProvider>
    </MantineProvider>,
  );
}

describe("subscription Mantine components", () => {
  it("keeps subscription entry focused on the fields needed to save", () => {
    const markup = renderWithProviders(
      <SubscriptionForm
        subscription={null}
        onSave={async () => true}
        onArchive={async () => true}
      />,
    );
    expect(markup).toContain("服务名称");
    expect(markup).toContain("每期金额");
    expect(markup).toContain("续费周期");
    expect(markup).toContain("mantine-Select-root");
    expect(markup).not.toContain("mantine-SegmentedControl-root");
    expect(markup).toContain("下一续费日");
    expect(markup).toContain("站内提醒时间");
    expect(markup).toContain("续费当天");
    expect(markup).toContain("提前 1 天");
    expect(markup).toContain("提前 3 天");
    expect(markup).toContain("提前 7 天");
    expect(markup).toContain('role="group"');
    expect(markup.match(/type="checkbox"/g)).toHaveLength(4);
    expect(markup).not.toContain("mantine-MultiSelect-root");
    expect(markup).not.toContain("套餐名称");
    expect(markup).not.toContain("分类");
    expect(markup).not.toContain("开始记录日");
    expect(markup).not.toContain("补充说明");
    expect(markup).not.toContain('type="date"');
  });

  it("derives preset service details without asking for a duplicate name", () => {
    const markup = renderWithProviders(
      <SubscriptionForm
        subscription={{ ...subscriptionFixture, reminderOffsets: [14, 30] }}
        onSave={async () => true}
        onArchive={async () => true}
      />,
    );
    expect(markup).toContain("ChatGPT");
    expect(markup).not.toContain("服务名称");
    expect(markup).not.toContain("keep me");
    expect(markup).toContain("归档");
    expect(markup).toContain("提前 14 天（旧设置）");
    expect(markup).toContain("提前 30 天（旧设置）");
  });

  it("validates all core fields through the form error path", () => {
    const prepared = prepareSubscriptionForm({
      subscription: null,
      providerValue: "__custom",
      name: "",
      amount: "",
      currency: "CNY",
      cyclePreset: "custom",
      customCount: 0,
      customUnit: "month",
      renewalAnchorOn: "",
      reminderOffsets: [],
    });
    expect(prepared.values).toBeNull();
    expect(prepared.errors).toEqual({
      name: "请输入服务名称",
      amount: "请输入有效金额",
      cycle: "请输入 1 到 3650 之间的整数",
      renewal: "请选择下一续费日",
      reminders: "请至少选择一个提醒时间",
    });
  });

  it("derives presets and preserves hidden values while editing", () => {
    const prepared = prepareSubscriptionForm({
      subscription: subscriptionFixture,
      providerValue: "chatgpt",
      name: "ignored",
      amount: 200,
      currency: "CNY",
      cyclePreset: "yearly",
      customCount: 99,
      customUnit: "day",
      renewalAnchorOn: "2027-01-01",
      reminderOffsets: ["3", "14"],
    });
    expect(prepared.errors).toEqual({});
    expect(prepared.values).toMatchObject({
      providerKey: "chatgpt",
      name: "ChatGPT",
      category: "ai",
      planName: "Plus",
      note: "keep me",
      billingIntervalCount: 1,
      billingIntervalUnit: "year",
      trackingStartedOn: "2026-01-01",
      reminderOffsets: [3, 14],
    });
  });

  it("uses compatible defaults for a new custom subscription", () => {
    const prepared = prepareSubscriptionForm({
      subscription: null,
      providerValue: "__custom",
      name: "  健身房  ",
      amount: 299,
      currency: "CNY",
      cyclePreset: "custom",
      customCount: 3,
      customUnit: "month",
      renewalAnchorOn: "2026-08-01",
      reminderOffsets: ["0", "7"],
    });
    expect(prepared.values).toMatchObject({
      providerKey: null,
      name: "健身房",
      category: "other",
      planName: "",
      note: "",
      billingIntervalCount: 3,
      billingIntervalUnit: "month",
      reminderOffsets: [0, 7],
    });
    expect(prepared.values?.trackingStartedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("keeps the official calendar visible with no subscriptions", () => {
    const markup = renderWithProviders(
      <SubscriptionCalendar
        subscriptions={[]}
        monthDate="2026-07-01"
        selectedDate="2026-07-10"
        onMonthChange={() => undefined}
        onDateSelect={() => undefined}
        onCreate={() => undefined}
      />,
    );
    expect(markup).toContain("续费月历");
    expect(markup).toContain("还没有正在续费的会员");
    expect(markup).toContain("2026年7月");
  });

  it("renders the four overview metrics in the mobile-safe grid", () => {
    const markup = renderWithProviders(
      <SubscriptionSummary
        activeCount={8}
        monthly={{ USD: 74 }}
        yearly={{ USD: 748 }}
        yearlyCny={12_800}
        dueSoonCount={3}
        isLoading={false}
        isYearlyConverting={false}
      />,
    );
    expect(markup).toContain("正在管理");
    expect(markup).toContain("本月预计");
    expect(markup).toContain("本年预计");
    expect(markup).toContain("续费提醒");
    expect(markup).toContain("1.28万");
  });

  it("shows reminder status only when the selected offset is due", () => {
    const markup = renderWithProviders(
      <SubscriptionUpcoming
        today="2026-07-10"
        occurrences={[
          { id: "due", date: "2026-07-17", subscription: subscriptionFixture },
          { id: "normal", date: "2026-07-13", subscription: subscriptionFixture },
        ]}
        onEdit={() => undefined}
      />,
    );
    expect(markup).toContain("提醒中");
    expect(markup).toContain("正常");
  });

  it("renders the selected-day table and a brand icon", () => {
    const tableMarkup = renderWithProviders(
      <SubscriptionDayAgenda
        date="2026-07-30"
        occurrences={[{ id: "subscription-1:2026-07-30", date: "2026-07-30", subscription: subscriptionFixture }]}
        onEdit={() => undefined}
      />,
    );
    const markMarkup = renderWithProviders(
      <SubscriptionMark subscription={{ providerKey: "chatgpt", name: "ChatGPT", category: "ai" }} />,
    );
    expect(tableMarkup).toContain("分类 / 套餐");
    expect(tableMarkup).toContain("续费周期");
    expect(tableMarkup).toContain("提前 7 天");
    expect(tableMarkup).toContain("编辑 ChatGPT");
    expect(markMarkup).toContain("tabler-icon-brand-openai");
    expect(markMarkup).not.toContain("GPT");
  });
});
