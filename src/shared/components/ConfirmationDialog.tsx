import { useTheme } from "@shopify/restyle";
import { Modal, StyleSheet, View } from "react-native";

import type { AppTheme } from "@/core/theme/restyle";
import CustomButton from "@/shared/components/CustomButton";
import CustomText from "@/shared/components/CustomText";

type ConfirmationDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const theme = useTheme<AppTheme>();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <CustomText variant="heading">{title}</CustomText>

          <CustomText
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            {message}
          </CustomText>

          <View style={styles.actions}>
            <CustomButton
              label={cancelLabel}
              variant="secondary"
              onPress={onCancel}
            />

            <CustomButton label={confirmLabel} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderWidth: 1,
    borderRadius: 20,
    gap: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
