// // // GaraadApp/screens/AnimatedOnboardingScreen.tsx
// // import React, { useState, useRef } from 'react';
// // import {
// //   View,
// //   StyleSheet,
// //   TouchableOpacity,
// //   SafeAreaView,
// //   Dimensions,
// //   Platform,
// //   FlatList,
// //   ViewToken,
// //   Text,
// // } from 'react-native';
// // import { StackNavigationProp } from '@react-navigation/stack';
// // import { AuthStackParamList } from '../navigation/AuthStack';
// // import colors from '../constants/colors';
// // import { onboardingSlidesData, OnboardingSlide, OnboardingIconConfig } from '../constants/OnboardingData';
// // import { LinearGradient } from 'expo-linear-gradient';

// // // Assuming your static components are exported as default from these files
// // // If you named them StaticIcon and StaticTextComponent in their files:
// // import StaticIcon from '../components/AnimatedIcon'; // Or the actual path to your static icon component
// // import StaticTextComponent from '../components/AnimatedText'; // Or the actual path to your static text component

// // const { width, height } = Dimensions.get('window');

// // type AnimatedOnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'AnimatedOnboarding'>;

// // interface Props {
// //   navigation: AnimatedOnboardingScreenNavigationProp;
// // }

// // const AnimatedOnboardingScreen: React.FC<Props> = ({ navigation }) => {
// //   const [currentIndex, setCurrentIndex] = useState(0);
// //   const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

// //   const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
// //     if (viewableItems.length > 0 && viewableItems[0].index !== null && viewableItems[0].index !== undefined) {
// //       setCurrentIndex(viewableItems[0].index);
// //     }
// //   }).current;

// //   const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

// //   const handleNext = () => {
// //     if (currentIndex < onboardingSlidesData.length - 1) {
// //       flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
// //     }
// //   };

// //   const renderItem = ({ item, index: itemIndex }: { item: OnboardingSlide, index: number }) => (
// //     <View style={styles.slide}>
// //       <View style={styles.iconsContainer}>
// //         {item.icons.map((iconConfig: OnboardingIconConfig, iconIdx: number) => (
// //           // Use the static icon component
// //           <StaticIcon
// //             key={`${item.id}-icon-${iconIdx}`}
// //             // Pass only the props relevant to a static icon
// //             name={iconConfig.name}
// //             type={iconConfig.type}
// //             size={iconConfig.size}
// //             color={iconConfig.color}
// //             style={iconConfig.style}
// //             isActive={itemIndex === currentIndex}
// //             // animationType and animationDelay from iconConfig are no longer needed here
// //             // if StaticIcon doesn't accept them.
// //           />
// //         ))}
// //       </View>
// //       <View style={styles.textContainer}>
// //         {/* Use the static text component */}
// //         <StaticTextComponent
// //           text={item.title}
// //           isActive={itemIndex === currentIndex}
// //           customStyle={styles.title}
// //           // animationType="zoomIn" // Remove animation-specific props
// //           // delay={100}             // Remove animation-specific props
// //         />
// //         <StaticTextComponent
// //           text={item.description}
// //           isActive={itemIndex === currentIndex}
// //           customStyle={styles.description}
// //           // animationType="fadeInUp" // Remove animation-specific props
// //           // delay={300}              // Remove animation-specific props
// //         />
// //       </View>
// //     </View>
// //   );

// //   return (
// //     <LinearGradient
// //       colors={[colors.onboardingGradientStart, colors.onboardingGradientEnd]}
// //       style={styles.gradientContainer}
// //     >
// //       <SafeAreaView style={styles.safeArea}>
// //         <View style={styles.progressBarContainer}>
// //           {onboardingSlidesData.map((_, index: number) => (
// //             <View
// //               key={index}
// //               style={[
// //                 styles.progressBarSegment,
// //                 { backgroundColor: index <= currentIndex ? colors.progressBarFill : colors.progressBarBackground },
// //               ]}
// //             />
// //           ))}
// //         </View>

