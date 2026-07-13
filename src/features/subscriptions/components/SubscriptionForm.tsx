import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconArchive,
  IconCalendar,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import type { BillingUnit, Subscription } from "../subscription-data";
import {
  subscriptionPresetsByKey,
  supportedCurrencies,
} from "../subscription-data";
import { todayDateOnly } from "../subscription-dates";
import type { SubscriptionFormValues } from "../subscription-model";
import {
  SubscriptionServicePicker,
  subscriptionSelectClassNames,
  subscriptionSelectComboboxProps,
} from "./SubscriptionServicePicker";

type CyclePreset = "monthly" | "quarterly" | "half-year" | "yearly" | "custom";
type FormErrors = Partial<Record<"name" | "amount" | "cycle" | "renewal" | "reminders", string>>;

const cycleOptions = [
  { value: "monthly", label: "月付" },
  { value: "quarterly", label: "季付" },
  { value: "half-year", label: "半年" },
  { value: "yearly", label: "年付" },
  { value: "custom", label: "自定义" },
];
const reminderOptions = [0, 1, 3, 7].map((offset) => ({
  value: String(offset),
  label: offset === 0 ? "续费当天" : `提前 ${offset} 天`,
}));
const datePopoverProps = { withinPortal: true, shadow: "xl" as const, position: "bottom-start" as const };

function getCyclePreset(subscription: Subscription | null): CyclePreset {
  if (!subscription) return "monthly";
  if (subscription.billingIntervalUnit === "month" && subscription.billingIntervalCount === 1) return "monthly";
  if (subscription.billingIntervalUnit === "month" && subscription.billingIntervalCount === 3) return "quarterly";
  if (subscription.billingIntervalUnit === "month" && subscription.billingIntervalCount === 6) return "half-year";
  if (subscription.billingIntervalUnit === "year" && subscription.billingIntervalCount === 1) return "yearly";
  return "custom";
}

function getProviderValue(subscription: Subscription | null) {
  return subscription?.providerKey && subscriptionPresetsByKey[subscription.providerKey]
    ? subscription.providerKey
    : "__custom";
}

function cycleValues(preset: CyclePreset, customCount: number, customUnit: BillingUnit) {
  if (preset === "monthly") return { count: 1, unit: "month" as const };
  if (preset === "quarterly") return { count: 3, unit: "month" as const };
  if (preset === "half-year") return { count: 6, unit: "month" as const };
  if (preset === "yearly") return { count: 1, unit: "year" as const };
  return { count: customCount, unit: customUnit };
}

export function prepareSubscriptionForm({
  subscription,
  providerValue,
  name,
  amount,
  currency,
  cyclePreset,
  customCount,
  customUnit,
  renewalAnchorOn,
  reminderOffsets,
}: {
  subscription: Subscription | null;
  providerValue: string;
  name: string;
  amount: string | number;
  currency: string;
  cyclePreset: CyclePreset;
  customCount: string | number;
  customUnit: BillingUnit;
  renewalAnchorOn: string;
  reminderOffsets: string[];
}): { errors: FormErrors; values: SubscriptionFormValues | null } {
  const selectedPreset = subscriptionPresetsByKey[providerValue];
  const normalizedAmount = typeof amount === "number" ? amount : Number(amount);
  const normalizedCount = typeof customCount === "number" ? customCount : Number(customCount);
  const cycle = cycleValues(cyclePreset, normalizedCount, customUnit);
  const errors: FormErrors = {};
  if (!selectedPreset && !name.trim()) errors.name = "请输入服务名称";
  if (amount === "" || !Number.isFinite(normalizedAmount) || normalizedAmount < 0) {
    errors.amount = "请输入有效金额";
  }
  if (!Number.isInteger(cycle.count) || cycle.count < 1 || cycle.count > 3650) {
    errors.cycle = "请输入 1 到 3650 之间的整数";
  }
  if (!renewalAnchorOn) errors.renewal = "请选择下一续费日";
  if (reminderOffsets.length === 0) errors.reminders = "请至少选择一个提醒时间";
  if (Object.keys(errors).length > 0) return { errors, values: null };

  return {
    errors,
    values: {
      providerKey: selectedPreset?.key ?? null,
      name: selectedPreset?.name ?? name.trim(),
      category: selectedPreset?.category ?? "other",
      planName: subscription?.planName ?? "",
      note: subscription?.note ?? "",
      amount: normalizedAmount,
      currency,
      billingIntervalCount: cycle.count,
      billingIntervalUnit: cycle.unit,
      trackingStartedOn: subscription?.trackingStartedOn ?? todayDateOnly(),
      renewalAnchorOn,
      reminderOffsets: reminderOffsets.map(Number),
    },
  };
}

