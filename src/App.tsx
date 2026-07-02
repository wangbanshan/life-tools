import { Box, Button, Container, Group, Modal, Text, Title, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowRight,
  IconCalendarRepeat,
  IconLayoutGrid,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { type ComponentType, useState } from "react";
import { AccountMenu } from "./AccountMenu";
import { AuthModal } from "./AuthModal";
import { useAuth } from "./auth";

type ToolAccent = "sage" | "apricot";

type ToolItem = {
  title: string;
  description: string;
  accent: ToolAccent;
  Icon: ComponentType<{ size?: number; stroke?: number }>;
  requiresAuth?: boolean;
};

const tools: ToolItem[] = [
  {
    title: "资产管理",
    description: "记录账户、存款和支出",
    accent: "sage",
    Icon: IconWallet,
  },
  {
    title: "订阅管理",
    description: "查看续费时间和月度开销",
    accent: "apricot",
    Icon: IconCalendarRepeat,
  },
  {
    title: "共享账本",
    description: "一起记录，收支更清楚",
    accent: "sage",
    Icon: IconUsers,
  },
  {
    title: "更多工具",
    description: "后续按需慢慢加",
    accent: "apricot",
    Icon: IconLayoutGrid,
  },
];

export function App() {
  const [opened, { open, close }] = useDisclosure(false);
  const [authOpened, authModal] = useDisclosure(false);
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);
  const { isAuthenticated } = useAuth();

  const handleToolClick = (tool: ToolItem) => {
    if (tool.requiresAuth && !isAuthenticated) {
      authModal.open();
      return;
    }

    setActiveTool(tool);
    open();
  };

  return (
    <Box className="app-shell">
      <header className="site-header">
        <Container size="xl" className="header-inner">
          <a className="brand" href="/" aria-label="life-tools 首页">
            <span className="brand-mark-wrap">
              <img src="/life-tools-logo.svg" alt="" className="brand-mark" />
            </span>
            <span className="brand-text">life-tools</span>
          </a>

          <AccountMenu onLoginClick={authModal.open} />
        </Container>
      </header>

      <Container size="xl" component="main" className="main-content">
        <section className="hero" aria-labelledby="home-title">
          <Title id="home-title" className="hero-title">
            把常用工具放在一起
          </Title>
          <Text className="hero-subtitle">
            资产、订阅、共享记录，都能在这里统一查看。
          </Text>
        </section>

        <section className="tools-grid" aria-label="工具入口">
          {tools.map((tool) => (
            <button
              className={`tool-card tool-card-${tool.accent}`}
              key={tool.title}
              type="button"
              onClick={() => handleToolClick(tool)}
            >
              <span className="tool-card-topline" aria-hidden="true" />
              <span className="tool-card-head">
                <span className="tool-icon-box">
                  <tool.Icon size={58} stroke={1.55} />
                </span>
              </span>
              <span className="tool-copy">
                <span className="tool-title">{tool.title}</span>
                <span className="tool-description">{tool.description}</span>
              </span>
              <span className="tool-arrow-wrap" aria-hidden="true">
                <IconArrowRight className="tool-arrow" size={24} stroke={1.8} />
              </span>
            </button>
          ))}
        </section>
      </Container>

      <Modal
        opened={opened}
        onClose={close}
        centered
        radius="xl"
        title={activeTool?.title}
        overlayProps={{ blur: 3, backgroundOpacity: 0.18 }}
      >
        <Text c="var(--lt-muted)" lh={1.8}>
          {activeTool?.description}
        </Text>
        <Text mt="sm" c="var(--lt-muted)" lh={1.8}>
          这个入口已经预留好，下一阶段接入后端后就可以继续完善。
        </Text>
        <Group justify="flex-end" mt={rem(24)}>
          <Button className="modal-action" onClick={close} radius="xl">
            知道了
          </Button>
        </Group>
      </Modal>

      <AuthModal opened={authOpened} onClose={authModal.close} />
    </Box>
  );
}
