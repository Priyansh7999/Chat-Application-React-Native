import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { CustomKeyboardView } from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';

export default function SignUpScreen() {
  const usernameRef = useRef('');
  const passwordRef = useRef('');
  const emailRef = useRef('');
  const phoneRef = useRef('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { register } = useAuth();

  async function handleRegister() {
    if(!emailRef.current || !passwordRef.current || !usernameRef.current || !phoneRef.current) {
        Alert.alert('Sign Up', 'Please fill in all fields.');
        return;
    }
    
  let response = await register(emailRef.current, passwordRef.current, usernameRef.current, phoneRef.current);
    
    if (response.success) {
      router.replace('/signIn');
    } else {
      setError(response.message || 'Registration failed.');
      Alert.alert('Sign Up Error', response.message || 'An error occurred during registration.');
      console.error('Registration Error:', response.message);
    }
  }

  return (
    <CustomKeyboardView>
      <View style={styles.contentContainer}>
        <View style={styles.imageWrapper}>
          <Image
            resizeMode="contain"
            source={require('../assets/images/register.png')}
            style={styles.image}
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.heading}>Sign up</Text>

          <View style={styles.formGroup}>
            {/* Name Field */}
            <View style={styles.inputField}>
              <Ionicons name="person-outline" size={24} color="indigo" />
              <TextInput
                onChangeText={value => (usernameRef.current = value)}
                style={styles.inputText}
                placeholder="Username"
                placeholderTextColor="gray"
              />
            </View>
            {/* Phone Field */}
            <View style={styles.inputField}>
              <Ionicons name="call-outline" size={24} color="indigo" />
              <TextInput
                onChangeText={value => (phoneRef.current = value)}
                style={styles.inputText}
                placeholder="Phone Number"
                placeholderTextColor="gray"
                keyboardType="phone-pad"
              />
            </View>
            {/* Email Field */}
            <View style={styles.inputField}>
              <Ionicons name="mail-outline" size={24} color="indigo" />
              <TextInput
                onChangeText={value => (emailRef.current = value)}
                style={styles.inputText}
                placeholder="Email Address"
                placeholderTextColor="gray"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {/* Password Field */}
            <View style={styles.inputField}>
              <Ionicons name="lock-closed-outline" size={24} color="indigo" />
              <TextInput
                onChangeText={value => (passwordRef.current = value)}
                style={styles.inputText}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="gray"
              />
            </View>
            {/* Error Message */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <View style={styles.signInRedirect}>
            <Text style={styles.infoText}>Already have an account?</Text>
            <Pressable onPress={() => router.push('/signIn')}>
              <Text style={styles.linkText}> Sign In</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}

// ...styles remain unchanged...
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: wp('25%'),
    backgroundColor: 'transparent',
    gap: 12,
  },
  imageWrapper: {
    alignItems: 'center',
  },
  image: {
    height: hp('25%'),
  },
  formContainer: {
    gap: 12,
  },
  heading: {
    fontSize: 30,
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'InriaSans-Bold',
  },
  formGroup: {
    flexDirection: 'column',
    gap: 12,
  },
  inputField: {
    flexDirection: 'row',
    width: wp('85%'),
    gap: 4,
    paddingVertical: hp('1.2%'),
    marginHorizontal: wp('7%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'indigo',
  },
  inputText: {
    color: 'white',
    fontSize: wp('4%'),
    flex: 1,
    fontFamily: 'InriaSans-Regular',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    width: wp('90%'),
    fontSize: wp('4%'),
    alignSelf: 'center',
  },
  registerButton: {
    width: wp('85%'),
    paddingVertical: hp('2%'),
    marginHorizontal: wp('7%'),
    backgroundColor: 'indigo',
    borderRadius: 17,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: wp('4.5%'),
    fontFamily: 'InriaSans-Bold',
  },
  signInRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  infoText: {
    color: 'white',
    fontWeight: '200',
    fontFamily: 'InriaSans-Bold',
  },
  linkText: {
    color: 'red',
    fontWeight: 'bold',
  },
});