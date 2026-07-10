import {
  Alert,
  Button,
  Group,
  Modal,
  PasswordInput,
  SegmentedControl,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconAlertCircle, IconLock, IconUser } from "@tabler/icons-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "./auth-context";

type AuthMode = "login" | "register";

type AuthModalProps = {
  opened: boolean;
  onClose: () => void;
};

const usernamePattern = /^[a-z0-9_]{3,24}$/;

export function AuthModal({ opened, onClose }: AuthModalProps) {
  const { isConfigured, login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!opened) {
      setError(null);
      setPassword("");
      setIsSubmitting(false);
    }
  }, [opened]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeChange = (nextMode: string) => {
    setMode(nextMode as AuthMode);
    setError(null);
    setPassword("");
  };

  const validateForm = () => {
    const normalizedUsername = username.trim().toLowerCase();

    if (!isConfigured) {
      return "账号服务尚未配置";
    }

    if (!normalizedUsername) {
      return "请输入用户名";
    }

    if (!usernamePattern.test(normalizedUsername)) {
      return "用户名只能包含小写字母、数字、下划线，长度 3-24 位";
    }

    if (!password) {
      return "请输入密码";
    }

    if (password.length < 6) {
      return "密码至少需要 6 位";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "login") {
        await login({ username, password });
      } else {
        await register({ username, password });
      }

      handleClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "操作失败，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      radius="xl"
      size="sm"
      title="进入 life-tools"
      overlayProps={{ blur: 3, backgroundOpacity: 0.18 }}
      classNames={{
        content: "auth-modal-content",
        header: "auth-modal-header",
        title: "auth-modal-title",
        body: "auth-modal-body",
      }}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <Stack gap="md">
          <SegmentedControl
            fullWidth
            value={mode}
            onChange={handleModeChange}
            data={[
              { value: "login", label: "登录" },
              { value: "register", label: "注册" },
            ]}
            classNames={{
              root: "auth-segmented",
              indicator: "auth-segmented-indicator",
              label: "auth-segmented-label",
            }}
          />

          {!isConfigured ? (
            <Alert
              className="auth-alert"
              color="apricot"
              icon={<IconAlertCircle size={18} />}
              radius="lg"
            >
              账号服务尚未配置
            </Alert>
          ) : null}

          {error ? (
            <Alert
              className="auth-alert"
              color="apricot"
              icon={<IconAlertCircle size={18} />}
              radius="lg"
            >
              {error}
            </Alert>
          ) : null}

          <TextInput
            label="用户名"
            placeholder="输入用户名"
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value.toLowerCase())}
            leftSection={<IconUser size={18} />}
            autoComplete="username"
            radius="lg"
          />

          <PasswordInput
            label="密码"
            placeholder="输入密码"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            leftSection={<IconLock size={18} />}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            radius="lg"
          />

          <Group justify="flex-end" className="auth-actions">
            <Button
              className="modal-action"
              type="submit"
              radius="xl"
              loading={isSubmitting}
              disabled={!isConfigured}
            >
              {mode === "login" ? "登录" : "创建账号"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
