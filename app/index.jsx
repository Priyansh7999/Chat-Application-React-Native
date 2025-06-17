import { View, Pressable, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

export default function index() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [fontsLoaded] = useFonts({
    'InriaSans-Regular': require('@/assets/fonts/InriaSans-Regular.ttf'),
    'InriaSans-Bold': require('@/assets/fonts/InriaSans-Bold.ttf'),
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      // If authenticated, immediately replace to main app and prevent back navigation
      router.replace('/(tabs)/Chats');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // If fonts are not loaded or splash is showing, show splash/loading
  if (!fontsLoaded || showSplash) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="indigo" />
      </View>
    );
  }

  // If authenticated, render nothing (prevents going back to this screen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.greeting}>
      <Text style={styles.title}>Welcome To Chats</Text>
      <Image
        source={require('../assets/images/Greeting.jpg')}
        resizeMode='cover'
        style={styles.greetingImage}
      />
      <Pressable
        onPress={() => router.push('/signUp')}
        style={styles.greetingButton}
      >
        <Text style={styles.greetingText}>Get Started </Text>
        <Ionicons name="chevron-forward" size={24} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // This allows the background image to show through
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  greetingImage: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginBottom: 32,
  },
  greetingButton: {
    backgroundColor: 'indigo',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  greetingText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'InriaSans-Bold',
    letterSpacing: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'InriaSans-Regular',
  },
});