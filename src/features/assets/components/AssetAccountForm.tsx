import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Group,
  NumberInput,
  Paper,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconChevronRight, IconDeviceFloppy } from "@tabler/icons-react";
import type { AssetAccount, AssetType } from "../asset-data";
import type { AccountFormValues } from "../asset-model";
import { TypeIcon } from "./TypeIcon";

export function AssetAccountForm({
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
