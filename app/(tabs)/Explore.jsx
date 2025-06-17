import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { Header } from '../../components/Header';

const Explore = () => {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const router = useRouter();


    useEffect(() => {
        const currentUid = auth.currentUser?.uid;
        const unsubscribe = onSnapshot(collection(db, 'users'), (usersSnapshot) => {
            let currentUserDoc = null;
            const usersList = [];
            usersSnapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (data.uid === currentUid) {
                    currentUserDoc = data;
                } else {
                    usersList.push(data);
                }
            });
            setCurrentUser(currentUserDoc);
            setUsers(usersList);
            setFilteredUsers(usersList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(
                users.filter(u =>
                    u.username?.toLowerCase().includes(search.trim().toLowerCase())
                )
            );
        }
    }, [search, users]);

    const handleUserPress = (user) => {
        if (currentUser?.friends?.includes(user.uid)) {
            router.push({ pathname: "/FriendProfile", params: { uid: user.uid } });
        } else {
            router.push({ pathname: "/NotFriendProfile", params: { uid: user.uid } });
        }
    };

    if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} />;
    const isDarkMode = false;
    return (
        <>
            <Header />
            <View style={styles.container}>
                <Image
                    source={require('../../assets/images/Lightmodechat.jpg')}
                    style={styles.backgroundImage}
                />

                <View style={styles.Container}>
                    <Text style={styles.title}>Explore People </Text>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search by username..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#aaa"
                    />
                    <FlatList
                        data={filteredUsers}
                        keyExtractor={item => item.uid}
                        renderItem={({ item }) => (
                            <Pressable style={styles.userRow} onPress={() => handleUserPress(item)}>
                                <Image source={{ uri: item.profileImage }} style={styles.avatar} />
                                <Text style={styles.username}>{item.username}</Text>
                            </Pressable>
                        )}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
                                No users found.
                            </Text>
                        }
                    />
                </View>

            </View>
        </>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
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
    Container: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: 'indigo',
        fontFamily: 'InriaSans-Bold',
        textAlign: 'center',
    },
    searchBar: {
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'indigo',
        color: 'black',
        fontFamily: 'InriaSans-Regular',
        backgroundColor: '#1C1B33'
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingTop: 20,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16,
    },
    username: {
        fontSize: 18,
        color: 'indigo',
        fontFamily: 'InriaSans-Bold',
    },
});

export default Explore;