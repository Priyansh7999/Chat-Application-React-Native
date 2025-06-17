import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, useColorScheme, View } from 'react-native';
import { Header } from '../../components/Header';
import { StatusBar } from 'expo-status-bar';

const Layout = () => {
    const isDarkMode = false;
    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <StatusBar backgroundColor='#1C1B33' style='light' />
            <Image
                source={isDarkMode
                    ? require('../../assets/images/TabBar.png')
                    : require('../../assets/images/Lightmodechat.jpg')
                }
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        borderRadius: 70,
                        margin: 20,
                        paddingTop: 5,
                        paddingBottom: 5,
                        backgroundColor: '#1C1B33'
                    },
                    tabBarActiveTintColor: "white",
                    tabBarInactiveTintColor: "#00DF82",
                }}
            >
                <Tabs.Screen
                    name="Chats"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? 'chatbox' : 'chatbox-outline'} color={color} size={24} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="Explore"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? 'newspaper' : 'newspaper-outline'} color={color} size={24} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="Profile"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={24} />
                        )
                    }}
                />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
})

export default Layout;
