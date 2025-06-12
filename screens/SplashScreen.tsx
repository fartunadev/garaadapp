// // // GaraadApp/screens/SplashScreen.tsx
// // import React, { useEffect } from 'react';
// // import { View, Text, StyleSheet, ActivityIndicator,  Platform } from 'react-native';
// // import { StackNavigationProp } from '@react-navigation/stack';
// // import { AuthStackParamList } from '../navigation/AuthStack';
// // import { getAccessToken } from '../utils/storage';
// // import colors from '../constants/colors';
// // import { LinearGradient } from 'expo-linear-gradient';

// // type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

// // interface Props {
// //   navigation: SplashScreenNavigationProp;
// // }

// // const SplashScreen: React.FC<Props> = ({ navigation }) => {
// //   useEffect(() => {
// //     const checkAuthStatus = async () => {
// //       await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
// //       try {
// //         const accessToken = await getAccessToken();
// //         if (accessToken) {
 
// //           navigation.replace('Home'); // Replace with your actual main app screen
// //         } else {
// //           // User is not logged in, navigate to Onboarding
// //           navigation.replace('Onboarding');
// //         }
// //       } catch (e) {
// //         console.error("Failed to check auth status", e);
// //         navigation.replace('Onboarding'); // Fallback to onboarding
// //       }
// //     };

// //     checkAuthStatus();
// //   }, [navigation]);

// //   return (
// //     <LinearGradient
// //       colors={[colors.onboardingGradientStart, colors.onboardingGradientEnd]}
// //       style={styles.container}
// //     >
// //       <Text style={styles.title}>Garaad</Text>
// //       <ActivityIndicator size="large" color={colors.onboardingText} style={{ marginTop: 20 }} />
// //     </LinearGradient>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   title: {
// //     fontSize: 52,
// //     fontWeight: 'bold',
// //     color: colors.onboardingText,
// //     fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-condensed-bold', // Example font
// //   },
// // });

// // export default SplashScreen;
// // GaraadApp/screens/SplashScreen.tsx
// import React, { useEffect } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator,  Platform } from 'react-native';
// import { StackNavigationProp } from '@react-navigation/stack';
// // Ensure AuthStackParamList is imported correctly
// import { AuthStackParamList } from '../navigation/AuthStack';
// import { getAccessToken } from '../utils/storage';
// import colors from '../constants/colors';
// import { LinearGradient } from 'expo-linear-gradient';

// type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

// interface Props {
//   navigation: SplashScreenNavigationProp;
// }

// const SplashScreen: React.FC<Props> = ({ navigation }) => {
//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       await new Promise(resolve => setTimeout(resolve, 1500));
//       try {
//         const accessToken = await getAccessToken();
//         if (accessToken) {
//           navigation.replace('Home');
//         } else {
//           // CORRECTED NAVIGATION: Navigate to the start of the animated onboarding
//           navigation.replace('AnimatedOnboarding');
//         }
//       } catch (e) {
//         console.error("Failed to check auth status", e);
//         // CORRECTED NAVIGATION: Fallback to the start of the animated onboarding
//         navigation.replace('AnimatedOnboarding');
//       }
//     };

//     checkAuthStatus();
//   }, [navigation]);

//   return (
//     // ... (JSX remains the same) ...
//     <LinearGradient
//       colors={[colors.onboardingGradientStart, colors.onboardingGradientEnd]}
//       style={styles.container}
//     >
//       <Text style={styles.title}>Garaad</Text>
//       <ActivityIndicator size="large" color={colors.onboardingText} style={{ marginTop: 20 }} />
//     </LinearGradient>
//   );
// };

// // styles remain the same
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 52,
//     fontWeight: 'bold',
//     color: colors.onboardingText,
//     fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-condensed-bold', // Example font
//   },
// });

// export default SplashScreen;
// GaraadApp/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Platform, StatusBar as ReactNativeStatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthStack'; // Ensure this path is correct
import { getAccessToken, removeTokens } from '../utils/storage'; // Added removeTokens for error case
import colors from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '../types/auth'; // Import User type
import { fetchMyProfile } from '../services/userApi'; // Import your API function to get user profile

type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
      const checkAuthStatus = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      try {
        const accessToken = await getAccessToken();
        if (accessToken) {
          try {
            const userProfile: User = await fetchMyProfile();
            if (userProfile) {
              // NAVIGATE DIRECTLY TO PROFILE SCREEN
              navigation.replace('Profile', { user: userProfile }); // <--- CHANGE HERE
            } else {
              await removeTokens();
              navigation.replace('AnimatedOnboarding'); // Or your first non-auth screen
            }
          } catch (profileError) {
            console.error("Error fetching profile on splash:", profileError);
            await removeTokens();
            navigation.replace('AnimatedOnboarding'); // Or your first non-auth screen
          }
        } else {
          navigation.replace('AnimatedOnboarding'); // Or your first non-auth screen
        }
      } catch (e) {
        console.error("Error in checkAuthStatus:", e);
        await removeTokens();
        navigation.replace('AnimatedOnboarding'); // Or your first non-auth screen
      }
    };


    checkAuthStatus();
  }, [navigation]);

  return (
    <LinearGradient
      colors={[colors.onboardingGradientStart, colors.onboardingGradientEnd]} // These colors should be for your splash screen
      style={styles.container}
    >
      {/* You might want a different design for the actual splash screen content */}
      <Text style={styles.title}>Garaad</Text>
      <ActivityIndicator size="large" color={colors.onboardingText} style={{ marginTop: 20 }} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: colors.onboardingText, // Ensure this color contrasts with gradient
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-condensed-bold',
  },
});

export default SplashScreen;