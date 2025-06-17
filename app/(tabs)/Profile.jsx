import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useAuth } from '../../context/authContext';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import { EditDataModal } from '../../components/EditDataModal';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
const Profile = () => {
    const { logout, fetchUserProfile, updateUserProfile, deleteUserProfile, updateProfileImage } = useAuth();
    const [isModalVisible, setModalVisible] = useState(false);
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editDetails, setEditDetails] = useState({
        username: '',
        phone: '',
        bio: '',
        city: '',
        state: ''
    });
    const { showActionSheetWithOptions } = useActionSheet();





    const [base64String, setbase64String] = useState(null);




    const convertImageToBase64 = async (fileUri) => {
        try {
            const base64Data = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,

            });
            return base64Data;
        } catch (error) {
            console.error('Error converting image to base64:', error);
            return null;
        }
    };
















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
        if (user) {
            setEditDetails({
                username: user.username || '',
                phone: user.phone || '',
                bio: user.bio || '',
                city: user.location?.city || '',
                state: user.location?.state || ''
            });
        }
        setModalVisible(!isModalVisible);
    };

    const handleSave = async () => {
        const updateData = {
            username: editDetails.username,
            phone: editDetails.phone,
            bio: editDetails.bio,
            'location.city': editDetails.city,
            'location.state': editDetails.state
        };

        const result = await updateUserProfile(updateData);

        if (result.success) {
            setModalVisible(false);
            fetchUser(); // Refresh profile data
            Alert.alert('Success', result.message);
        } else {
            Alert.alert('Error', result.message);
        }
    };

    const openGallery = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) {
                return;
            }
            setLoading(true);
            console.log(result.assets[0].uri);

            const uploadResult = await updateProfileImage(result.assets[0].uri);

            if (uploadResult.success) {
                await fetchUser();
                Alert.alert('Success', 'Profile image updated successfully!');
            } else {
                Alert.alert('Error', uploadResult.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile image');
            console.error('Gallery error:', error);
        } finally {
            setLoading(false);
        }
    };
    const openCamera = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) {
                return;
            }

            setLoading(true);

            // const uploadResult = await updateProfileImage(result.assets[0].uri);
            setbase64String(convertImageToBase64(result.assets[0].uri));
            console.log(base64String);

            if (uploadResult.success) {
                await fetchUser();
                Alert.alert('Success', 'Profile image updated successfully!');
            } else {
                Alert.alert('Error', uploadResult.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile image');
            console.error('Camera error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileImage = () => {
        showActionSheetWithOptions(
            {
                options: ['Take Photo', 'Upload from Gallery', 'Cancel',],
                cancelButtonIndex: 2,
                destructiveButtonIndex: 2,
                title: 'Select Attachment',
            },
            async (buttonIndex) => {
                if (buttonIndex === 0) {
                    openCamera();
                } else if (buttonIndex === 1) {
                    openGallery();
                } else if (buttonIndex === 2) {
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
            "Delete Profile",
            "Are you sure you want to delete your profile? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                        const result = await deleteUserProfile();

                        if (result.success) {
                            Alert.alert('Profile Deleted', result.message);
                            router.replace('/'); // Navigate to home or login screen
                        } else {
                            Alert.alert('Error', result.message);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    if (!user) return <Text style={{ textAlign: 'center', marginTop: 40 }}>No user data found.</Text>;

    const isDarkMode = false;

    return (
        <ScrollView style={{ flex: 1, height: '100%' }}>
            {/* <Image source={{uri : }} style={styles.backgroundImage} resizeMode="cover" /> */}
            <Image
                source={isDarkMode
                    ? require('../../assets/images/Darkmode1.jpg')
                    : require('../../assets/images/Lightmodechat.jpg')
                }
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: user.profileImage }} style={styles.image} />
                    <Pressable onPress={handleProfileImage} style={styles.cameraIcon}>
                        <Entypo name="camera" size={24} color="indigo" style={styles.cameraIcon} />
                    </Pressable>
                </View>
                <Text style={styles.username}>{user.username || 'Edit your profile'}</Text>
                <Text style={styles.bio}>{user.bio || 'Edit your profile'}</Text>
                <View style={styles.infoSectionWrapper}>
                    <Image
                        source={require('../../assets/images/Weekly.png')}
                        style={styles.infoBackgroundImage}
                    />
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Name:</Text>
                            <Text style={styles.value}>{user.name || 'Edit your profile'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{user.email || 'Edit your profile'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Phone:</Text>
                            <Text style={styles.value}>{user.phone || 'Edit your profile'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>City:</Text>
                            <Text style={styles.value}>{user.location?.city || 'Edit your profile'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>State:</Text>
                            <Text style={styles.value}>{user.location?.state || 'Edit your profile'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Joined:</Text>
                            <Text style={styles.value}>{user.createdAt?.split('T')[0] || 'Edit your profile'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.ButtonContainer}>
                    <Pressable style={styles.editButton} onPress={handleModal}>
                        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', fontFamily: 'InriaSans-Bold', }}>Edit Profile</Text>
                    </Pressable>
                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={{ color: 'black', fontSize: 16, textAlign: 'center', fontFamily: 'InriaSans-Bold', }}>Logout</Text>
                    </Pressable>
                    <Pressable style={styles.DeleteProfileButton} onPress={handleDelete}>
                        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', fontFamily: 'InriaSans-Bold', }}>Delete Profile</Text>
                    </Pressable>
                </View>
            </View>
            <Modal isVisible={isModalVisible} onBackdropPress={handleModal}>
                <EditDataModal
                    editDetails={editDetails}
                    setEditDetails={setEditDetails}
                    onClose={handleModal}
                    onSave={handleSave}
                />
            </Modal>
        </ScrollView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '100%',
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
        backgroundColor: '#fff',
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
    editButton: {
        backgroundColor: '#263238',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
        elevation: 1,
        width: '45%',
        fontFamily: 'InriaSans-Bold',
    },
    logoutButton: {
        backgroundColor: '#00DF82',
        color: '#fff',
        padding: 12,
        width: '45%',
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
        fontFamily: 'InriaSans-Bold',
    },
    DeleteProfileButton: {
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