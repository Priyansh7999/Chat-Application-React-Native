import React from 'react';
import { Image, StyleSheet, useColorScheme, View } from 'react-native';

const Background = ({children}) => {
    // This component can be used to set a background image or color
    // Currently, it is empty but can be extended in the future
    // For example, you can add an ImageBackground or a View with a background color
    const theme = useColorScheme();
    const backgroundImage = theme === 'dark' ? require('../assets/images/Darkmode.jpg') : require('../assets/images/Lightmode.jpg');
    return (
        <View>
            <Image
                source={backgroundImage}
                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,  }}
                resizeMode="cover"
            />
            <View>
                {children}
            </View>            
        </View>
    );
}

const styles = StyleSheet.create({})

export default Background;
