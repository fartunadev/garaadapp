// // GaraadApp/screens/AnimatedOnboardingScreen.tsx
// import React, { useState, useRef } from 'react';
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   Dimensions,
//   Platform,
//   FlatList,
//   ViewToken,
//   Text,
//   StatusBar as ReactNativeStatusBar,
// } from 'react-native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { AuthStackParamList } from '../navigation/AuthStack'; // Adjust path
// import colors from '../constants/colors';
// import { onboardingSlidesData, OnboardingSlide, OnboardingIconConfig } from '../constants/OnboardingData';
// import IconRenderer from '../components/AnimatedIcon'; // Your existing component
// import AnimatedText from '../components/AnimatedText';   // Your existing component
// import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// const { width, height } = Dimensions.get('window');

// type AnimatedOnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'AnimatedOnboarding'>;

// interface Props {
//   navigation: AnimatedOnboardingScreenNavigationProp;
// }

// const AnimatedOnboardingScreen: React.FC<Props> = ({ navigation }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

//   const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
//     if (viewableItems.length > 0 && viewableItems[0].index !== null && viewableItems[0].index !== undefined) {
//       setCurrentIndex(viewableItems[0].index);
//     }
//   }).current;

//   const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

//   const handleNextOrGetStarted = () => {
//     if (currentIndex < onboardingSlidesData.length - 1) {
//       flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
//     } else {
//       navigation.replace('OnboardingQuestionnaire'); // Ensure this route exists
//     }
//   };

//   const renderItem = ({ item, index: itemIndex }: { item: OnboardingSlide, index: number }) => (
//     <View style={styles.slide}>
//       <View style={styles.illustrationContainer}>
//         {item.icons.map((iconConfig: OnboardingIconConfig, iconIdx: number) => (
//           <View
//             key={`${item.id}-icon-${iconIdx}`}
//             style={[
//               iconConfig.style, // Contains position, transform
//               iconConfig.shadowColor ? { // Apply shadow if defined
//                 shadowColor: iconConfig.shadowColor,
//                 shadowOffset: iconConfig.shadowOffset || { width: 0, height: 2 },
//                 shadowRadius: iconConfig.shadowRadius || 5,
//                 shadowOpacity: iconConfig.shadowOpacity || 0.15, // Ensure this is > 0
//                 elevation: Platform.OS === 'android' ?
//                            // Simplified elevation, adjust if needed
//                            (iconConfig.shadowRadius || 5) / 1.5
//                            : undefined,
//               } : {}
//             ]}
//           >
//             <IconRenderer
//               name={iconConfig.name}
//               type={iconConfig.type as any} // Cast if IconRenderer's type is broader
//               size={iconConfig.size}
//               color={iconConfig.color}
//             />
//           </View>
//         ))}
//       </View>
//       <View style={styles.textContentContainer}>
//         <AnimatedText
//           text={item.title}
//           isActive={itemIndex === currentIndex}
//           customStyle={styles.title}
//           delay={100}
//         />
//         {item.description && (
//           <AnimatedText
//             text={item.description}
//             isActive={itemIndex === currentIndex}
//             customStyle={styles.description}
//             delay={250}
//           />
//         )}
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.fullScreenContainer}>
//       {Platform.OS === 'android' && (
//         <View style={{ height: ReactNativeStatusBar.currentHeight, backgroundColor: colors.onboardingBackground }} />
//       )}
//       <ExpoStatusBar style="dark" translucent={Platform.OS === 'android'} backgroundColor="transparent" />

//       <SafeAreaView style={styles.safeAreaContent}>
//         <FlatList
//           ref={flatListRef}
//           data={onboardingSlidesData}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.id.toString()}
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//           onViewableItemsChanged={onViewableItemsChanged}
//           viewabilityConfig={viewabilityConfig}
//           scrollEventThrottle={16}
//           style={styles.flatList}
//         />

//         <View style={styles.footerControls}>
//           <View style={styles.paginationContainer}>
//             {onboardingSlidesData.map((_, index) => (
//               <View
//                 key={index}
//                 style={[
//                   styles.paginationDot,
//                   { backgroundColor: index === currentIndex ? colors.onboardingPaginationDotActive : colors.onboardingPaginationDotInactive },
//                 ]}
//               />
//             ))}
//           </View>

