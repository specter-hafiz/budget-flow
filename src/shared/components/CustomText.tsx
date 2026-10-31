import { createText } from "@shopify/restyle";
import { AppTheme } from "../../core/theme/restyle";

const Text = createText<AppTheme>();
export type CustomTextProps = React.ComponentProps<typeof Text>;

const CustomText = (props: CustomTextProps) => {
  return <Text {...props} />;
};

export default CustomText;
