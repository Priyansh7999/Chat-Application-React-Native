import { useActionSheet } from '@expo/react-native-action-sheet';
import { Entypo, Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';
import { EditDataModal } from '../../components/EditDataModal';
import { useAuth } from '../../context/authContext';
import { auth } from '../../firebaseConfig';

const Profile = () => {
    const { logout, fetchUserProfile, updateUserProfile, deleteUserProfile, updateProfileImage } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showActionSheetWithOptions } = useActionSheet();

    const fetchUser = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            router.replace('/signIn');
            setUser(null);
            setLoading(false);
            return;
        }

        const result = await fetchUserProfile();
        if (result.success) {
            setUser(result.data);
        } else {
            Alert.alert('Error', result.message);
        }
        setLoading(false);
    };


    useEffect(() => {
        fetchUser();
    }, []);

    const handleModal = () => {
       router.push('/UniqueUsername');
    };



    const [base64Image, setBase64Image] = useState(null);
    const DEFAULT_IMAGE_URL = 'https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdjkzNy1hZXctMTExXzMuanBn.jpg';
    const openGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });
            if (result.canceled) return;
            const base64 = result.assets[0].base64;
            const base64Uri = `data:image/jpeg;base64,${base64}`;
            Alert.alert(
                "Update Profile",
                "Are you sure you want to update your profile image?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Yes",
                        onPress: async () => {
                            setLoading(true);
                            setBase64Image(base64Uri);
                            const uploadResult = await updateProfileImage(base64);
                            if (uploadResult.success) {
                                const userResult = await fetchUserProfile();
                                if (userResult.success) {
                                    setUser(userResult.data);
                                }
                                Alert.alert("Success", uploadResult.message);
                            } else {
                                setBase64Image(null);
                                Alert.alert("Error", uploadResult.message);
                            }
                            setLoading(false);
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile image');
            console.error('Gallery error:', error);
            setLoading(false);
        }
    };


    const openCamera = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (result.canceled) return;
            const base64 = result.assets[0].base64;
            const base64Uri = `data:image/jpeg;base64,${base64}`;
            setLoading(true);
            setBase64Image(base64Uri);
            const uploadResult = await updateProfileImage(base64);
            if (uploadResult.success) {
                const userResult = await fetchUserProfile();
                if (userResult.success) {
                    setUser(userResult.data);
                }
                Alert.alert('Success', 'Profile image updated successfully!');
            } else {
                setBase64Image(null);
                Alert.alert('Error', uploadResult.message);
            }
        } catch (error) {
            setBase64Image(null);
            Alert.alert('Error', 'Failed to update profile image');
            console.error('Camera error:', error);
        } finally {
            setLoading(false);
        }
    };


    const removeProfileImage = async () => {
        Alert.alert(
            "Remove Profile",
            "Are you sure you want to remove your profile image?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const result = await updateProfileImage(DEFAULT_IMAGE_URL, true);
                            if (result.success) {
                                setBase64Image(null);
                                const userResult = await fetchUserProfile();
                                if (userResult.success) {
                                    setUser(userResult.data);
                                }
                                Alert.alert("Success", result.message);
                            } else {
                                Alert.alert("Error", result.message);
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Failed to remove profile image.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };


    const handleProfileImage = () => {
        showActionSheetWithOptions(
            {
                options: ['Take Photo', 'Upload from Gallery', 'Remove Image', 'Cancel'],
                cancelButtonIndex: 3,
                destructiveButtonIndex: 3,
                title: 'Update Profile Picture',
            },
            async (buttonIndex) => {
                if (buttonIndex === 0) {
                    openCamera();
                } else if (buttonIndex === 1) {
                    openGallery();
                } else if (buttonIndex === 2) {
                    removeProfileImage();
                }
            }
        )
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to logout.');
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const result = await deleteUserProfile();

                        if (result.success) {
                            Alert.alert('Account Deleted', result.message);
                            router.replace('/');
                        } else {
                            Alert.alert('Error', result.message);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00DF82" />
        </View>
    );

    if (!user) return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No user data found.</Text>
        </View>
    );

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
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.headerSection}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{
                                uri: base64Image || user.profileImage || DEFAULT_IMAGE_URL
                            }}
                            style={styles.profileImage}
                        />
                        <Pressable onPress={handleProfileImage} style={styles.editImageButton}>
                            <Entypo name="camera" size={16} color="#fff" />
                        </Pressable>
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                            {user.username || 'Set Username'}
                        </Text>
                        <Text style={styles.userEmail}>
                            {user.email}
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
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>
                                {user.phone || 'Not provided'}
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
                            <Text style={styles.infoLabel}>Member Since</Text>
                            <Text style={styles.infoValue}>
                                {user.createdAt ?
                                    new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'Unknown'
                                }
                            </Text>
                        </View>
                    </View>
                    <View style={styles.actionContainer}>
                        <Pressable style={styles.primaryButton} onPress={handleModal}>
                            <Feather name="edit" size={18} color="#fff" />
                            <Text style={styles.primaryButtonText}>Edit Profile</Text>
                        </Pressable>

                        <View style={styles.secondaryButtonsRow}>
                            <Pressable style={styles.secondaryButton} onPress={handleLogout}>
                                <MaterialIcons name="logout" size={18} color="#666" />
                                <Text style={styles.secondaryButtonText}>Logout</Text>
                            </Pressable>

                            <Pressable style={styles.dangerButton} onPress={handleDelete}>
                                <MaterialIcons name="delete" size={18} color="#fff" />
                                <Text style={styles.dangerButtonText}>Delete Account</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ScrollView>
            
        </View>
    );
};

export default Profile;

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

    headerSection: {
        backgroundColor: '#1C1B33',
        paddingTop: 60,
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
    editImageButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#00DF82',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1C1B33',
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
    primaryButton: {
        backgroundColor: '#00DF82',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#00DF82',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        fontFamily: 'InriaSans-Bold',
    },
    secondaryButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    secondaryButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
        fontFamily: 'InriaSans-Bold',
    },
    dangerButton: {
        backgroundColor: '#ff4757',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        flex: 1,
    },
    dangerButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
        fontFamily: 'InriaSans-Bold',
    }
});