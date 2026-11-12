import { StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.screen}>
      <Text style={styles.hello}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hello: {
    color: "rebeccapurple",
    fontSize: 24,
  },
});
