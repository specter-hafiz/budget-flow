import { createTheme } from "@shopify/restyle";
import { colors } from "./colors";
import { fontSizes, typography } from "./typography";

const shared = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadii: {
    sm: 6,
    md: 12,
    lg: 20,
    pill: 999,
  },
  textVariants: {
    defaults: {
      fontFamily: typography.regular,
      fontSize: fontSizes.md,
      color: "text",
    },
    heading: {
      fontFamily: typography.bold,
      fontSize: fontSizes.xl,
      color: "text",
    },
    title: {
      fontFamily: typography.semiBold,
      fontSize: fontSizes.lg,
      color: "text",
    },
    body: {
      fontFamily: typography.regular,
      fontSize: fontSizes.md,
      color: "text",
    },
    subheading: {
      fontFamily: typography.semiBold,
      fontSize: fontSizes.lg,
      color: "text",
    },
    caption: {
      fontFamily: typography.regular,
      fontSize: fontSizes.sm,
      color: "textSecondary",
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  colors: colors.light,
});

export const darkTheme: AppTheme = {
  ...lightTheme,
  colors: colors.dark,
};

export type AppTheme = typeof lightTheme;
