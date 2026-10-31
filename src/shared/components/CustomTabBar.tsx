import { useTheme } from "@shopify/restyle";
import { useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/tabs";
import {
  ArrowLeftRight,
  ChartColumn,
  House,
  Plus,
  Settings,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { AppTheme } from "@/core/theme/restyle";
import { typography } from "@/core/theme/typography";

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme<AppTheme>();

  const activeColor = theme.colors.primary;
  const inactiveColor = theme.colors.textSecondary;

  const tabs = [
    { name: "home", label: "Home", Icon: House },
    {
      name: "transactions",
      label: "Transactions",
      Icon: ArrowLeftRight,
    },
    {
      name: "analytics",
      label: "Analytics",
      Icon: ChartColumn,
    },
    { name: "settings", label: "Settings", Icon: Settings },
  ];

  const openAddExpense = () => {
    router.push("/add-transaction" as any);
  };

  const renderTab = (tab: (typeof tabs)[number]) => {
    const index = state.routes.findIndex((route) => route.name === tab.name);

    if (index === -1) return null;

    const focused = state.index === index;
    const color = focused ? activeColor : inactiveColor;
    const Icon = tab.Icon;

    return (
      <Pressable
        key={tab.name}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: focused }}
        onPress={() => navigation.navigate(tab.name)}
        style={styles.tab}
      >
        <Icon size={22} color={color} />

        <Text
          style={[
            styles.label,
            {
              color,
              fontFamily: typography.medium,
            },
          ]}
        >
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {tabs.slice(0, 2).map(renderTab)}

      <Pressable
        onPress={openAddExpense}
        accessibilityRole="button"
        accessibilityLabel="Add expense"
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
      >
        <Plus size={28} color={theme.colors.surface} strokeWidth={2.5} />
      </Pressable>

      {tabs.slice(2).map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 44,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    marginTop: -28,
    elevation: 6,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
});
