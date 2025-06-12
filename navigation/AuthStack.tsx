// GaraadApp/navigation/AuthStack.tsx
import React from 'react';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native'; // Correct import for RouteProp

// Import Screen Components
import SplashScreen from '../screens/SplashScreen';
import AnimatedOnboardingScreen from '../screens/AnimatedOnboardingScreen';
import OnboardingQuestionnaireScreen from '../screens/OnboardingQuestionnaireScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileScreen from '../screens/ProfileScreen';
// If you implement WelcomeScreen or CourseSelectionIntroScreen, import them:
// import WelcomeScreen from '../screens/WelcomeScreen';
// import CourseSelectionIntroScreen from '../screens/CourseSelectionIntroScreen';


// Import Types
import { User, OnboardingQuestionnaireData as OnboardingData } from '../types/auth'; // Assuming OnboardingQuestionnaireData is the one for signup

// For Placeholder Home Screen
import { View, Text, Button, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { removeTokens } from '../utils/storage';

// Define the parameter list for the Auth stack
export type AuthStackParamList = {
  Splash: undefined;
  // Welcome: undefined; // Uncomment if you add WelcomeScreen
  // CourseSelectionIntro: undefined; // Uncomment if you add CourseSelectionIntroScreen
  AnimatedOnboarding: undefined;
  OnboardingQuestionnaire: undefined;
  Login: undefined;
  Signup: { onboardingData: OnboardingData };
  Home: { user: User };
  Profile: { user: User };
};

const Stack = createStackNavigator<AuthStackParamList>();

// Placeholder for the Home screen after login/signup
const HomeScreenPlaceholder: React.FC<{
  navigation: StackNavigationProp<AuthStackParamList, 'Home'>;
  route: RouteProp<AuthStackParamList, 'Home'>; // Uses corrected RouteProp
}> = ({ navigation, route }) => {
  const { user } = route.params;

  const handleLogout = async () => {
    await removeTokens();
    navigation.replace('Login');
  };

  return (
    <View style={homeStyles.container}>
      <Text style={homeStyles.text}>Welcome, {user.name || user.username}!</Text>
      <Text style={homeStyles.subText}>(Main App Dashboard Area)</Text>
      <View style={{ marginVertical: 10 }}>
        <Button
          title="Go to My Profile"
          onPress={() => navigation.navigate('Profile', { user })}
          color={colors.primary}
        />
      </View>
      <Button title="Log Out" onPress={handleLogout} color={colors.error} />
    </View>
  );
};

const homeStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  text: { fontSize: 22, color: colors.primary, marginBottom: 10 },
  subText: { fontSize: 16, color: colors.text, marginBottom: 20 },
});

// The Navigator component
const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      {/* <Stack.Screen name="Welcome" component={WelcomeScreen} /> */}
      {/* <Stack.Screen name="CourseSelectionIntro" component={CourseSelectionIntroScreen} /> */}
      <Stack.Screen name="AnimatedOnboarding" component={AnimatedOnboardingScreen} />
      <Stack.Screen name="OnboardingQuestionnaire" component={OnboardingQuestionnaireScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreenPlaceholder} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;