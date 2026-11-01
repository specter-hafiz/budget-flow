import { Image, StyleSheet, View } from "react-native";

export default function BudgetFlowSplash() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/splash-image.png")}
        style={styles.background}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#208AEF",
  },
  background: {
    width: "100%",
    height: "100%",
  },
});
