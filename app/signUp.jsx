import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { CustomKeyboardView } from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const { username, phone, email, password } = formData;
    
    if (!username.trim()) {
      return 'Username is required';
    }
    if (username.trim().length < 2) {
      return 'Username must be at least 2 characters long';
    }
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    if (!validatePhone(phone)) {
      return 'Please enter a valid phone number';
    }
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!validateEmail(email)) {
      return 'Please enter a valid email address';
    }
    if (!password) {
      return 'Password is required';
    }
    if (!validatePassword(password)) {
      return 'Password must be at least 6 characters long';
    }
    
    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) {
      setError('');
    }
  };

  async function handleRegister() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      Alert.alert('Validation Error', validationError);
      return;
    }
    router.replace('/signIn');

    setLoading(true);
    setError('');

    try {
      const { username, phone, email, password } = formData;
      const response = await register(email, password, username, phone);
      
      if (response.success) {
        Alert.alert(
          'Registration Successful', 
          response.message,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/signIn')
            }
          ]
        );
      } else {
        setError(response.message || 'Registration failed.');
        Alert.alert('Registration Error', response.message || 'An error occurred during registration.');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      setError('An unexpected error occurred. Please try again.');
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
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
            {/* Username Field */}
            <View style={styles.inputField}>
              <Ionicons name="person-outline" size={24} color="indigo" />
              <TextInput
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                style={styles.inputText}
                placeholder="Username"
                placeholderTextColor="gray"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Phone Field */}
            <View style={styles.inputField}>
              <Ionicons name="call-outline" size={24} color="indigo" />
              <TextInput
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                style={styles.inputText}
                placeholder="Phone Number"
                placeholderTextColor="gray"
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Email Field */}
            <View style={styles.inputField}>
              <Ionicons name="mail-outline" size={24} color="indigo" />
              <TextInput
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value.toLowerCase().trim())}
                style={styles.inputText}
                placeholder="Email Address"
                placeholderTextColor="gray"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputField}>
              <Ionicons name="lock-closed-outline" size={24} color="indigo" />
              <TextInput
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                style={styles.inputText}
                placeholder="Password"
                secureTextEntry={!showPassword}
                placeholderTextColor="gray"
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="gray" 
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.disabledButton]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signInRedirect}>
            <Text style={styles.infoText}>Already have an account?</Text>
            <Pressable 
              onPress={() => router.push('/signIn')}
              disabled={loading}
            >
              <Text style={[styles.linkText, loading && styles.disabledLink]}> Sign In</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: wp('25%'),
    backgroundColor: '#1C1B33',
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
    position: 'relative',
  },
  inputText: {
    color: 'white',
    fontSize: wp('4%'),
    flex: 1,
    fontFamily: 'InriaSans-Regular',
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: '#ff4757',
    textAlign: 'center',
    width: wp('90%'),
    fontSize: wp('3.5%'),
    alignSelf: 'center',
    marginTop: 5,
    fontFamily: 'InriaSans-Regular',
  },
  registerButton: {
    width: wp('85%'),
    paddingVertical: hp('2%'),
    marginHorizontal: wp('7%'),
    backgroundColor: 'indigo',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp('6%'),
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.7,
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
    color: '#00DF82',
    fontWeight: 'bold',
    fontFamily: 'InriaSans-Bold',
  },
  disabledLink: {
    opacity: 0.5,
  },
});