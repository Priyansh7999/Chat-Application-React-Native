import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useAuth } from '../context/authContext';
import { StoryView } from './StoryView';
const Status = () => {
    const { showActionSheetWithOptions } = useActionSheet();
    const { addupdateStory, removeStory, getStories } = useAuth();
    const [stories, setStories] = useState([]);
    const [myStory, setMyStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchStories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getStories();
            if (response.success) {
                setStories(response.data);
                const currentUserStory = response.data.find(story => story.isCurrentUser);
                setMyStory(currentUserStory || null);
            } else {
                console.error('Failed to fetch stories:', response.message);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stories:', error);
        }
    }, [getStories]);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);
    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true
            });
            const base64 = result.assets[0].base64;
            const imageData = `data:image/jpeg;base64,${base64}`;
            const response = await addupdateStory(imageData);
            ToastAndroid.show(response.message, ToastAndroid.SHORT);
            if (response.success) {
                fetchStories();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const pickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true
            });
            const base64 = result.assets[0].base64;
            const imageData = `data:image/jpeg;base64,${base64}`;
            const response = await addupdateStory(imageData);
            ToastAndroid.show(response.message, ToastAndroid.SHORT);
            if (response.success) {
                fetchStories();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick photo');
        }
    };
    const deleteMyStory = async () => {
        try {
            const response = await removeStory();
            ToastAndroid.show(response.message, ToastAndroid.SHORT);
            if (response.success) {
                fetchStories();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to remove story');
        }
    };
    const showStoryOptions = () => {
        const options = myStory
            ? ['Take Photo', 'Choose from Gallery', 'Delete Story', 'Cancel']
            : ['Take Photo', 'Choose from Gallery', 'Cancel'];

        const cancelIndex = options.length - 1;
        const destructiveIndex = myStory ? 2 : -1;
        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex: cancelIndex,
                destructiveButtonIndex: destructiveIndex,
                title: myStory ? 'Update Your Story' : 'Add Your Story',
            },
            (buttonIndex) => {
                if (buttonIndex === 0) {
                    takePhoto();
                } else if (buttonIndex === 1) {
                    pickFromGallery();
                } else if (buttonIndex === 2 && myStory) {
                    deleteMyStory();
                }
            }
        );
    };

    const [statusVisible, setStatusVisible] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);

    const handleStory = (story) => {
        setSelectedStory(story);
        setStatusVisible(true);
    };

    const closeStory = () => {
        setStatusVisible(false);
        setSelectedStory(null);
    };
    const defaultImage = "https://www.citypng.com/public/uploads/preview/instagram-share-story-stories-circle-button-icon-701751695136551d78liw1wvw.png";
    const otherStories = stories.filter(story => !story.isCurrentUser);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stories</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
            >
                <Pressable style={styles.storyContainer} onPress={showStoryOptions}>
                    <View style={[styles.imageContainer, myStory && styles.hasStory]}>
                        <Image
                            style={styles.image}
                            source={{ uri: myStory?.image || defaultImage }}
                        />
                        {!myStory && (
                            <View style={styles.addIcon}>
                                <Text style={styles.addIconText}>+</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.storyText}>My Story</Text>
                </Pressable>
                {otherStories.map((story) => (
                    <View key={story.id} style={styles.storyContainer}>
                        <Pressable
                            style={[styles.imageContainer, styles.hasStory]}
                            onPress={() => handleStory(story)}
                        >
                            <Image style={styles.image} source={{ uri: story.image }} />
                        </Pressable>
                        <Text style={styles.storyText}>{story.username}</Text>
                    </View>
                ))}
                <Modal
                    visible={statusVisible}
                    transparent={true}
                    onRequestClose={closeStory}
                    animationType="fade"
                >
                    {selectedStory && (
                        <StoryView story={selectedStory} onClose={closeStory} />
                    )}
                </Modal>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    
    title: {
        padding: 15,
        fontSize: 24,
        color: 'indigo',
        fontFamily: 'InriaSans-Bold',
    },
    loadingText: {
        padding: 15,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    scrollView: {
        paddingHorizontal: 5,
    },
    storyContainer: {
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 10,
    },
    imageContainer: {
        position: 'relative',
        width: 75,
        height: 75,
        borderRadius: 37.5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    hasStory: {
        borderColor: '#4338CA',
        borderWidth: 3,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    addIcon: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#4338CA',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    addIconText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    storyText: {
        marginTop: 5,
        fontSize: 12,
        color: '#374151',
        textAlign: 'center',
        maxWidth: 70,
    },
});

export default Status;