import { Entypo, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import ChatHeader from '../../components/ChatHeader';
import { auth, db } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';
import { getDocs, where } from 'firebase/firestore';
import { useActionSheet } from '@expo/react-native-action-sheet';
const ChatScreen = () => {
    const { chatId, friendId } = useLocalSearchParams();
    const { sendMessage, startChat } = useAuth();
    const [friend, setFriend] = useState(null);
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageQuery, setMessageQuery] = useState('');
    const [currentChatId, setCurrentChatId] = useState(chatId || null);
    const scrollViewRef = useRef();
    const [loadingMessages, setLoadingMessages] = useState(true);
    const { showActionSheetWithOptions } = useActionSheet();


    // USERS AND FRIEND DATA FETCHING 
    useEffect(() => {
        if (!friendId || !auth.currentUser?.uid) return;
        const unsubFriend = onSnapshot(doc(db, 'users', friendId), snap => {
            if (snap.exists()) setFriend({ ...snap.data(), uid: friendId });
        });
        const unsubUser = onSnapshot(doc(db, 'users', auth.currentUser.uid), snap => {
            if (snap.exists()) setUser({ ...snap.data(), uid: auth.currentUser.uid });
        });
        return () => {
            unsubFriend();
            unsubUser();
        };
    }, [friendId]);


    // FINDING EXISTING CHAT ID
    useEffect(() => {
        const findExistingChat = async () => {
            if (currentChatId || !user?.uid || !friend?.uid) return;
            const chatRef = collection(db, 'chats');
            const q = query(chatRef, where("participants", "array-contains", user.uid));
            const existingChats = await getDocs(q);
            let foundChatId = null;
            existingChats.forEach(docSnap => {
                const participants = docSnap.data().participants;
                if (
                    participants.length === 2 &&
                    participants.includes(user.uid) &&
                    participants.includes(friend.uid)
                ) {
                    foundChatId = docSnap.id;
                }
            });
            if (foundChatId) setCurrentChatId(foundChatId);
        };
        findExistingChat();
    }, [user?.uid, friend?.uid]);


    // MESSAGES FETCHING
    useEffect(() => {
        if (!currentChatId) return;
        setLoadingMessages(true);
        const messagesRef = collection(db, 'chats', currentChatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        const unsub = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoadingMessages(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        });
        return () => unsub();
    }, [currentChatId]);

    const handleSendMessage = async () => {
        if (!messageQuery.trim()) return;
        if (!user?.uid || !friend?.uid) {
            Alert.alert("Error", "User information not loaded yet.");
            return;
        }
        try {
            let chatIdToUse = currentChatId;
            if (!chatIdToUse) {
                const res = await startChat(user.uid, friend.uid);
                if (res.success) {
                    chatIdToUse = res.chatId;
                    setCurrentChatId(res.chatId);
                } else {
                    Alert.alert("Error", "Failed to start chat: " + res.message);
                    return;
                }
            }
            await sendMessage(chatIdToUse, user.uid, messageQuery);
            setMessageQuery('');
        } catch (err) {
            Alert.alert("Error", "Failed to send message: " + err.message);
        }
    };

    const handleAttachment = () => {
        showActionSheetWithOptions(
            {
                options: ['Camera', 'Gallery', 'File', 'Cancel',],
                cancelButtonIndex: 3,
                destructiveButtonIndex: 3,
                title: 'Select Attachment',
            }
        )
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ChatHeader friend={friend || {}} />
            <SafeAreaView style={styles.container}>
                <ImageBackground
                    source={require('@/assets/images/ChatBg.png')}
                    style={styles.bgimage}
                    resizeMode="cover"
                />
                <ScrollView
                    style={styles.chatContainer}
                    ref={scrollViewRef}
                >
                    {loadingMessages ? (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: '#888', fontSize: 16, fontFamily: 'InriaSans-Regular' }}>
                                Loading...
                            </Text>
                        </View>
                    ) : messages.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: '#888', fontSize: 16, fontFamily: 'InriaSans-Regular' }}>
                                Say hi!
                            </Text>
                        </View>
                    ) : (
                        messages.map(msg => (
                            <View
                                key={msg.id}
                                style={[
                                    styles.messageBubble,
                                    msg.senderId === user?.uid ? styles.meBubble : styles.someoneBubble
                                ]}
                            >
                                <Text style={styles.messageText}>{msg.text}</Text>
                            </View>
                        ))
                    )}
                </ScrollView>
                <SafeAreaView style={styles.footer}>
                    <Pressable
                        style={styles.sendIcon}
                        onPress={handleAttachment}
                    >
                        <Entypo name="attachment" size={28} color="indigo" />
                    </Pressable>
                    <TextInput
                        style={styles.input}
                        value={messageQuery}
                        onChangeText={setMessageQuery}
                        placeholder="Type a message"
                        placeholderTextColor="#aaa"
                    />
                    <Pressable
                        style={styles.sendIcon}
                        onPress={handleSendMessage}
                        disabled={!user?.uid || !friend?.uid}
                    >
                        <Ionicons name="send" size={28} color={!user?.uid || !friend?.uid ? "#ccc" : "indigo"} />
                    </Pressable>
                </SafeAreaView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        width: '100%',
    },
    bgimage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.7,
    },
    chatContainer: {
        flex: 1,
        padding: 12,
        paddingBottom: 8,
    },
    messageBubble: {
        maxWidth: '75%',
        borderRadius: 12,
        margin: 6,
        padding: 12,
    },
    meBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#51B7F9',
        borderTopRightRadius: 2,
    },
    someoneBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#e0e0e0',
        borderTopLeftRadius: 2,
    },
    messageText: {
        color: '#232526',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        width: '100%',
        backgroundColor: 'transparent',
    },
    input: {
        flex: 1,
        backgroundColor: '#f8f8ff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        color: '#232526',
        fontFamily: 'InriaSans-Regular',
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: 'indigo',
    },
    sendIcon: {
        marginLeft: 8,
        padding: 8,
        borderRadius: 20,
    },
});

export default ChatScreen;









