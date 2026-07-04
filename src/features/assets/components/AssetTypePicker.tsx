import { ScrollArea, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { assetGroups, assetTypes } from "../asset-data";
import { TypeIcon } from "./TypeIcon";

export function AssetTypePicker({ onSelect }: { onSelect: (typeId: string) => void }) {
  return (
    <ScrollArea className="asset-picker-scroll" offsetScrollbars>
      <Stack gap="lg">
        {assetGroups.map((group) => {
          const groupTypes = assetTypes.filter((type) => type.groupId === group.id);

          return (
            <section className="asset-type-section" key={group.id}>
              <Text className="asset-type-section-title">{group.name}</Text>
              <SimpleGrid cols={{ base: 4, xs: 5, sm: 8 }} spacing="sm" verticalSpacing="md">
                {groupTypes.map((type) => (
                  <UnstyledButton className="asset-type-option" key={type.id} onClick={() => onSelect(type.id)}>
                    <TypeIcon type={type} size="lg" />
                    <Text className="asset-type-name">{type.name}</Text>
                  </UnstyledButton>
                ))}
              </SimpleGrid>
            </section>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
