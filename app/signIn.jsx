import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { CustomKeyboardView } from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, resendVerificationEmail, hasUsername } = useAuth();
  async function handleLogin() {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await login(email, password);
      setIsLoading(false);
      if (response.success) {
        const usernameExists = await hasUsername();
        if (usernameExists) {
          router.replace('/Chats');
        } else {
          router.replace('/UniqueUsername');
        }
      } else {
        if (response.needsVerification) {
          Alert.alert(
            'Email Verification Required',
            response.message,
            [
              { text: 'OK', style: 'cancel', onPress: () => { router.replace('/signIn') } },
              {
                text: 'Resend Email',
                onPress: () => { handleResendVerification(); router.replace('/signIn') }
              }
            ]
          );
        } else {
          setError(response.message || 'An error occurred during login.');
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      console.error('Login Error:', err);
    } finally {
      setIsLoading(false);
    }
  }
  const handleResendVerification = async () => {
    if (resendVerificationEmail) {
      try {
        const result = await resendVerificationEmail();
        Alert.alert(
          result.success ? 'Success' : 'Error',
          result.message
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to resend verification email.');
      }
    } else {
      Alert.alert('Info', 'Please check your email for the verification link.');
    }
  };
if (isLoading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Loading...</Text>
    </View>
  );
}

  return (
    <CustomKeyboardView>
      <View style={styles.container}>
        <View style={styles.container2}>
          <View style={styles.imageContainer}>
            <Image resizeMode='contain' source={require('../assets/images/login.png')} style={styles.image} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.loginText}>Sign In</Text>

            <View style={styles.Bigform}>
              <View style={styles.form}>
                <Ionicons name="mail-outline" size={24} color="indigo" />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text.toLowerCase().trim());
                    setError('');
                  }}
                  style={styles.formInput}
                  placeholder='Email Address'
                  placeholderTextColor='gray'
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={{ gap: 5 }}>
                <View style={styles.form}>
                  <Ionicons name="lock-closed-outline" size={24} color="indigo" />
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError('');
                    }}
                    style={styles.formInput}
                    placeholder='Password'
                    secureTextEntry
                    placeholderTextColor='gray'
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account?</Text>
              <Pressable onPress={() => router.push('/signUp')}>
                <Text style={styles.signUpLink}> Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container2: {
    flex: 1,
    paddingTop: wp('25%'),
    gap: 12,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    height: hp('25%'),
  },
  textContainer: {
    gap: 12,
  },
  loginText: {
    fontSize: 30,
    textAlign: 'center',
    color: '#ffffff',
    fontFamily: 'InriaSans-Bold'
  },
  Bigform: {
    flexDirection: 'column',
    gap: 12
  },
  form: {
    flexDirection: 'row',
    width: wp('85%'),
    gap: 4,
    paddingVertical: hp('1.2%'),
    marginHorizontal: wp('7%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'indigo'
  },
  formInput: {
    fontSize: wp('4%'),
    flex: 1,
    color: 'white',
    fontFamily: 'InriaSans-Regular'
  },
  errorText: {
    width: wp('90%'),
    fontSize: wp('4%'),
    textAlign: 'center',
    color: 'red',
    fontFamily: 'InriaSans-Regular'
  },
  loginButton: {
    width: wp('85%'),
    gap: 4,
    paddingVertical: hp('2%'),
    marginHorizontal: wp('7%'),
    backgroundColor: 'indigo',
    borderRadius: 17,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: wp('5%'),
    fontFamily: 'InriaSans-Bold'
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  signUpText: {
    color: 'white',
    fontWeight: '200',
    fontFamily: 'InriaSans-Bold'
  },
  signUpLink: {
    color: 'red',
    fontWeight: 'bold'
  }
});