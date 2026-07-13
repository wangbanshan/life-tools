import {
  Box,
  Drawer,
  Group,
  ScrollArea,
  Select,
  Text,
  TextInput,
  UnstyledButton,
  type SelectProps,
} from "@mantine/core";
import { IconCheck, IconChevronRight, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import {
  subscriptionCategories,
  subscriptionPresets,
  subscriptionPresetsByKey,
} from "../subscription-data";
import { SubscriptionMark } from "./SubscriptionMark";

const serviceGroups = subscriptionCategories.map((category) => ({
  ...category,
  presets: subscriptionPresets.filter((preset) => preset.category === category.value),
}));
const serviceOptions = [
  ...serviceGroups.map((group) => ({
    group: group.label,
    items: group.presets.map((preset) => ({ value: preset.key, label: preset.name })),
  })),
  { group: "自定义", items: [{ value: "__custom", label: "自定义服务" }] },
];
const categoryLabels = new Map(subscriptionCategories.map((category) => [category.value, category.label]));

export const subscriptionSelectClassNames = {
  input: "subscription-input",
  dropdown: "subscription-select-dropdown",
  option: "subscription-select-option",
  groupLabel: "subscription-select-group-label",
};
export const subscriptionSelectComboboxProps = { withinPortal: true, shadow: "lg" as const };

function ServiceOption({ value, label, checked }: { value: string; label: string; checked: boolean }) {
  const preset = subscriptionPresetsByKey[value];
  return (
    <Group className="subscription-service-option" gap="sm" wrap="nowrap">
      <SubscriptionMark
        subscription={{ providerKey: preset?.key ?? null, name: preset?.name ?? label }}
        size="sm"
      />
      <Box className="subscription-service-option-copy">
        <Text className="subscription-service-option-name">{label}</Text>
        <Text className="subscription-service-option-category">
          {preset ? categoryLabels.get(preset.category) : "填写任意会员服务"}
        </Text>
      </Box>
      {checked && <IconCheck className="subscription-service-option-check" size={17} aria-hidden="true" />}
    </Group>
  );
}

const renderServiceOption: NonNullable<SelectProps["renderOption"]> = ({ option, checked }) => (
  <ServiceOption value={option.value} label={option.label} checked={Boolean(checked)} />
);

function MobileServicePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");
  const selectedPreset = subscriptionPresetsByKey[value];
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const groups = serviceGroups
    .map((group) => ({
      ...group,
      presets: group.presets.filter(
        (preset) => !normalizedSearch || preset.name.toLocaleLowerCase().includes(normalizedSearch),
      ),
    }))
    .filter((category) => category.presets.length > 0);

  const choose = (nextValue: string) => {
    onChange(nextValue);
    setOpened(false);
    setSearch("");
  };

  return (
    <>
      <div>
        <Text className="subscription-field-label">服务</Text>
        <UnstyledButton className="subscription-service-trigger" onClick={() => setOpened(true)}>
          <Group gap="sm" wrap="nowrap">
            <SubscriptionMark
              subscription={{
                providerKey: selectedPreset?.key ?? null,
                name: selectedPreset?.name ?? "自定义服务",
              }}
              size="sm"
            />
            <Text className="subscription-service-trigger-name">
              {selectedPreset?.name ?? "自定义服务"}
            </Text>
            <IconChevronRight size={18} aria-hidden="true" />
          </Group>
        </UnstyledButton>
      </div>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="bottom"
        size="78dvh"
        title="选择服务"
        classNames={{
          content: "subscription-service-drawer",
          header: "subscription-service-drawer-header",
          title: "subscription-service-drawer-title",
          body: "subscription-service-drawer-body",
        }}
      >
        <TextInput
          data-autofocus
          aria-label="搜索服务"
          placeholder="搜索服务"
          leftSection={<IconSearch size={18} aria-hidden="true" />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          classNames={{ input: "subscription-input" }}
        />
        <ScrollArea className="subscription-service-list" type="auto">
          {groups.map((group) => (
            <section key={group.value} className="subscription-service-group" aria-label={group.label}>
              <Text className="subscription-service-group-title">{group.label}</Text>
              {group.presets.map((preset) => (
                <UnstyledButton
                  key={preset.key}
                  className="subscription-service-row"
                  data-selected={preset.key === value || undefined}
                  onClick={() => choose(preset.key)}
                >
                  <ServiceOption value={preset.key} label={preset.name} checked={preset.key === value} />
                </UnstyledButton>
              ))}
            </section>
          ))}
          <section className="subscription-service-group" aria-label="自定义">
            <Text className="subscription-service-group-title">自定义</Text>
            <UnstyledButton
              className="subscription-service-row"
              data-selected={value === "__custom" || undefined}
              onClick={() => choose("__custom")}
            >
              <ServiceOption value="__custom" label="自定义服务" checked={value === "__custom"} />
            </UnstyledButton>
          </section>
        </ScrollArea>
      </Drawer>
    </>
  );
}

export function SubscriptionServicePicker({
  isMobile,
  value,
  name,
  onChange,
}: {
  isMobile: boolean | undefined;
  value: string;
  name: string;
  onChange: (value: string | null) => void;
}) {
  if (isMobile) return <MobileServicePicker value={value} onChange={onChange} />;

  const selectedPreset = subscriptionPresetsByKey[value];
  return (
    <Select
      label="服务"
      data={serviceOptions}
      searchable
      allowDeselect={false}
      nothingFoundMessage="没有匹配的服务，可选择自定义服务"
      maxDropdownHeight={360}
      renderOption={renderServiceOption}
      withCheckIcon={false}
      leftSection={
        <SubscriptionMark
          subscription={{
            providerKey: selectedPreset?.key ?? null,
            name: selectedPreset?.name ?? (name || "自定义服务"),
          }}
          size="sm"
        />
      }
      comboboxProps={subscriptionSelectComboboxProps}
      value={value}
      onChange={onChange}
      classNames={subscriptionSelectClassNames}
    />
  );
}
