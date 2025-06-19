import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
const ChatHeader = ({ friend }) => {
    const router = useRouter();

    return (
        <View style={styles.header} >
            <Pressable onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <Pressable style={styles.button} onPress={() => router.push({ pathname: '/FriendProfile', params: { uid: friend.uid } })}>
                <Image source={{ uri: friend.profileImage }} style={styles.avatar} />
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.name}>{friend.username}</Text>
                    <Text style={styles.lastSeen}>
                       { `Last seen: ${new Date(friend.lastSeen).toLocaleString('en-IN', {
                                    timeZone: 'Asia/Kolkata',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                })}`}
                    </Text>
                </View>
            </Pressable>
        </View>

    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        padding: wp('4%'),
        paddingTop: hp('7%'),
        backgroundColor: '#1C1B33',
        borderRadius: 33,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: wp('4%'),
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e0e0',
    },
    name: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'InriaSans-Bold',
    },
    lastSeen: {
        fontSize: 13,
        color: '#607d8b',
        fontFamily: 'InriaSans-Regular',
    },
});

export default ChatHeader;