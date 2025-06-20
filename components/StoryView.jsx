import React from 'react';
import { Image, StyleSheet, View, Text, Pressable } from 'react-native';

export const StoryView = ({ story, onClose }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: story.profileImage }} style={styles.avatar} />
                <View>
                    <Text style={styles.username}>{story.username}</Text>
                    <Text style={styles.createdAt}>
                        {story.createdAt && story.createdAt.seconds
                            ? new Date(story.createdAt.seconds * 1000).toLocaleString()
                            : ''}
                    </Text>
                </View>
                <Pressable onPress={onClose}>
                    <Text style={styles.close}>Close</Text>
                </Pressable>
            </View>
            <View style={styles.imageContainer}>
                <Image source={{ uri: story.image }} style={styles.image} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-evenly', gap: 22 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
    username: { color: 'white', fontWeight: 'bold', marginRight: 8 },
    createdAt: { color: 'gray', flex: 1 },
    close: { color: 'red', marginLeft: 8 },
    imageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: 300, height: 400, borderRadius: 10 },
});