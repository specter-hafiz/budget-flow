import { createBox } from "@shopify/restyle";
import { AppTheme } from "../../core/theme/restyle";

const Card = createBox<AppTheme>();
export type CustomCardProps = React.ComponentProps<typeof Card>;

const CustomCard = (props: CustomCardProps) => {
  return (
    <Card backgroundColor="surface" padding="lg" {...props} borderRadius="lg" />
  );
};

export default CustomCard;
