import { ActionIcon, Menu, Text, Tooltip } from "@mantine/core";
import { IconLogout, IconSettings, IconUserCircle } from "@tabler/icons-react";
import { useAuth } from "./auth-context";

type AccountMenuProps = {
  onLoginClick: () => void;
};

export function AccountMenu({ onLoginClick }: AccountMenuProps) {
  const { currentUser, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return (
      <Tooltip label="登录 / 注册" withArrow>
        <ActionIcon
          className="avatar-button"
          variant="subtle"
          radius="xl"
          size={52}
          aria-label="登录或注册"
          onClick={onLoginClick}
        >
          <IconUserCircle size={34} stroke={1.6} />
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Menu position="bottom-end" shadow="md" width={236} radius="lg">
      <Menu.Target>
        <Tooltip label="个人工作台" withArrow>
          <ActionIcon
            className="avatar-button avatar-button-active"
            variant="subtle"
            radius="xl"
            size={52}
            aria-label="打开账户菜单"
          >
            <IconUserCircle size={34} stroke={1.6} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown className="account-dropdown">
        <Menu.Label>当前账号</Menu.Label>
        <div className="account-card">
          <Text className="account-name">{currentUser.username}</Text>
          <Text className="account-email">在线同步中</Text>
        </div>
        <Menu.Divider />
        <Menu.Item leftSection={<IconSettings size={17} />} disabled>
          账号设置
        </Menu.Item>
        <Menu.Item leftSection={<IconLogout size={17} />} color="apricot" onClick={logout}>
          退出登录
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
