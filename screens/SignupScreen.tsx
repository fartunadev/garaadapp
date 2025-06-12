// // GaraadApp/screens/SignupScreen.tsx
// import React, { useState, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
//   Alert, ScrollView, KeyboardAvoidingView, Platform,
// } from 'react-native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RouteProp } from '@react-navigation/native';
// import { AuthStackParamList } from '../navigation/AuthStack';
// import {
//   OnboardingQuestionnaireData as OnboardingData,
//   SignUpDataAPI,
//   AuthResponse,
//   UserProfileData
// } from '../types/auth';
// import FormInput from '../components/FormInput';
// import colors from '../constants/colors';
// import { signup } from '../services/authApi';
// import { storeTokens } from '../utils/storage';
// import { isValidEmail, isValidPassword, isNotEmpty, isValidAge } from '../utils/validators';

// type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;
// type SignupScreenRouteProp = RouteProp<AuthStackParamList, 'Signup'>;

// interface Props {
//   navigation: SignupScreenNavigationProp;
//   route: SignupScreenRouteProp;
// }

// // Styles should be defined before the component uses them
// const styles = StyleSheet.create({
//   keyboardAvoidingView: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: colors.background,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: colors.primary,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: colors.lightText,
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   button: {
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
//   buttonDisabled: {
//     backgroundColor: colors.darkGrey,
//   },
//   buttonText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   linkText: {
//     marginTop: 20,
//     color: colors.text,
//     textAlign: 'center',
//     fontSize: 14,
//   },
//   link: {
//     color: colors.link, // Make sure colors.link is defined in your colors.ts
//     fontWeight: 'bold',
//   },
// });

// const SignupScreen: React.FC<Props> = ({ navigation, route }) => {
//   // ... (state and useEffect for receivedOnboardingData)
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [age, setAge] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [nameError, setNameError] = useState('');
//   const [emailError, setEmailError] = useState('');
//   const [ageError, setAgeError] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const [confirmPasswordError, setConfirmPasswordError] = useState('');
//   const [receivedOnboardingData, setReceivedOnboardingData] = useState<OnboardingData>({});

//   useEffect(() => {
//     if (route.params?.onboardingData) {
//       setReceivedOnboardingData(route.params.onboardingData);
//     }
//   }, [route.params?.onboardingData]);


//   const validateForm = () => { /* ... your validation logic ... */ return true;};

//   const handleSignup = async () => {
//     if (!validateForm()) return;
//     setLoading(true);

//     const defaultOnboarding: OnboardingData = { /* ... your defaults ... */ };
//     const finalOnboardingData: OnboardingData = {
//       ...defaultOnboarding,
//       ...receivedOnboardingData,
//     };
//     const defaultProfile: UserProfileData = { bio: 'A new Garaad learner!' };

//     const signupPayload: SignUpDataAPI = {
//       email, password, name, age: parseInt(age, 10),
//       onboarding_data: finalOnboardingData,
//       profile: defaultProfile,
//     };

//     try {
//       const response: AuthResponse = await signup(signupPayload);
//       await storeTokens(response.tokens.access, response.tokens.refresh);
//       Alert.alert('Signup Successful!', `Welcome, ${response.user.name || response.user.username || 'learner'}!`);
//       // NAVIGATE DIRECTLY TO PROFILE SCREEN
//       navigation.replace('Profile', { user: response.user }); // <--- CHANGE HERE
//     } catch (error: any) {
//       Alert.alert('Signup Failed', error.message || 'An unexpected error occurred.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={styles.keyboardAvoidingView}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//       ...
// <View style={styles.container}>
//   <Text style={styles.title}>Samee Akoon</Text>
//   <Text style={styles.subtitle}>Ku biir Garaad oo bilaaw waxbarashada!</Text>

//   <FormInput
//     label="Magaca oo buuxa"
//     value={name}
//     onChangeText={setName}
//     placeholder="Magaca Isticmaalaha"
//     error={nameError}
//     touched={!!nameError}
//     autoCapitalize="words"
//   />
//   <FormInput
//     label="Email"
//     value={email}
//     onChangeText={setEmail}
//     placeholder="user@example.com"
//     keyboardType="email-address"
//     autoCapitalize="none"
//     error={emailError}
//     touched={!!emailError}
//   />
//   <FormInput
//     label="Da'da"
//     value={age}
//     onChangeText={setAge}
//     placeholder="18"
//     keyboardType="numeric"
//     error={ageError}
//     touched={!!ageError}
//   />
//   <FormInput
//     label="Furaha sirta ah"
//     value={password}
//     onChangeText={setPassword}
//     placeholder="********"
//     secureTextEntry
//     error={passwordError}
//     touched={!!passwordError}
//   />
//   <FormInput
//     label="Xaqiiji furaha sirta ah"
//     value={confirmPassword}
//     onChangeText={setConfirmPassword}
//     placeholder="********"
//     secureTextEntry
//     error={confirmPasswordError}
//     touched={!!confirmPasswordError}
//   />
//   <TouchableOpacity
//     style={[styles.button, loading && styles.buttonDisabled]}
//     onPress={handleSignup}
//     disabled={loading}
//   >
//     {loading ? (
//       <ActivityIndicator size="small" color={colors.white} />
//     ) : (
//       <Text style={styles.buttonText}>Diiwaangeli</Text>
//     )}
//   </TouchableOpacity>

//   <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//     <Text style={styles.linkText}>
//       Horey uga diiwaangashan tahay? <Text style={styles.link}>Soo gal</Text>
//     </Text>
//   </TouchableOpacity>
// </View>

//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };
// // Make sure your styles const is defined here or imported if in a separate file
// // const styles = StyleSheet.create({ ... });
// export default SignupScreen;
// GaraadApp/screens/SignupScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthStack';
import {
  OnboardingQuestionnaireData as OnboardingData,
  SignUpDataAPI,
  AuthResponse,
  UserProfileData,
  User
} from '../types/auth';
import FormInput from '../components/FormInput';
import colors from '../constants/colors';
import { signup } from '../services/authApi';
import { storeTokens } from '../utils/storage';
import { isValidEmail, isValidPassword, isNotEmpty, isValidAge } from '../utils/validators';

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;
type SignupScreenRouteProp = RouteProp<AuthStackParamList, 'Signup'>;

interface Props {
  navigation: SignupScreenNavigationProp;
  route: SignupScreenRouteProp;
}

// Using the same styles as LoginScreen for consistency, or you can define them separately
const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.lightText, marginBottom: 30, textAlign: 'center' },
  button: { backgroundColor: colors.primary, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', marginTop: 20, width: '100%', minHeight: 50, justifyContent: 'center' },
  buttonDisabled: { backgroundColor: colors.darkGrey },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  linkTextContainer: { marginTop: 25, padding: 5 },
  linkText: { color: colors.text, textAlign: 'center', fontSize: 14 },
  link: { color: colors.link, fontWeight: 'bold' },
});