//           <TouchableOpacity style={styles.button} onPress={handleNextOrGetStarted}>
//             <Text style={styles.buttonText}>
//               {currentIndex < onboardingSlidesData.length - 1 ? 'Soco' : 'Bilow'}
//             </Text>
//           </TouchableOpacity>
//             <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//             <Text style={styles.linkText}>
//               Horey uga diiwaangashan tahay? <Text style={styles.link}>Soo gal</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   fullScreenContainer: {
//     flex: 1,
//     backgroundColor: colors.onboardingBackground, // WHITE BACKGROUND
//   },
//   safeAreaContent: {
//     flex: 1,
//   },
//   flatList: {
//     flex: 1,
//   },
//   slide: {
//     width: width,
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center', // Center content vertically within the slide
//     paddingHorizontal: 25,
//   },
//   illustrationContainer: {
//     // backgroundColor: '#edede9',
//     marginTop:50,
//     shadowRadius: 900,
//     borderRadius: 90, 
//     shadowColor: colors.primary, // Shadow color matching button for a subtle glow
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
   
//     width: '100%',
//     height: height * 0.45, // Adjust space for icons
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//     marginBottom: 40, // Space between icons and text
//      // For debugging layout
//   },
//   textContentContainer: {
//     width: '100%', // Use full width for text alignment
//     alignItems: 'center',
//     paddingBottom: 20, // Space before footer
//   },
//   title: {
//     fontSize: 26, // Slightly larger for impact
//     fontWeight: 'bold',
//     color: colors.onboardingTitleText, // Using new color
//     textAlign: 'center',
//     marginBottom: 18,
//     fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-condensed-bold',
//     lineHeight: 34,
//   },
//   description: {
//     fontSize: 16,
//     color: colors.onboardingDescriptionText, // Using new color
//     textAlign: 'center',
//     lineHeight: 24,
//     paddingHorizontal: 15, // Keep description from being too wide
//     fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'sans-serif',
//     marginBottom: 30,
//   },
//   footerControls: {
//     paddingHorizontal: 30,
//     paddingBottom: Platform.OS === 'ios' ? 40 : 30, // More bottom padding
//     paddingTop: 15,
//     alignItems: 'center', // Center button if it's not full width

//     marginBottom: 62,
//   },
//   paginationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 30, // More space between dots and button
//   },
//   paginationDot: {
//     width: 9, // Slightly larger dots
//     height: 9,
//     borderRadius: 5,
//     marginHorizontal: 5,
//   },
//   button: {
//     backgroundColor: colors.onboardingButtonBackground,
//     paddingVertical: 16,
//     paddingHorizontal: 20, // Ensure text fits
//     borderRadius: 30, // Fully rounded ends
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '90%', // Make button slightly less than full width for better aesthetics
//     minHeight: 50, // Ensure consistent button height
//     shadowColor: colors.primary, // Shadow color matching button for a subtle glow
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 8, // Android shadow
//   },
//   buttonText: {
//     color: colors.onboardingButtonText,
//     fontSize: 17,
//     fontWeight: '600',
//     fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Medium' : 'sans-serif-medium',
//   },
//    linkText: {
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

// export default AnimatedOnboardingScreen;
// GaraadApp/screens/AnimatedOnboardingScreen.tsx
import React, { useState, useRef, useEffect } from 'react'; // Added useEffect
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  FlatList,
  ViewToken,
  Text,
  StatusBar as ReactNativeStatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import colors from '../constants/colors';
import { onboardingSlidesData, OnboardingSlide, OnboardingIconConfig } from '../constants/OnboardingData';
import IconRenderer from '../components/AnimatedIcon'; // Your STATIC icon component
import AnimatedText from '../components/AnimatedText';   // Your STATIC text component
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; // For sun/moon icons
import { isDayTime } from '../utils/timeUtils'; // Import the utility function
// import { View, Text, StyleSheet, SafeAreaView, Platform, StatusBar as ReactNativeStatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

type AnimatedOnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'AnimatedOnboarding'>;

interface Props {
  navigation: AnimatedOnboardingScreenNavigationProp;
}

const AnimatedOnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [backgroundTimeIcon, setBackgroundTimeIcon] = useState<'sunny-outline' | 'moon-outline'>('sunny-outline'); // Default to sun

  useEffect(() => {
    setBackgroundTimeIcon(isDayTime() ? 'sunny-outline' : 'moon-outline');
  }, []); // Empty dependency array, so it runs once on mount

  // ... (onViewableItemsChanged, viewabilityConfig, handleNextOrGetStarted, renderItem logic remains the same)
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null && viewableItems[0].index !== undefined) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleNextOrGetStarted = () => {
    if (currentIndex < onboardingSlidesData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('OnboardingQuestionnaire');
    }
  };

  const renderItem = ({ item, index: itemIndex }: { item: OnboardingSlide, index: number }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>
        {/* Foreground Icons */}
        {item.icons.map((iconConfig: OnboardingIconConfig, iconIdx: number) => (
          <View
            key={`${item.id}-icon-${iconIdx}`}
            style={[
              iconConfig.style,
              iconConfig.shadowColor ? {
                shadowColor: iconConfig.shadowColor,
                shadowOffset: iconConfig.shadowOffset || { width: 0, height: 2 },
                shadowRadius: iconConfig.shadowRadius || 5,
                shadowOpacity: iconConfig.shadowOpacity || 0.15,
                elevation: Platform.OS === 'android' ? (iconConfig.shadowRadius || 5) / 1.5 : undefined,
              } : {}
            ]}
          >
            <IconRenderer
              name={iconConfig.name}
              type={iconConfig.type as any}
              size={iconConfig.size}
              color={iconConfig.color}
            />
          </View>
        ))}
      </View>
      <View style={styles.textContentContainer}>
        <AnimatedText
          text={item.title}
          isActive={itemIndex === currentIndex}
          customStyle={styles.title}
          delay={100} // Assuming AnimatedText still uses these if it's not fully static
        />
        {item.description && (
          <AnimatedText
            text={item.description}
            isActive={itemIndex === currentIndex}
            customStyle={styles.description}
            delay={250} // Assuming AnimatedText still uses these
          />
        )}
      </View>
    </View>
  );


  return (
    <View style={styles.fullScreenContainer}>
      {Platform.OS === 'android' && (
        <View style={{ height: ReactNativeStatusBar.currentHeight, backgroundColor: colors.onboardingBackground }} />
      )}
      <ExpoStatusBar style="dark" translucent={Platform.OS === 'android'} backgroundColor="transparent" />

      {/* Background Sun/Moon Icon */}
      <Ionicons
        name={backgroundTimeIcon}
        size={width * 0.8} // Large icon
        color={isDayTime() ? colors.onboardingIconAccent3 : colors.onboardingIconSubtle} // Example colors
        style={styles.backgroundTimeIconStyle}
      />

      <SafeAreaView style={styles.safeAreaContent}>
        <FlatList
          ref={flatListRef}
          data={onboardingSlidesData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
          style={styles.flatList}
        />

        <View style={styles.footerControls}>
          <View style={styles.paginationContainer}>
            {onboardingSlidesData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: index === currentIndex ? colors.onboardingPaginationDotActive : colors.onboardingPaginationDotInactive },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNextOrGetStarted}>
            <Text style={styles.buttonText}>
              {currentIndex < onboardingSlidesData.length - 1 ? 'Soco' : 'Bilow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Horey uga diiwaangashan tahay? <Text style={styles.link}>Soo gal</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: colors.onboardingBackground, // WHITE BACKGROUND
    position: 'relative', // Needed for absolute positioning of background icon
  },
  safeAreaContent: {
    flex: 1,
    zIndex: 1, // Ensure content is above the background icon
  },
  backgroundTimeIconStyle: {
    position: 'absolute',
    top: -height * 0.1, // Adjust positioning as desired
    right: -width * 0.2, // Adjust positioning as desired
    opacity: 0.07, // Make it very subtle
    transform: [{ rotate: '5deg' }], // Optional rotation
    zIndex: 0, // Behind all other content
     width: '50%',
        height: '100%',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: width,
    height: '100%', // Slide content takes full height of FlatList
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    // backgroundColor: 'rgba(0,255,0,0.1)', // For debugging slide bounds
  },
  illustrationContainer: {
    width: '100%',
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // To contain absolutely positioned icons
    marginBottom: 30, // Reduced space if text is centered more
     // Shadow styles from your previous version for illustration container
    backgroundColor: '#FFFFFF', // Give it a background if desired or keep transparent
    borderRadius: 100, // Rounded corners if it has a background
    shadowColor: colors.defaultIconShadowColor, // Use a subtle shadow
    shadowOffset: { width: 10, height: 4 },
    shadowOpacity: 1.3,
    shadowRadius: 58,
    elevation: 55, // For Android
  },
  textContentContainer: {
    width: '100%',
    alignItems: 'center',
    // paddingBottom: 20, // Removed to let footerControls manage bottom space
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.onboardingTitleText,
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-condensed-bold',
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: colors.onboardingDescriptionText,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 15,
    // marginBottom: 30, // Removed to let footerControls manage bottom space
  },
  footerControls: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 35 : 25, // Adjusted padding
    paddingTop: 15,
    alignItems: 'center',
    width: '100%',
    // Removed marginBottom, as it's the last element in SafeAreaView
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25, // Space between dots and button
  },
  paginationDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: colors.onboardingButtonBackground,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    minHeight: 50,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 15, // Space between button and login link
  },
  buttonText: {
    color: colors.onboardingButtonText,
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Medium' : 'sans-serif-medium',
  },
   linkText: {
    // marginTop: 20, // Removed as button now has marginBottom
    color: colors.text,
    textAlign: 'center',
    fontSize: 14,
     marginBottom: 75, 
  },
  link: {
    color: colors.link,
    fontWeight: 'bold',
  },
});

export default AnimatedOnboardingScreen;