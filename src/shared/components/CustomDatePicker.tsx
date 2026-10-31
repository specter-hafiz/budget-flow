import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTheme } from "@shopify/restyle";
import { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import type { AppTheme } from "@/core/theme/restyle";
import { useAppTheme } from "@/core/theme/ThemeProvider";
import CustomText from "@/shared/components/CustomText";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../hooks/useCurrency";

interface CustomDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  maximumDate?: Date;
}

export default function CustomDatePicker({
  value,
  onChange,
  label,
  maximumDate = new Date(),
}: CustomDatePickerProps) {
  const theme = useTheme<AppTheme>();
  const { formatDate } = useCurrency();
  const { t, i18n } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [iosDate, setIosDate] = useState(value);

  const formattedDate = formatDate(value);
  const dateLabel = label ?? t("transactions.date");
  const { preference } = useAppTheme();
  const systemColorScheme = useColorScheme();

  const isDark =
    preference === "dark" ||
    (preference === "system" && systemColorScheme === "dark");
  const locales: Record<string, string> = {
    en: "en_GB",
    fr: "fr_FR",
    es: "es_ES",
    pt: "pt_PT",
  };

  const pickerLocale = locales[i18n.language] ?? "en_GB";

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setVisible(false);
      return;
    }

    if (selectedDate) {
      if (Platform.OS === "ios") {
        setIosDate(selectedDate);
      } else {
        onChange(selectedDate);
        setVisible(false);
      }
    }
  };

  const openPicker = () => {
    setIosDate(value);
    setVisible(true);
  };

  return (
    <View style={styles.container}>
      <CustomText variant="caption">{dateLabel}</CustomText>

      <TouchableOpacity
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`${dateLabel}: ${formattedDate}`}
        style={[
          styles.dateButton,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <CustomText variant="body">{formattedDate}</CustomText>
        <CustomText variant="body" style={{ color: theme.colors.primary }}>
          {t("datePicker.change")}
        </CustomText>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          onRequestClose={() => setVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <CustomText variant="body">
                    {t("datePicker.cancel")}
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    onChange(iosDate);
                    setVisible(false);
                  }}
                >
                  <CustomText
                    variant="body"
                    style={{ color: theme.colors.primary }}
                  >
                    {t("datePicker.done")}
                  </CustomText>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={iosDate}
                mode="date"
                display="spinner"
                locale={pickerLocale.replace("_", "-")}
                maximumDate={maximumDate}
                onChange={handleChange}
                themeVariant={isDark ? "dark" : "light"}
                textColor={isDark ? "#FFFFFF" : "#000000"}
                style={{
                  height: 216,
                  width: "100%",
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && visible && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 20,
  },
  dateButton: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    paddingTop: 16,
    paddingBottom: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
});
