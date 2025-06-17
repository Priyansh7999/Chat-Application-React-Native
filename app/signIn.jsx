import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { CustomKeyboardView } from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  async function handleLogin() {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      const response = await login(email, password);
      if (response.success) {
        router.replace('/Chats');
      } else {
        Alert.alert('Login Error', response.message || 'An error occurred during login.');
        console.error('Login Error:', response.message);
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'An unexpected error occurred.');
      console.error('Login Error:', err);
    }
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
                  onChangeText={setEmail}
                  style={styles.formInput}
                  placeholder='Email Address'
                  placeholderTextColor='gray' />
              </View>
              <View style={{ gap: 5 }}>
                <View style={styles.form}>
                  <Ionicons name="lock-closed-outline" size={24} color="indigo" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={styles.formInput}
                    placeholder='Password'
                    secureTextEntry
                    placeholderTextColor='gray' />
                </View>
                <Text style={{ width: wp('90%'), fontSize: wp('4%'), textAlign: 'center', color: 'red' }}>{error}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
           

            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '200', fontFamily: 'InriaSans-Bold' }}>Don't have an account?</Text>
              <Pressable onPress={() => router.push('/signUp')}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}> Sign Up</Text>
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
  loginButton: {
    width: wp('85%'),
    gap: 4,
    paddingVertical: hp('2%'),
    marginHorizontal: wp('7%'),
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    borderRadius: 17,
    backgroundColor: 'indigo',
  },
  loginButtonText: {
    color: 'white',
    fontSize: wp('5%'),
    fontFamily: 'InriaSans-Bold'
  }
})