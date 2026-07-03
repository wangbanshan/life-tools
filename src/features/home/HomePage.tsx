import { Box, Container, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthModal } from "../auth/AuthModal";
import { useAuth } from "../auth/auth-context";
import { HomeHeader } from "./HomeHeader";
import { ToolCard } from "./ToolCard";
import { ToolPreviewModal } from "./ToolPreviewModal";
import { tools, type ToolItem } from "./tools";

export function HomePage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [authOpened, authModal] = useDisclosure(false);
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleToolClick = (tool: ToolItem) => {
    if (tool.requiresAuth && !isAuthenticated) {
      authModal.open();
      return;
    }

    if (tool.path) {
      void navigate({ to: tool.path });
      return;
    }

    setActiveTool(tool);
    open();
  };

  return (
    <Box className="app-shell">
      <HomeHeader onLoginClick={authModal.open} />

      <Container size="xl" component="main" className="main-content">
        <section className="hero" aria-labelledby="home-title">
          <Text className="hero-kicker">Personal Life Toolkit</Text>
          <Title id="home-title" className="hero-title">
            生活里的小事务，有个稳定入口
          </Title>
          <Text className="hero-subtitle">
            资产、订阅、共享账本和更多日常工具，集中在一个轻量工作台里。
          </Text>
        </section>

        <section className="tools-grid" aria-label="工具入口">
          {tools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} onClick={handleToolClick} />
          ))}
        </section>
      </Container>

      <ToolPreviewModal opened={opened} tool={activeTool} onClose={close} />
      <AuthModal opened={authOpened} onClose={authModal.close} />
    </Box>
  );
}