// //         <FlatList
// //           ref={flatListRef}
// //           data={onboardingSlidesData}
// //           renderItem={renderItem}
// //           keyExtractor={(item) => item.id.toString()}
// //           horizontal
// //           pagingEnabled
// //           showsHorizontalScrollIndicator={false}
// //           onViewableItemsChanged={onViewableItemsChanged}
// //           viewabilityConfig={viewabilityConfig}
// //           scrollEventThrottle={16}
// //         />

// //         <View style={styles.footer}>
// //           {currentIndex < onboardingSlidesData.length - 1 ? (
// //             <TouchableOpacity style={styles.button} onPress={handleNext}>
// //               <Text style={styles.buttonText}>Next</Text>
// //             </TouchableOpacity>
// //           ) : (
// //             <>
// //               <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OnboardingQuestionnaire', undefined)}>
// //                 <Text style={styles.buttonText}>Get Started</Text>
// //               </TouchableOpacity>
// //             </>
// //           )}
// //         </View>
// //       </SafeAreaView>
// //     </LinearGradient>
// //   );
// // };

// // // Styles remain the same as you provided
// // const styles = StyleSheet.create({
// //   gradientContainer: {
// //     flex: 1,
// //   },
// //   safeArea: {
// //     flex: 1,
// //     justifyContent: 'space-between',
// //   },
// //   progressBarContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 20,
// //     marginTop: Platform.OS === 'ios' ? 20 : 40,
// //     marginBottom: 20,
// //   },
// //   progressBarSegment: {
// //     height: 4,
// //     flex: 1,
// //     borderRadius: 2,
// //     marginHorizontal: 2,
// //   },
// //   slide: {
// //     width: width,
// //     height: height * 0.7,
// //     alignItems: 'center',
// //     justifyContent: 'flex-start',
// //     paddingHorizontal: 30,
// //   },
// //   iconsContainer: {
// //     backgroundColor:'#c77dff',
// //     marginTop: 20,
// //     width: '100%',
// //     borderRadius: 70,
// //     height: height * 0.38,
// //     position: 'relative',
// //     marginBottom: 20,
// //   },
// //   textContainer: {
// //     alignItems: 'center',
// //   },
// //   title: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     color: colors.onboardingText,
// //     textAlign: 'center',
// //     marginBottom: 15,
// //     fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-condensed-bold',
// //   },
// //   description: {
// //     fontSize: 16,
// //     color: '#c77dff', // You changed this color
// //     textAlign: 'center',
// //     lineHeight: 24,
// //     fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'sans-serif',
// //   },
// //   footer: {
// //     paddingHorizontal: 30,
// //     paddingBottom: Platform.OS === 'ios' ? 30 : 40,
// //     alignItems: 'center',
// //   },
// //   button: {
// //     backgroundColor: colors.onboardingButtonBackground,
// //     paddingVertical: 16,
// //     borderRadius: 30,
// //     alignItems: 'center',
// //     width: '100%',
// //     marginBottom: 15,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   buttonText: {
// //     color: colors.onboardingButtonText,
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //   },
// // });

// // export default AnimatedOnboardingScreen;
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
// import { AuthStackParamList } from '../navigation/AuthStack';
// import colors from '../constants/colors'; // Uses updated colors
// import { onboardingSlidesData, OnboardingSlide, OnboardingIconConfig } from '../constants/OnboardingData'; // Uses updated data
// import StaticIcon from '../components/AnimatedIcon';
// import StaticTextComponent from '../components/AnimatedText';
// import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// const { width, height } = Dimensions.get('window');

// type AnimatedOnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'AnimatedOnboarding'>;

// interface Props {
//   navigation: AnimatedOnboardingScreenNavigationProp;
// }

// const AnimatedOnboardingScreen: React.FC<Props> = ({ navigation }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

//   // ... (onViewableItemsChanged, handleNextOrGetStarted logic remains the same)
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
//       navigation.navigate('OnboardingQuestionnaire', undefined);
//     }
//   };

