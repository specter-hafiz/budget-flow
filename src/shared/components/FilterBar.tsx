import { useTheme } from "@shopify/restyle";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import type { AppTheme } from "@/core/theme/restyle";
import CustomText from "@/shared/components/CustomText";

export interface FilterOption<T extends string = string> {
  label: string;
  value: T;
}

interface FilterBarProps<T extends string = string> {
  options: readonly FilterOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  scrollable?: boolean;
}

export default function FilterBar<T extends string = string>({
  options,
  selectedValue,
  onSelect,
  scrollable = false,
}: FilterBarProps<T>) {
  const theme = useTheme<AppTheme>();

  const content = (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
          >
            <CustomText
              variant="body"
              style={{
                color: isSelected ? "#FFFFFF" : theme.colors.text,
              }}
            >
              {option.label}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  scrollContent: {
    paddingRight: 4,
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
});
