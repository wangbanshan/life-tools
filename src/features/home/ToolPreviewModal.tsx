import { Button, Group, Modal, Text, rem } from "@mantine/core";
import type { ToolItem } from "./tools";

type ToolPreviewModalProps = {
  opened: boolean;
  tool: ToolItem | null;
  onClose: () => void;
};

export function ToolPreviewModal({ opened, tool, onClose }: ToolPreviewModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="xl"
      title={tool?.title}
      overlayProps={{ blur: 3, backgroundOpacity: 0.18 }}
    >
      <Text c="var(--lt-muted)" lh={1.8}>
        {tool?.detail}
      </Text>
      <Text mt="sm" c="var(--lt-muted)" lh={1.8}>
        这个入口已经接入首页导航，下一阶段会继续补齐真实数据和操作流程。
      </Text>
      <Group justify="flex-end" mt={rem(24)}>
        <Button className="modal-action" onClick={onClose} radius="xl">
          先看看
        </Button>
      </Group>
    </Modal>
  );
}