//   const renderItem = ({ item, index: itemIndex }: { item: OnboardingSlide, index: number }) => (
//     <View style={styles.slide}>
//       <View style={styles.illustrationContainer}>
//         {item.icons.map((iconConfig: OnboardingIconConfig, iconIdx: number) => (
//           <View
//             key={`${item.id}-icon-${iconIdx}`}
//             style={[
//               iconConfig.style,
//               iconConfig.shadowColor ? {
//                 shadowColor: iconConfig.shadowColor,
//                 shadowOffset: { width: 0, height: 0 },
//                 shadowRadius: iconConfig.shadowRadius || 8, // Slightly smaller default radius for light bg
//                 shadowOpacity: iconConfig.shadowOpacity || 0.2, // Less opacity for subtlety
//                 elevation: (iconConfig.shadowRadius || 8) / 2,
//               } : {}
//             ]}
//           >
//             <StaticIcon
//               name={iconConfig.name}
//               type={iconConfig.type}
//               size={iconConfig.size}
//               color={iconConfig.color} // Will get colors from updated OnboardingData
//               isActive={itemIndex === currentIndex}
//             />
//           </View>
//         ))}
//       </View>
//       <View style={styles.textContentContainer}>
//         <StaticTextComponent
//           text={item.title}
//           isActive={itemIndex === currentIndex}
//           customStyle={styles.title} // Style now uses dark text color
//         />
//         {item.description && (
//           <StaticTextComponent
//             text={item.description}
//             isActive={itemIndex === currentIndex}
//             customStyle={styles.description} // Style now uses dark text color
//           />
//         )}
//       </View>
//     </View>
//   );

//   return (
//     // Main container now uses the white background
//     <View style={styles.fullScreenContainer}>
//       {Platform.OS === 'android' && (
//         // This view also gets the white background for status bar area
//         <View style={{ height: ReactNativeStatusBar.currentHeight, backgroundColor: colors.lightIllustrativeBackground }} />
//       )}
//       {/* StatusBar icons should be DARK on a WHITE background */}
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
//             <View style={styles.paginationContainer}>
//             {onboardingSlidesData.map((_, index) => (
//                 <View
//                 key={index}
//                 style={[
//                     styles.paginationDot,
//                     // Pagination dot colors updated for white background
//                     { backgroundColor: index === currentIndex ? colors.lightIllustrativePaginationDotActive : colors.lightIllustrativePaginationDotInactive },
//                 ]}
//                 />
//             ))}
//             </View>

//             <TouchableOpacity style={styles.button} onPress={handleNextOrGetStarted}>
//                 {/* Button text color is white on purple button */}
//                 <Text style={styles.buttonText}>
//                     {currentIndex < onboardingSlidesData.length - 1 ? 'Next' : 'Get started'}
//                 </Text>
//             </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// };

// // Styles are updated to use the new lightIllustrative... colors
// const styles = StyleSheet.create({
//   fullScreenContainer: {
//     flex: 1,
//     backgroundColor: colors.lightIllustrativeBackground, // White background
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
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   illustrationContainer: {
//     width: '100%',
//     height: height * 0.55,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//     marginBottom: 20,
//   },
//   textContentContainer: {
//     width: '90%',
//     alignItems: 'center',
//     paddingBottom: 20,
//   },
//   title: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     color: colors.lightIllustrativeTitleText, // Dark text
//     textAlign: 'center',
//     marginBottom: 12,
//     lineHeight: 38,
//   },
//   description: {
//     fontSize: 16, // Adjusted size
//     color: colors.lightIllustrativeDescriptionText, // Darker grey text
//     textAlign: 'center',
//     lineHeight: 24, // Adjusted line height
//     opacity: 0.9,
//     paddingHorizontal: 10,
//   },
//   footerControls: {
//     paddingHorizontal: 30,
//     paddingBottom: Platform.OS === 'ios' ? 35 : 25,
//     paddingTop: 15,
//   },
//   paginationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 25,
//   },
//   paginationDot: { // Colors set dynamically
//     width: 9,
//     height: 9,
//     borderRadius: 4.5,
//     marginHorizontal: 6,
//   },
//   button: {
//     backgroundColor: colors.lightIllustrativeButtonBackground, // Purple button
//     paddingVertical: 16,
//     borderRadius: 30,
//     alignItems: 'center',
//     width: '100%',
//     shadowColor: colors.primary, // Shadow with button color
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 7,
//   },
//   buttonText: {
//     color: colors.lightIllustrativeButtonText, // White text
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default AnimatedOnboardingScreen;