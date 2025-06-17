import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TextInput, ScrollView, Pressable, ImageBackground, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';
import { Header } from '../../components/Header';

const Chats = () => {
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [chatPreviews, setChatPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { listenToUserFriends, listenToChatPreviews, markMessagesAsRead } = useAuth();

  useEffect(() => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;

    const unsubscribe = listenToUserFriends(currentUid, (userFriends) => {
      setFriends(userFriends);
    });

    return () => unsubscribe();
  }, [listenToUserFriends]);

  useEffect(() => {
    if (!friends.length) {
      setChatPreviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;

    const unsubscribe = listenToChatPreviews(friends, currentUid, (previews) => {
      setChatPreviews(previews);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [friends, listenToChatPreviews]);

  const filteredChats = chatPreviews.filter(chat =>
    chat.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleChatPress = async (chat) => {
    // Mark messages as read when opening the chat
    if (chat.chatId && chat.isUnread) {
      const currentUid = auth.currentUser?.uid;
      if (currentUid) {
        await markMessagesAsRead(chat.chatId, currentUid);
      }
    }

    // Navigate to chat screen
    router.push({
      pathname: '/(others)/chatScreen',
      params: {
        chatId: chat.chatId,
        friendId: chat.id
      }
    });
  };

  return (
    <>
      <Header />
      <SafeAreaView style={styles.container}>
        <Image
          source={require('../../assets/images/Lightmodechat.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search friends..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#aaa"
          />
        </View>
        <ScrollView
          style={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatContentContainer}
        >
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, color: 'indigo', fontFamily: 'InriaSans-Bold' }}>Loading...</Text>
            </View>
          ) : filteredChats.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 18, color: '#888', fontFamily: 'InriaSans-Bold' }}>No friends found.</Text>
            </View>
          ) : (
            filteredChats.map(chat => (
              <Pressable
                key={chat.id}
                style={[
                  styles.chatRow,
                  chat.isUnread && styles.unreadChatRow
                ]}
                onPress={() => handleChatPress(chat)}
              >
                <Image source={{ uri: chat.profileImage }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                  <Text style={[
                    styles.name,
                    chat.isUnread && styles.unreadName
                  ]}>
                    {chat.name}
                  </Text>
                  <Text
                    style={[
                      styles.lastMessage,
                      chat.isUnread ? styles.unreadMessage : styles.readMessage
                    ]}
                    numberOfLines={1}
                  >
                    {chat.lastMessage}
                  </Text>
                </View>
                <View style={styles.timeContainer}>
                  <Text style={[
                    styles.time,
                    chat.isUnread && styles.unreadTime
                  ]}>
                    {chat.lastMessage === "Say hi!" ? "" : chat.time}
                  </Text>
                  {chat.isUnread && (
                    <View style={styles.unreadIndicator} />
                  )}
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative'
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
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'indigo',
    color: '#fff',
    fontFamily: 'InriaSans-Regular',
    backgroundColor: '#1C1B33'
  },
  chatContainer: {
    flex: 1,
  },
  chatContentContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
  },
  unreadChatRow: {
    backgroundColor: 'rgba(75, 0, 130, 0.1)',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    backgroundColor: '#e0e0e0',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    color: 'indigo',
    fontFamily: 'InriaSans-Bold',
    marginBottom: 2,
  },
  unreadName: {
    fontFamily: 'InriaSans-Bold',
    color: '#4B0082',
  },
  lastMessage: {
    fontSize: 15,
    fontFamily: 'InriaSans-Regular',
  },
  readMessage: {
    color: '#607d8b',
  },
  unreadMessage: {
    color: '#2c3e50',
    fontFamily: 'InriaSans-Bold',
  },
  timeContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'InriaSans-Regular',
  },
  unreadTime: {
    color: '#4B0082',
    fontFamily: 'InriaSans-Bold',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4B0082',
    marginTop: 4,
  },
});

export default Chats;