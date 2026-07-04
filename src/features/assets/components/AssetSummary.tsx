import { Box, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { formatAmount } from "../asset-format";
import type { AssetTotals } from "../asset-metrics";

export function AssetSummary({
  accountsCount,
  amountVisible,
  netAssets,
  totals,
}: {
  accountsCount: number;
  amountVisible: boolean;
  netAssets: number;
  totals: AssetTotals;
}) {
  return (
    <Stack gap="md" className="asset-summary-column">
      <Paper className="asset-net-card">
        <Text className="asset-card-label">净资产</Text>
        <Text className="asset-net-amount">{formatAmount(netAssets, amountVisible)}</Text>
        <SimpleGrid cols={2} spacing="md" className="asset-metric-grid">
          <Box>
            <Text className="asset-card-label">总资产</Text>
            <Text className="asset-metric-value">{formatAmount(totals.assets, amountVisible)}</Text>
          </Box>
          <Box>
            <Text className="asset-card-label">总负债</Text>
            <Text className="asset-metric-value">{formatAmount(totals.liabilities, amountVisible)}</Text>
          </Box>
        </SimpleGrid>
      </Paper>

      <SimpleGrid cols={2} spacing="md" className="asset-flow-grid">
        <Paper className="asset-small-card">
          <Text className="asset-card-label">账户数</Text>
          <Text className="asset-metric-value">{accountsCount}</Text>
        </Paper>
        <Paper className="asset-small-card">
          <Text className="asset-card-label">币种</Text>
          <Text className="asset-metric-value">CNY</Text>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