export function SubscriptionForm({
  subscription,
  onSave,
  onArchive,
}: {
  subscription: Subscription | null;
  onSave: (values: SubscriptionFormValues) => Promise<boolean>;
  onArchive: (subscription: Subscription) => Promise<boolean>;
}) {
  const isMobile = useMediaQuery("(max-width: 40em)");
  const [providerValue, setProviderValue] = useState(getProviderValue(subscription));
  const [name, setName] = useState(subscription?.name ?? "");
  const [amount, setAmount] = useState<string | number>(subscription?.amount ?? 0);
  const [currency, setCurrency] = useState(subscription?.currency ?? "CNY");
  const [cyclePreset, setCyclePreset] = useState<CyclePreset>(getCyclePreset(subscription));
  const [customCount, setCustomCount] = useState<string | number>(subscription?.billingIntervalCount ?? 1);
  const [customUnit, setCustomUnit] = useState<BillingUnit>(subscription?.billingIntervalUnit ?? "month");
  const [renewalAnchorOn, setRenewalAnchorOn] = useState(subscription?.renewalAnchorOn ?? todayDateOnly());
  const [reminderOffsets, setReminderOffsets] = useState(
    (subscription?.reminderOffsets ?? [0, 7]).map(String),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLInputElement>(null);
  const renewalRef = useRef<HTMLButtonElement>(null);
  const reminderRef = useRef<HTMLInputElement>(null);

  const selectedPreset = subscriptionPresetsByKey[providerValue];
  const todayPreset = [{ value: todayDateOnly(), label: "今天" }];
  const reminderData = [
    ...reminderOptions,
    ...reminderOffsets
      .filter((offset) => !reminderOptions.some((option) => option.value === offset))
      .map((offset) => ({ value: offset, label: `提前 ${offset} 天（旧设置）` })),
  ];

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  };

  const handleProviderChange = (value: string | null) => {
    const nextValue = value ?? "__custom";
    setProviderValue(nextValue);
    setName(subscriptionPresetsByKey[nextValue]?.name ?? "");
    clearError("name");
  };

  const handleSave = async () => {
    const prepared = prepareSubscriptionForm({
      subscription,
      providerValue,
      name,
      amount,
      currency,
      cyclePreset,
      customCount,
      customUnit,
      renewalAnchorOn,
      reminderOffsets,
    });
    setErrors(prepared.errors);
    setSubmitError(null);

    if (prepared.errors.name) return nameRef.current?.focus();
    if (prepared.errors.amount) return amountRef.current?.focus();
    if (prepared.errors.cycle) return countRef.current?.focus();
    if (prepared.errors.renewal) return renewalRef.current?.focus();
    if (prepared.errors.reminders) return reminderRef.current?.focus();
    if (!prepared.values) return;

    setIsSaving(true);
    try {
      const saved = await onSave(prepared.values);
      if (!saved) setSubmitError("保存失败，请检查网络后重试。");
    } catch {
      setSubmitError("保存失败，请检查网络后重试。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!subscription) return;
    setIsArchiving(true);
    setSubmitError(null);
    try {
      if (!await onArchive(subscription)) setSubmitError("归档失败，请检查网络后重试。");
    } catch {
      setSubmitError("归档失败，请检查网络后重试。");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <form
      className="subscription-form"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <Stack className="subscription-form-surface" gap="md">
        <SubscriptionServicePicker
          isMobile={isMobile}
          value={providerValue}
          name={name}
          onChange={handleProviderChange}
        />

        {!selectedPreset && (
          <TextInput
            ref={nameRef}
            label="服务名称"
            withAsterisk
            placeholder="例如健身房、宽带会员"
            value={name}
            error={errors.name}
            onChange={(event) => {
              setName(event.currentTarget.value);
              clearError("name");
            }}
            classNames={{ input: "subscription-input" }}
          />
        )}

        <div className="subscription-form-grid subscription-form-grid-amount">
          <NumberInput
            ref={amountRef}
            label="每期金额"
            withAsterisk
            min={0}
            decimalScale={2}
            fixedDecimalScale
            value={amount}
            error={errors.amount}
            onChange={(value) => {
              setAmount(value);
              clearError("amount");
            }}
            classNames={{ input: "subscription-input" }}
          />
          <Select
            label="币种"
            searchable
            allowDeselect={false}
            data={[...supportedCurrencies]}
            comboboxProps={subscriptionSelectComboboxProps}
            value={currency}
            onChange={(value) => setCurrency(value ?? "CNY")}
            classNames={subscriptionSelectClassNames}
          />
        </div>

        <div className="subscription-cycle-field">
          <Text className="subscription-field-label">续费周期</Text>
          <SegmentedControl
            fullWidth
            data={cycleOptions}
            value={cyclePreset}
            onChange={(value) => {
              setCyclePreset(value as CyclePreset);
              clearError("cycle");
            }}
            className="subscription-cycle-control subscription-cycle-desktop"
          />
          <Select
            aria-label="续费周期"
            data={cycleOptions}
            allowDeselect={false}
            value={cyclePreset}
            onChange={(value) => {
              setCyclePreset((value as CyclePreset | null) ?? "monthly");
              clearError("cycle");
            }}
            className="subscription-cycle-mobile"
            classNames={subscriptionSelectClassNames}
          />
        </div>

        {cyclePreset === "custom" && (
          <div className="subscription-form-grid subscription-form-grid-two subscription-custom-cycle">
            <NumberInput
              ref={countRef}
              label="每隔"
              min={1}
              max={3650}
              allowDecimal={false}
              value={customCount}
              error={errors.cycle}
              onChange={(value) => {
                setCustomCount(value);
                clearError("cycle");
              }}
              classNames={{ input: "subscription-input" }}
            />
            <Select
              label="单位"
              data={[
                { value: "day", label: "天" },
                { value: "month", label: "个月" },
                { value: "year", label: "年" },
              ]}
              allowDeselect={false}
              comboboxProps={subscriptionSelectComboboxProps}
              value={customUnit}
              onChange={(value) => setCustomUnit((value as BillingUnit | null) ?? "month")}
              classNames={subscriptionSelectClassNames}
            />
          </div>
        )}

        <DatePickerInput
          ref={renewalRef}
          label="下一续费日"
          withAsterisk
          value={renewalAnchorOn || null}
          valueFormat="YYYY年M月D日"
          placeholder="选择下一续费日"
          leftSection={<IconCalendar size={18} aria-hidden="true" />}
          dropdownType={isMobile ? "modal" : "popover"}
          popoverProps={datePopoverProps}
          modalProps={{ centered: true, title: "选择下一续费日" }}
          presets={todayPreset}
          highlightToday
          error={errors.renewal}
          onChange={(value) => {
            setRenewalAnchorOn(value ?? "");
            clearError("renewal");
          }}
          classNames={{ input: "subscription-input" }}
        />

        <Checkbox.Group
          label="站内提醒时间"
          description="命中所选日期时，会出现在续费提醒中"
          withAsterisk
          value={reminderOffsets}
          onChange={(value) => {
            setReminderOffsets(value);
            clearError("reminders");
          }}
          error={errors.reminders}
        >
          <Group gap="md" mt="xs">
            {reminderData.map((option, index) => (
              <Checkbox
                key={option.value}
                ref={index === 0 ? reminderRef : undefined}
                value={option.value}
                label={option.label}
              />
            ))}
          </Group>
        </Checkbox.Group>
      </Stack>

      <div className="subscription-form-footer">
        {submitError && <Text role="alert" className="subscription-form-error">{submitError}</Text>}
        <Group className="subscription-form-actions" grow>
          {subscription && subscription.status === "active" && (
            <Button
              type="button"
              variant="light"
              color="gray"
              loading={isArchiving}
              disabled={isSaving || isArchiving}
              leftSection={<IconArchive size={18} aria-hidden="true" />}
              onClick={() => void handleArchive()}
            >
              归档
            </Button>
          )}
          <Button
            type="submit"
            className="subscription-save-button"
            loading={isSaving}
            disabled={isSaving || isArchiving}
            leftSection={<IconDeviceFloppy size={18} aria-hidden="true" />}
          >
            保存订阅
          </Button>
        </Group>
      </div>
    </form>
  );
}
