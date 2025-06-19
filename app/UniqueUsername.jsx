
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/authContext';
import { useRouter } from 'expo-router';

const UniqueUsername = () => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [state, setState] = useState('');
    const [loading, setLoading] = useState(false);
    const { checkUniqueUsername, fetchUserProfile } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const result = await fetchUserProfile();
            if (result && result.success && result.data) {
                setUser(result.data);
                setUsername(result.data.username || '');
                setBio(result.data.bio || '');
                setPhone(result.data.phone || '');
                setCity(result.data.location.city || '');
                setState(result.data.location.state || '');
            } else if (result && result.message) {
                Alert.alert('Error', result.message);
            }
            setLoading(false);
        };
        fetchUser();
    }, []);
    const handleSubmit = async () => {
        try {
            if (username.trim() === '') {
                Alert.alert('Error', 'Please enter a valid username, bio, city and state.');
                return;
            }

            // Basic username validation
            if (username.length < 3) {
                Alert.alert('Error', 'Username must be at least 3 characters long.');
                return;
            }

            setLoading(true);
            const response = await checkUniqueUsername(username.toLowerCase(), bio, city, state);

            if (response.success) {
                Alert.alert('Success', response.message, [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.replace('/(tabs)/Chats');
                        }
                    }
                ]);
            } else {
                Alert.alert('Error', response.message);
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Please Enter The Following Details to Continue</Text>
                <View style={styles.inputContainer}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            value={username}
                            onChangeText={text => setUsername(text)}
                            placeholder='Enter Your Unique Username'
                            placeholderTextColor='grey'
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            value={bio}
                            onChangeText={text => setBio(text)}
                            placeholder='Enter Your Bio'
                            placeholderTextColor='grey'
                            multiline
                            numberOfLines={4}
                            style={[styles.input, styles.bioInput]}
                        />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            value={phone}
                            onChangeText={text => setPhone(text)}
                            placeholderTextColor='grey'
                            placeholder='Enter Your Phone Number'
                            style={styles.input}
                        />
                    </View>                    
                    <View style={styles.field}>
                        <Text style={styles.label}>City</Text>
                        <TextInput
                            value={city}
                            onChangeText={text => setCity(text)}
                            placeholderTextColor='grey'
                            placeholder='Enter Your City'
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>State</Text>
                        <TextInput
                            value={state}
                            onChangeText={text => setState(text)}
                            placeholderTextColor='grey'
                            placeholder='Enter Your State'
                            style={styles.input}
                        />
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <Pressable
                        onPress={handleSubmit}
                        style={[styles.button, loading && styles.buttonDisabled]}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1C1B33',
        padding: 20,
    },
    form: {
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        fontFamily: 'InriaSans-Bold',
        color: '#fff',
        marginBottom: 20,
        lineHeight: 32,
    },
    inputContainer: {
        margin: 20,
    },
    field: {
        margin: 10,
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontFamily: 'InriaSans-Bold',
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        fontSize: 16,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 40,
        alignItems: 'center',
        minWidth: 120,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default UniqueUsername;