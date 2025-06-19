import { Slot, Stack } from "expo-router";
import { AuthContextProvider } from "../context/authContext";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Image, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <ActionSheetProvider>
      <AuthContextProvider>
        <View style={styles.container}>
          {/* <StatusBar backgroundColor='#1C1B33' style='light' /> */}
          <Stack 
            screenOptions={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#1C1B33' }
            }} 
          />
        </View>
      </AuthContextProvider>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1C1B33',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});