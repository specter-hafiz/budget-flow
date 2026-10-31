import type { ReactNode } from "react";

import CustomCard from "@/shared/components/CustomCard";
import CustomText from "@/shared/components/CustomText";

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
}

export default function SettingsSection({
  title,
  children,
}: SettingsSectionProps) {
  return (
    <>
      {title ? (
        <CustomText variant="title" color="text" marginBottom="sm">
          {title}
        </CustomText>
      ) : null}

      <CustomCard
        borderRadius="lg"
        gap="md"
        padding="md"
        marginBottom="md"
        borderWidth={1}
        borderColor="border"
      >
        {children}
      </CustomCard>
    </>
  );
}
