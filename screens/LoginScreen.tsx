// // GaraadApp/screens/LoginScreen.tsx
// import React, { useState } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
//   Alert, ScrollView, KeyboardAvoidingView, Platform,
// } from 'react-native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { AuthStackParamList } from '../navigation/AuthStack';
// import FormInput from '../components/FormInput';
// import colors from '../constants/colors';
// import { login } from '../services/authApi';
// import { storeTokens } from '../utils/storage';
// import { isValidEmail, isValidPassword } from '../utils/validators';
// import { AuthResponse, OnboardingQuestionnaireData, User } from '../types/auth'; // Import User for mockUserForHome type safety if needed

// type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

// interface Props {
//   navigation: LoginScreenNavigationProp;
// }

// // DEFINE STYLES BEFORE THE COMPONENT THAT USES THEM
// const styles = StyleSheet.create({
//   keyboardAvoidingView: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   container: { // <<< THIS WAS MISSING
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: colors.background,
//   },
//   title: { // <<< THIS WAS MISSING
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: colors.primary,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   subtitle: { // <<< THIS WAS MISSING
//     fontSize: 16,
//     color: colors.lightText,
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   button: { // <<< THIS WAS MISSING
//     backgroundColor: colors.primary,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 20,
//     width: '100%',
//     minHeight: 50,
//     justifyContent: 'center',
//   },
//   buttonDisabled: { // <<< THIS WAS MISSING
//     backgroundColor: colors.darkGrey,
//   },
//   buttonText: { // <<< THIS WAS MISSING
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   linkText: { // <<< THIS WAS MISSING
//     marginTop: 20,
//     color: colors.text,
//     textAlign: 'center',
//     fontSize: 14,
//   },
//   link: { // <<< THIS WAS MISSING
//     color: colors.link, // Make sure colors.link is defined
//     fontWeight: 'bold',
//   },
// });

// const LoginScreen: React.FC<Props> = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [emailError, setEmailError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   const validate = () => {
//     let valid = true;
//     if (!isValidEmail(email)) {
//       setEmailError('Please enter a valid email address.');
//       valid = false;
//     } else {
//       setEmailError('');
//     }
//     if (!isValidPassword(password)) {
//       setPasswordError('Password must be at least 8 characters.');
//       valid = false;
//     } else {
//       setPasswordError('');
//     }
//     return valid;
//   };

//   const handleLogin = async () => {
//     if (!validate()) return;
//     setLoading(true);
//     try {
//       const response: AuthResponse = await login({ email, password });
//       await storeTokens(response.tokens.access, response.tokens.refresh);
//       Alert.alert('Login Successful', `Welcome ${response.user.first_name || response.user.username}!`);
//       navigation.replace('Home', { user: response.user });
//     } catch (error: any) {
//       Alert.alert('Login Failed', error.message || 'An unexpected error occurred.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={styles.keyboardAvoidingView} // Now styles.keyboardAvoidingView is defined
//     >
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <View style={styles.container}> {/* Now styles.container is defined */}
//           <Text style={styles.title}>➡️ Ku soo dhawoow mar kale!</Text>
//           <Text style={styles.subtitle}>➡️ Geli si aad u sii wadato safarkaaga waxbarasho.</Text>
//           <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="user@example.com" keyboardType="email-address" autoCapitalize="none" error={emailError} touched={!!emailError} />
//           <FormInput label="Furaha sirta ah" value={password} onChangeText={setPassword} placeholder="********" secureTextEntry error={passwordError} touched={!!passwordError} />
//           <TouchableOpacity
//             style={[styles.button, loading && styles.buttonDisabled]} // Now styles.button & styles.buttonDisabled are defined
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             {loading ? (<ActivityIndicator color={colors.white} />) : (<Text style={styles.buttonText}>Log In</Text>)} {/* Now styles.buttonText is defined */}
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => navigation.navigate('Signup', { onboardingData: {} as OnboardingQuestionnaireData })}>
//             <Text style={styles.linkText}> {/* Now styles.linkText is defined */}
//               ma lihid account? <Text style={styles.link}>Isdiiwaan geli</Text> {/* Now styles.link is defined */}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// export default LoginScreen;
// GaraadApp/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import FormInput from '../components/FormInput';
import colors from '../constants/colors';
import { login } from '../services/authApi';
import { storeTokens } from '../utils/storage';
import { isValidEmail, isValidPassword } from '../utils/validators';
import { AuthResponse, OnboardingQuestionnaireData as OnboardingData, User } from '../types/auth';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightText,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.darkGrey,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkTextContainer: {
    marginTop: 25,
    padding: 5,
  },
  linkText: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 14,
  },
  link: {
    color: colors.link,
    fontWeight: 'bold',
  },
});

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validate = () => {
    let isValid = true;
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(null);
    }
    if (!isValidPassword(password)) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    } else {
      setPasswordError(null);
    }
    return isValid;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError(null);
    setPasswordError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const response: AuthResponse = await login({ email, password });
      await storeTokens(response.tokens.access, response.tokens.refresh);
      Alert.alert('Login Successful', `Welcome ${response.user.first_name || response.user.username}!`);
      navigation.replace('Profile', { user: response.user });
    } catch (error: any) {
      // The error.message here will be the parsed one from authApi.ts
      Alert.alert('Login Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>➡️ Ku soo dhawoow mar kale!</Text>
          <Text style={styles.subtitle}>Geli si aad u sii wadato safarkaaga waxbarasho.</Text>
          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="user@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            touched={!!emailError}
          />
          <FormInput
            label="Furaha sirta ah"
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry
            error={passwordError}
            touched={!!passwordError}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (<ActivityIndicator size="small" color={colors.white} />) : (<Text style={styles.buttonText}>Soo Gal</Text>)}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkTextContainer}
            onPress={() => navigation.navigate('Signup', { onboardingData: {} as OnboardingData })}
          >
            <Text style={styles.linkText}>
              Ma lihid akoon? <Text style={styles.link}>Isdiiwaan Geli</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;