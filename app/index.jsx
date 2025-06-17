import { View, Pressable, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { useRouter, useSegments } from 'expo-router';

export default function index() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAuth();
  const [fontsLoaded] = useFonts({
    'InriaSans-Regular': require('@/assets/fonts/InriaSans-Regular.ttf'),
    'InriaSans-Bold': require('@/assets/fonts/InriaSans-Bold.ttf'),
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Only handle navigation after fonts are loaded
    if (!fontsLoaded) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        // Navigate to tabs and ensure we're on the Chats tab
        router.replace('/(tabs)/Chats');
      } else {
        setShowSplash(false);
      }
    }, 100); // Small delay to ensure state is settled

    return () => clearTimeout(timer);
  }, [isAuthenticated, fontsLoaded]);

  // Show loading while fonts are loading or during authentication check
  if (!fontsLoaded || (isAuthenticated && showSplash)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="indigo" />
      </View>
    );
  }

  // If user is authenticated, don't show this screen
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
    backgroundColor: '#1C1B33',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1B33',
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