import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View } from 'react-native';

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
            <Stack screenOptions={{ headerShown: false }} >

                <Stack.Screen name="FriendProfile" options={{
                    presentation: 'modal'
                }} />
                <Stack.Screen name="NotFriendProfile" options={{
                    presentation: 'modal'
                }} />
                <Stack.Screen name="chatScreen" options={{ presentation: 'modal' }} />
            </Stack>
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
