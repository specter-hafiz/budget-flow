const light = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  primary: "#2563EB",
  primaryLight: "#DBEAFE",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
};

export type ThemeColors = Record<keyof typeof light, string>;

export const colors: { light: ThemeColors; dark: ThemeColors } = {
  light,
  dark: {
    background: "#0F172A",
    surface: "#1E293B",
    primary: "#60A5FA",
    primaryLight: "#1E3A5F",
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    border: "#334155",
    success: "#4ADE80",
    danger: "#F87171",
    warning: "#FBBF24",
  },
};
