import { Text } from "@mantine/core";

export function AssetDataStatus({
  error,
  isAuthenticated,
  isConfigured,
  isRemote,
}: {
  error: string | null;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isRemote: boolean;
}) {
  if (error) {
    return <Text className="asset-data-status asset-data-status-error">数据库同步失败：{error}</Text>;
  }

  if (!isAuthenticated) {
    return <Text className="asset-data-status">请先登录，资产账户会按用户同步到数据库。</Text>;
  }

  if (!isRemote) {
    return <Text className="asset-data-status">{isConfigured ? "正在建立数据库会话..." : "Supabase 尚未配置，暂时无法保存资产账户。"}</Text>;
  }

  return null;
}
