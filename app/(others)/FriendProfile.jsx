import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';

const FriendProfile = () => {
    const { uid } = useLocalSearchParams();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!uid || !auth.currentUser?.uid) return;
        setLoading(true);

        const currentUid = auth.currentUser.uid;
        const unsubCurrent = onSnapshot(doc(db, 'users', currentUid), (currentSnap) => {
            if (currentSnap.exists()) setCurrentUser(currentSnap.data());
        });
        const unsubUser = onSnapshot(doc(db, 'users', uid), (userSnap) => {
            if (userSnap.exists()) setUser(userSnap.data());
            setLoading(false);
        });

        return () => {
            unsubCurrent();
            unsubUser();
        };
    }, [uid]);

    const handleRemoveFriend = async () => {
        Alert.alert(
            "Remove Friend",
            "Are you sure you want to remove this friend?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const currentUid = auth.currentUser.uid;
                            await updateDoc(doc(db, 'users', currentUid), {
                                friends: arrayRemove(uid)
                            });
                            await updateDoc(doc(db, 'users', uid), {
                                friends: arrayRemove(currentUid)
                            });
                            Alert.alert('Removed', 'Friend removed successfully.');
                            router.back();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to remove friend.');
                        }
                    }
                }
            ]
        );
    };

    const handleBlock = async () => {
        Alert.alert(
            "Block User",
            "Are you sure you want to block this user?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Block",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const currentUid = auth.currentUser.uid;
                            await updateDoc(doc(db, 'users', currentUid), {
                                blockedUsers: arrayUnion(uid),
                                friends: arrayRemove(uid)
                            });
                            await updateDoc(doc(db, 'users', uid), {
                                friends: arrayRemove(currentUid)
                            });
                            Alert.alert('Blocked', 'User has been blocked.');
                            router.back();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to block user.');
                        }
                    }
                }
            ]
        );
    };
    
    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    if (!user) return <Text style={{ textAlign: 'center', marginTop: 40 }}>User not found.</Text>;
    const isDarkMode = false;
    return (
        <ScrollView style={{ flex: 1, height: '100%' }}>
            <Image
                source={isDarkMode
                    ? require('../../assets/images/Darkmode1.jpg')
                    : require('../../assets/images/Lightmodechat.jpg')
                }
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <View style={{ flex: 1 , position: 'relative', zIndex: 1, height: '100%'}}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                        styles.backButton,
                        { opacity: pressed ? 0.3 : 1 }
                    ]}
                >
                    <Ionicons name="chevron-back" size={24} color="black" />
                </Pressable>
                <View style={styles.container}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: user.profileImage }} style={styles.image} />
                    </View>
                    <Text style={styles.username}>{user.username}</Text>
                    <Text style={styles.bio}>{user.bio}</Text>
                    <View style={styles.infoSectionWrapper}>
                        <Image
                            source={require('../../assets/images/Weekly.png')}
                            style={styles.infoBackgroundImage}
                        />
                        <View style={styles.infoSection}>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Name:</Text>
                                <Text style={styles.value}>{user.name}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Email:</Text>
                                <Text style={styles.value}>{user.email}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>City:</Text>
                                <Text style={styles.value}>{user.location?.city}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>State:</Text>
                                <Text style={styles.value}>{user.location?.state}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Last Seen:</Text>
                                <Text style={styles.value}>{user.lastSeen ? user.lastSeen.split('T')[0] : ''}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Joined:</Text>
                                <Text style={styles.value}>{user.createdAt ? user.createdAt.split('T')[0] : ''}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.ButtonContainer}>
                        <Pressable style={styles.removeButton} onPress={handleRemoveFriend}>
                            <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', fontFamily: 'InriaSans-Bold', }}>Remove Friend</Text>
                        </Pressable>
                        <Pressable style={styles.blockButton} onPress={handleBlock}>
                            <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', fontFamily: 'InriaSans-Bold', }}>Block</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '100%',
        width: '100%',
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
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    imageContainer: {
        marginBottom: 16,
        alignItems: 'center',
        borderRadius: 100,
        padding: 16,
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 12,
        padding: 2,
        elevation: 2,
    },
    username: {
        fontSize: 26,
        color: '#232526',
        marginTop: 8,
        marginBottom: 4,
        letterSpacing: 1,
        fontFamily: 'InriaSans-Bold',
    },
    bio: {
        fontSize: 15,
        color: '#607d8b',
        marginBottom: 18,
        textAlign: 'center',
        paddingHorizontal: 24,
        fontFamily: 'InriaSans-Bold',
    },
    infoSectionWrapper: {
        width: '90%',
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        position: 'relative',
    },

    infoBackgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    infoSection: {
        padding: 18,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontWeight: '600',
        color: 'indigo',
        fontSize: 16,
        fontFamily: 'InriaSans-Bold',
    },
    value: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'InriaSans-Regular',
    },
    ButtonContainer: {
        width: '100%',
        display: 'flex',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    removeButton: {
        backgroundColor: '#263238',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
        elevation: 1,
        width: '45%',
        fontFamily: 'InriaSans-Bold',
    },
    blockButton: {
        backgroundColor: '#FF6347',
        color: '#fff',
        padding: 12,
        width: '45%',
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
        fontFamily: 'InriaSans-Bold',
    },
});

export default FriendProfile;