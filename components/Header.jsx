import { Ionicons } from '@expo/vector-icons';
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAuth } from '../context/authContext';
import { auth, db } from '../firebaseConfig';

export const Header = () => {
    const [showInvites, setShowInvites] = useState(false);
    const [user, setUser] = useState(null);
    const [invites, setInvites] = useState([]);
    const [inviteUsers, setInviteUsers] = useState([]);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) return;
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setUser({ ...data, uid });
                setInvites(data.invitesReceived || []);
            }
        });
        return () => unsub();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!invites.length) {
            setInviteUsers([]);
            return;
        }
        let unsubList = [];
        let isMounted = true;
        Promise.all(
            invites.map(inviteUid =>
                new Promise(resolve => {
                    const unsub = onSnapshot(doc(db, 'users', inviteUid), snap => {
                        if (snap.exists()) {
                            resolve({ id: inviteUid, ...snap.data() });
                        } else {
                            resolve(null);
                        }
                    });
                    unsubList.push(unsub);
                })
            )
        ).then(users => {
            if (isMounted) setInviteUsers(users.filter(Boolean));
        });
        return () => {
            isMounted = false;
            unsubList.forEach(unsub => unsub && unsub());
        };
    }, [invites]);
    // Accept invite: add each other as friends, remove invites
    const handleAccept = async (inviteUid) => {
        if (!user?.uid) return;
        const currentUid = user.uid;
        await updateDoc(doc(db, 'users', currentUid), {
            friends: arrayUnion(inviteUid),
            invitesReceived: arrayRemove(inviteUid),
        });
        await updateDoc(doc(db, 'users', inviteUid), {
            friends: arrayUnion(currentUid),
            invitesSend: arrayRemove(currentUid),
        });
    };

    // Decline invite: just remove from invitesReceived
    const handleDecline = async (inviteUid) => {
        if (!user?.uid) return;
        const currentUid = user.uid;
        await updateDoc(doc(db, 'users', currentUid), {
            invitesReceived: arrayRemove(inviteUid),
        });
        await updateDoc(doc(db, 'users', inviteUid), {
            invitesSend: arrayRemove(currentUid),
        });
    };

    // Show/hide invites panel
    const handleShowInvites = () => setShowInvites((prev) => !prev);

    // Fetch invite user details for display
    useEffect(() => {
        if (!invites.length) {
            setInviteUsers([]);
            return;
        }
        let unsubList = [];
        let isMounted = true;
        Promise.all(
            invites.map(inviteUid =>
                new Promise(resolve => {
                    const unsub = onSnapshot(doc(db, 'users', inviteUid), snap => {
                        if (snap.exists()) {
                            resolve({ id: inviteUid, ...snap.data() });
                        } else {
                            resolve(null);
                        }
                    });
                    unsubList.push(unsub);
                })
            )
        ).then(users => {
            if (isMounted) setInviteUsers(users.filter(Boolean));
        });
        return () => {
            isMounted = false;
            unsubList.forEach(unsub => unsub && unsub());
        };
    }, [invites]);

    return (
        <SafeAreaView style={styles.headerContainer}>
            
            <View style={styles.leftSection}>
                <Image
                    source={user?.profileImage ? { uri: user.profileImage } : require('../assets/images/avatar.png')}
                    style={styles.avatar}
                />
            </View>

            <View style={styles.centerSection}>
                <Text style={styles.headerText}>Chats</Text>
            </View>

            <View style={styles.rightSection}>
                <Ionicons name="camera-outline" size={27} color="white" style={styles.icon} />
                <Pressable onPress={handleShowInvites} accessible accessibilityLabel="Show invitations">
                    {inviteUsers.length > 0 ? (
                        <Ionicons name="notifications" size={24} color="indigo" style={styles.icon} />
                    ) : (
                        <Ionicons name="notifications-outline" size={24} color="white" style={styles.icon} />
                    )}
                </Pressable>
            </View>

            {showInvites && (
                <View style={styles.notification}>
                    <Text style={styles.notificationTitle}>Invitations</Text>
                    {inviteUsers.length === 0 ? (
                        <Text style={{ color: '#fff', textAlign: 'center', marginVertical: 10 }}>No invitations</Text>
                    ) : (
                        inviteUsers.map((invite) => (
                            <View key={invite.id} style={styles.inviteList}>
                                <Image
                                    source={invite.profileImage ? { uri: invite.profileImage } : require('../assets/images/avatar.png')}
                                    style={styles.inviteAvatar}
                                />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.inviteName}>{invite.name || invite.username}</Text>
                                    <Text style={styles.inviteUsername}>{invite.username}</Text>
                                </View>
                                <View style={styles.buttons}>
                                    <Pressable style={styles.acceptBtn} onPress={() => handleAccept(invite.id)}>
                                        <Text style={styles.acceptBtnText}>Accept</Text>
                                    </Pressable>
                                    <Pressable style={styles.declineBtn} onPress={() => handleDecline(invite.id)}>
                                        <Text style={styles.declineBtnText}>Decline</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        padding: wp('4%'),
        paddingTop: hp('7%'),
        backgroundColor: '#1C1B33',
        borderRadius: 33,
    },
    leftSection: {
        flex: 0.3,
        alignItems: 'flex-start',
    },
    centerSection: {
        flex: 1,
        marginLeft: wp('4%'),
        flexDirection: 'row',
    },
    rightSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
    },
    headerText: {
        fontSize: 26,
        color: '#fff',
        fontFamily: 'InriaSans-Bold',
    },
    icon: {
        marginLeft: 10,
    },
    notification: {
        position: 'absolute',
        top: hp('10%'),
        right: wp('4%'),
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        padding: 10,
        width: wp('80%'),
        zIndex: 999,
    },
    notificationTitle: {
        color: '#F9E5BC',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    inviteList: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    inviteAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    inviteName: {
        color: '#fff',
        fontWeight: 'bold',
    },
    inviteUsername: {
        color: '#aaa',
    },
    buttons: {
        flexDirection: 'row',
        gap: 5,
    },
    acceptBtn: {
        backgroundColor: '#4CAF50',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    declineBtn: {
        backgroundColor: '#F44336',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    acceptBtnText: {
        color: '#fff',
    },
    declineBtnText: {
        color: '#fff',
    },
});