const SignupScreen: React.FC<Props> = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [receivedOnboardingData, setReceivedOnboardingData] = useState<OnboardingData>({});

  useEffect(() => {
    if (route.params?.onboardingData) {
      setReceivedOnboardingData(route.params.onboardingData);
    }
  }, [route.params?.onboardingData]);

  const validateForm = (): boolean => {
    let isValid = true;
    if (!isNotEmpty(name)) { setNameError('Magaca waa loo baahan yahay.'); isValid = false; } else { setNameError(null); }
    if (!isValidEmail(email)) { setEmailError('Fadlan geli email sax ah.'); isValid = false; } else { setEmailError(null); }
    if (!isValidAge(age)) { setAgeError('Fadlan geli da\' sax ah (tusaale, 18).'); isValid = false; } else { setAgeError(null); }
    if (!isValidPassword(password)) { setPasswordError('Furaha sirta ah waa inuu ahaadaa ugu yaraan 8 xaraf.'); isValid = false; } else { setPasswordError(null); }
    if (!isNotEmpty(confirmPassword)) { setConfirmPasswordError('Fadlan xaqiiji furahaaga sirta ah.'); isValid = false; }
    else if (password !== confirmPassword) { setConfirmPasswordError('Furayaasha sirta ahi isma laha.'); isValid = false; }
    else { setConfirmPasswordError(null); }
    return isValid;
  };

  const handleSignup = async () => {
    setNameError(null); setEmailError(null); setAgeError(null); setPasswordError(null); setConfirmPasswordError(null);
    if (!validateForm()) return;
    setLoading(true);

    const defaultOnboarding: OnboardingData = {
      goal: receivedOnboardingData.goal || 'general_learning',
      learning_approach: receivedOnboardingData.learning_approach || 'self_paced',
      topic: receivedOnboardingData.topic || 'general',
      level: receivedOnboardingData.level || 'beginner',
      level_context: receivedOnboardingData.level_context || 'general',
      minutes_per_day: receivedOnboardingData.minutes_per_day || 15,
      preferred_learning_time: receivedOnboardingData.preferred_learning_time || 'anytime',
    };

    const defaultProfile: Partial<UserProfileData> = { bio: 'Barte cusub oo Garaad ah!' };

    const signupPayload: SignUpDataAPI = {
      email, password, name, age: parseInt(age, 10),
      onboarding_data: defaultOnboarding, // Use merged data
      profile: defaultProfile,
    };

    try {
      const response: AuthResponse = await signup(signupPayload);
      await storeTokens(response.tokens.access, response.tokens.refresh);
      Alert.alert('Diiwaangelin Guulaysatay!', `Ku soo dhawoow, ${response.user.name || response.user.username || 'barte'}! Akoonkaaga waa la sameeyay.`);
      navigation.replace('Profile', { user: response.user });
    } catch (error: any) {
      Alert.alert('Diiwaangelintii Way Fashilantay', error.message || 'Khalad aan la fileyn ayaa dhacay. Fadlan mar kale isku day.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Samee Akoon</Text>
          <Text style={styles.subtitle}>Ku biir Garaad oo bilaaw waxbarashada!</Text>
          <FormInput label="Magaca oo Buuxa" value={name} onChangeText={setName} placeholder="magaca oo sadaxan" error={nameError} touched={!!nameError} autoCapitalize="words"/>
          <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="user@example.com" keyboardType="email-address" autoCapitalize="none" error={emailError} touched={!!emailError}/>
          <FormInput label="Da'da" value={age} onChangeText={setAge} placeholder="18" keyboardType="numeric" error={ageError} touched={!!ageError}/>
          <FormInput label="Furaha Sirta Ah" value={password} onChangeText={setPassword} placeholder="Ugu yaraan 8 xaraf" secureTextEntry error={passwordError} touched={!!passwordError}/>
          <FormInput label="Xaqiiji Furaha Sirta Ah" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Ku celi furaha sirta ah" secureTextEntry error={confirmPasswordError} touched={!!confirmPasswordError}/>
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
            {loading ? (<ActivityIndicator size="small" color={colors.white} />) : (<Text style={styles.buttonText}>Diiwaangeli</Text>)}
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkTextContainer} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Horey ma isu diiwaangelisay? <Text style={styles.link}>Soo Gal</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;