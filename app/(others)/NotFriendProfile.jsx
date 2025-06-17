import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { doc, onSnapshot, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.bio}>{user.bio}</Text>
            <View style={styles.infoSection}>
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
            </View>
            <View style={styles.ButtonContainer}>
                {inviteStatus !== 'friends' && (
                    <Pressable style={styles.inviteBtn} onPress={handleInvite}>
                        <Text style={styles.inviteBtnText}>
                            {inviteStatus === 'invite' && 'Invite'}
                            {inviteStatus === 'uninvite' && 'Uninvite'}
                            {inviteStatus === 'accept' && 'Accept'}
                        </Text>
                    </Pressable>
                )}
                <Pressable style={styles.blockBtn} onPress={handleBlock}>
                    <Text style={styles.blockBtnText}>Block</Text>
                </Pressable>
            </View>
            {inviteStatus === 'friends' && (
                <Text style={{ color: 'green', marginTop: 10, fontWeight: 'bold' }}>You are friends</Text>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 32,
        paddingHorizontal: 0,
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
        top: 32,
        left: 16,
        zIndex: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    avatar: {
        width: 140,
        height: 140,
        borderRadius: 70,
        marginTop: 24,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: 'indigo',
        backgroundColor: '#e0e0e0',
    },
    username: {
        fontSize: 26,
        color: '#232526',
        marginTop: 8,
        marginBottom: 4,
        letterSpacing: 1,
        fontFamily: 'InriaSans-Bold',
        textAlign: 'center',
    },
    bio: {
        fontSize: 15,
        color: '#607d8b',
        marginBottom: 18,
        textAlign: 'center',
        paddingHorizontal: 24,
        fontFamily: 'InriaSans-Bold',
    },
    infoSection: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        marginTop: 8,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontWeight: '600',
        color: '#37474f',
        fontSize: 16,
        fontFamily: 'InriaSans-Bold',
    },
    value: {
        color: '#607d8b',
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
    inviteBtn: {
        backgroundColor: '#263238',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
        elevation: 1,
        width: '45%',
        fontFamily: 'InriaSans-Bold',
    },
    inviteBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'InriaSans-Bold',
        textAlign: 'center',
    },
    blockBtn: {
        backgroundColor: '#FF6347',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
        width: '45%',
        fontFamily: 'InriaSans-Bold',
    },
    blockBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'InriaSans-Bold',
        textAlign: 'center',
    },
});
export default NotFriendProfile;