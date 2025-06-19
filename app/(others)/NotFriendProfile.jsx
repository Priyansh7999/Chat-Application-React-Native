import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { doc, onSnapshot, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const NotFriendProfile = () => {
    const router = useRouter();
    const { uid } = useLocalSearchParams();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteStatus, setInviteStatus] = useState('');

    useEffect(() => {
        if (!uid || !auth.currentUser?.uid) return;
        setLoading(true);

        const currentUid = auth.currentUser.uid;
        const unsubCurrent = onSnapshot(doc(db, 'users', currentUid), (currentSnap) => {
            if (currentSnap.exists()) {
                setCurrentUser(currentSnap.data());
            }
        });
        const unsubUser = onSnapshot(doc(db, 'users', uid), (userSnap) => {
            if (userSnap.exists()) {
                setUser(userSnap.data());
            }
            setLoading(false);
        });

        return () => {
            unsubCurrent();
            unsubUser();
        };
    }, [uid]);

    useEffect(() => {
        if (!currentUser || !user) return;
        if (currentUser.friends?.includes(uid)) {
            setInviteStatus('friends');
        } else if (currentUser.invitesSend?.includes(uid)) {
            setInviteStatus('uninvite');
        } else if (currentUser.invitesReceived?.includes(uid)) {
            setInviteStatus('accept');
        } else {
            setInviteStatus('invite');
        }
    }, [currentUser, user, uid]);
    const handleInvite = async () => {
        if (!currentUser || !user) return;
        const currentUid = currentUser.uid;
        const otherUid = user.uid;
        try {
            if (inviteStatus === 'invite') {
                // Send invite
                await updateDoc(doc(db, 'users', currentUid), {
                    invitesSend: arrayUnion(otherUid)
                });
                await updateDoc(doc(db, 'users', otherUid), {
                    invitesReceived: arrayUnion(currentUid)
                });
                setInviteStatus('uninvite');
            } else if (inviteStatus === 'uninvite') {
                // Cancel invite
                await updateDoc(doc(db, 'users', currentUid), {
                    invitesSend: arrayRemove(otherUid)
                });
                await updateDoc(doc(db, 'users', otherUid), {
                    invitesReceived: arrayRemove(currentUid)
                });
                setInviteStatus('invite');
            } else if (inviteStatus === 'accept') {
                await updateDoc(doc(db, 'users', currentUid), {
                    friends: arrayUnion(otherUid),
                    invitesReceived: arrayRemove(otherUid)
                });
                await updateDoc(doc(db, 'users', otherUid), {
                    friends: arrayUnion(currentUid),
                    invitesSend: arrayRemove(currentUid)
                });
                setInviteStatus('friends');
                Alert.alert('Success', 'You are now friends!');
                router.replace({ pathname: '/FriendProfile', params: { uid: otherUid } });

            }
        } catch (err) {
            Alert.alert('Error', 'Failed to update invite status.');
        }
    };
    const handleBlock = async () => {
        if (!currentUser || !user) return;
        const currentUid = currentUser.uid;
        const otherUid = user.uid;
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
                            await updateDoc(doc(db, 'users', currentUid), {
                                blockedUsers: arrayUnion(otherUid)
                            });
                            Alert.alert('Blocked', 'User has been blocked.');
                        } catch (err) {
                            Alert.alert('Error', 'Failed to block user.');
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} />;

    if (!user) return <Text style={{ textAlign: 'center', marginTop: 40 }}>User not found.</Text>;
    const isDarkMode = false;
    return (
        <View style={styles.container}>
            <Image
                source={isDarkMode
                    ? require('../../assets/images/Darkmode1.jpg')
                    : require('../../assets/images/Lightmodechat.jpg')
                }
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                    styles.backButton,
                    { opacity: pressed ? 0.3 : 1 }
                ]}
            >
                <Ionicons name="chevron-back" size={24} color="black" />
            </Pressable>
            <View style={styles.headerSection}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: user.profileImage }}
                        style={styles.profileImage}
                    />
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        {user.username || 'Username'}
                    </Text>
                    {user.bio && (
                        <Text style={styles.userBio}>
                            {user.bio}
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="person" size={20} color="#00DF82" />
                        <Text style={styles.cardTitle}>Personal Information</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>
                            {user.name || 'Not provided'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Location</Text>
                        <Text style={styles.infoValue}>
                            {user.location?.city && user.location?.state
                                ? `${user.location.city}, ${user.location.state}`
                                : 'Not provided'
                            }
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Last Seen</Text>
                        <Text style={styles.infoValue}>
                            {user.lastSeen
                                ? new Date(user.lastSeen).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })
                                : 'Unknown'
                            }
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Member Since</Text>
                        <Text style={styles.infoValue}>
                            {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })
                                : 'Unknown'
                            }
                        </Text>
                    </View>
                </View>
                {inviteStatus === 'friends' && (
                    <Text style={{ color: 'green', marginTop: 10, fontWeight: 'bold' }}>You are friends</Text>
                )}

                <View style={styles.actionContainer}>
                    <View style={styles.secondaryButtonsRow}>
                        {inviteStatus !== 'friends' && (
                            <Pressable style={styles.inviteBtn} onPress={handleInvite}>
                                <Text style={styles.inviteBtnText}>
                                    {inviteStatus === 'invite' && 'Invite'}
                                    {inviteStatus === 'uninvite' && 'Uninvite'}
                                    {inviteStatus === 'accept' && 'Accept'}
                                </Text>
                            </Pressable>
                        )}
                        <Pressable style={styles.blockButton} onPress={handleBlock}>
                            <MaterialIcons name="block" size={18} color="#fff" />
                            <Text style={styles.blockButtonText}>Block</Text>
                        </Pressable>
                    </View>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'InriaSans-Regular',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerSection: {
        backgroundColor: '#1C1B33',
        paddingTop: 80,
        paddingBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#00DF82',
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        fontFamily: 'InriaSans-Bold',
    },
    userEmail: {
        fontSize: 16,
        color: '#00DF82',
        marginBottom: 8,
        fontFamily: 'InriaSans-Regular',
    },
    userBio: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontFamily: 'InriaSans-Regular',
        lineHeight: 20,
    },

    infoContainer: {
        paddingHorizontal: 20,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
        fontFamily: 'InriaSans-Bold',
    },
    infoItem: {
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontFamily: 'InriaSans-Regular',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'InriaSans-Regular',
        fontWeight: '500',
    },

    actionContainer: {
        marginTop: 10,
    },
    secondaryButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    inviteBtn: {
        backgroundColor: '#263238',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        flex: 1,
    },
    inviteBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'InriaSans-Bold',
        textAlign: 'center',
    },
    blockButton: {
        backgroundColor: '#ff4757',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        flex: 1,
    },
    blockButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
        fontFamily: 'InriaSans-Bold',
    },
});


export default NotFriendProfile;