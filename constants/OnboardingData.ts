// GaraadApp/constants/OnboardingData.ts
import { StyleProp, ViewStyle } from 'react-native';
import colors from './colors'; // Import your refined colors

export interface OnboardingIconConfig {
  name: string;
  type: 'FontAwesome5' | 'MaterialCommunityIcons' | 'Ionicons'; // Add more types if needed
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  shadowColor?: string;
  shadowRadius?: number;
  shadowOpacity?: number;
  shadowOffset?: { width: number; height: number };
}

export interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icons: OnboardingIconConfig[];
}

const defaultShadow = {
  shadowColor: colors.defaultIconShadowColor,
  shadowRadius: 8,
  shadowOpacity: 1, // Let the shadowColor's alpha handle opacity if it's rgba
  shadowOffset: { width: 0, height: 3 },
};
export const onboardingSlidesData: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Kobci Maskaxdaada.',
    description: 'Soo hel dunida aqoonta laga bilaabo aasaaska ilaa heerka sare — dhammaan gacantaada aye ku jiran.',
    icons: [
      {
        name: 'brain', type: 'FontAwesome5', size: 120, color: colors.onboardingIconPrimary,
        style: { position: 'absolute', top: '20%', alignSelf: 'center', opacity: 0.8 },
        ...defaultShadow, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }
      },
      {
        name: 'book-reader', type: 'FontAwesome5', size: 55, color: colors.onboardingIconAccent2,
        style: { position: 'absolute', top: '10%', left: '15%', transform: [{ rotate: '-20deg' }] },
        ...defaultShadow
      },
      {
        name: 'atom', type: 'FontAwesome5', size: 50, color: colors.onboardingIconAccent1,
        style: { position: 'absolute', top: '15%', right: '12%', transform: [{ rotate: '15deg' }] },
        ...defaultShadow
      },
      {
        name: 'calculator', type: 'FontAwesome5', size: 40, color: colors.onboardingIconAccent3,
        style: { position: 'absolute', top: '55%', left: '20%', transform: [{ rotate: '10deg' }] },
        ...defaultShadow
      },
      {
        name: 'school-outline', type: 'MaterialCommunityIcons', size: 45, color: colors.onboardingIconAccent2,
        style: { position: 'absolute', top: '58%', right: '18%', transform: [{ rotate: '-10deg' }] },
        ...defaultShadow
      },
    ],
  },
  {
    id: 2,
    title: 'Baro Adigoon Xadidnayn.',
    description: 'Samee dariiq waxbarasho kuu gaar ah adigoo la baranaya casharro waxtar leh  oo isdhexgal ah.',
    icons: [
      {
        name: 'laptop-code', type: 'FontAwesome5', size: 110, color: colors.onboardingIconPrimary,
        style: { position: 'absolute', top: '22%', alignSelf: 'center', opacity: 0.85 },
        ...defaultShadow, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }
      },
      {
        name: 'user-graduate', type: 'FontAwesome5', size: 50, color: colors.onboardingIconAccent1,
        style: { position: 'absolute', top: '10%', left: '12%', transform: [{ rotate: '-15deg' }] },
        ...defaultShadow
      },
      {
        name: 'lightbulb-on-outline', type: 'MaterialCommunityIcons', size: 55, color: colors.onboardingIconAccent3,
        style: { position: 'absolute', top: '12%', right: '10%', transform: [{ rotate: '20deg' }] },
        ...defaultShadow
      },
      {
        name: 'chart-line', type: 'FontAwesome5', size: 40, color: colors.onboardingIconAccent2,
        style: { position: 'absolute', top: '58%', left: '22%' },
        ...defaultShadow
      },
      {
        name: 'robot-outline', type: 'MaterialCommunityIcons', size: 45, color: colors.onboardingIconPrimary,
        style: { position: 'absolute', top: '55%', right: '20%', transform: [{ rotate: '10deg' }] },
        ...defaultShadow
      },
    ],
  },
  {
    id: 3,
    title: 'Bilow Safarkaaga.',
    description: 'Ku soo biir Garaad si aad u barato si xirfadeysan, degdeg ah, oo kalsooni leh.',
    icons: [
      {
        name: 'rocket-launch-outline', type: 'MaterialCommunityIcons', size: 120, color: colors.onboardingIconPrimary,
        style: { position: 'absolute', top: '20%', alignSelf: 'center', opacity: 0.9 },
        ...defaultShadow, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }
      },
      {
        name: 'medal-outline', type: 'Ionicons', size: 55, color: colors.onboardingIconAccent1,
        style: { position: 'absolute', top: '12%', left: '15%', transform: [{ rotate: '-15deg' }] },
        ...defaultShadow
      },
      {
        name: 'book-open-page-variant-outline', type: 'MaterialCommunityIcons', size: 50, color: colors.onboardingIconAccent2,
        style: { position: 'absolute', top: '15%', right: '12%', transform: [{ rotate: '15deg' }] },
        ...defaultShadow
      },
      {
        name: 'logo-react', type: 'Ionicons', size: 40, color: colors.onboardingIconAccent3,
        style: { position: 'absolute', top: '55%', left: '20%', transform: [{ rotate: '20deg' }] },
        ...defaultShadow
      },
      {
        name: 'code-tags', type: 'MaterialCommunityIcons', size: 40, color: colors.onboardingIconPrimary,
        style: { position: 'absolute', top: '58%', right: '18%', transform: [{ rotate: '-10deg' }] },
        ...defaultShadow
      },
    ],
  },
];

// export const onboardingSlidesData: OnboardingSlide[] = [

//   {
//     id: 1,
//     title: 'Empower Your Mind.',
//     description: 'Discover a universe of knowledge, from fundamentals to mastery, at your fingertips.',
//     icons: [
//       {
//         name: 'brain', type: 'FontAwesome5', size: 120, color: colors.onboardingIconPrimary,
//         style: { position: 'absolute', top: '20%', alignSelf: 'center', opacity: 0.8 },
//         ...defaultShadow, shadowRadius: 12, shadowOffset: {width: 0, height: 5}
//       },
//       {
//         name: 'book-reader', type: 'FontAwesome5', size: 55, color: colors.onboardingIconAccent2,
//         style: { position: 'absolute', top: '10%', left: '15%', transform: [{rotate: '-20deg'}] },
//         ...defaultShadow
//       },
//       {
//         name: 'atom', type: 'FontAwesome5', size: 50, color: colors.onboardingIconAccent1,
//         style: { position: 'absolute', top: '15%', right: '12%', transform: [{rotate: '15deg'}] },
//         ...defaultShadow
//       },
//       {
//         name: 'calculator', type: 'FontAwesome5', size: 40, color: colors.onboardingIconAccent3,
//         style: { position: 'absolute', top: '55%', left: '20%', transform: [{rotate: '10deg'}] },
//         ...defaultShadow
//       },
//       {
//         name: 'school-outline', type: 'MaterialCommunityIcons', size: 45, color: colors.onboardingIconAccent2,
//         style: { position: 'absolute', top: '58%', right: '18%', transform: [{rotate: '-10deg'}] },
//         ...defaultShadow
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: 'Learn Without Limits.',
//     description: 'Create your own path with smart, interactive lessons tailored to your unique style.',
//     icons: [
//       {
//         name: 'laptop-code', type: 'FontAwesome5', size: 110, color: colors.onboardingIconPrimary,
//         style: { position: 'absolute', top: '22%', alignSelf: 'center', opacity: 0.85 },
//         ...defaultShadow, shadowRadius: 12, shadowOffset: {width: 0, height: 5}
//       },
//       {
//         name: 'user-graduate', type: 'FontAwesome5', size: 50, color: colors.onboardingIconAccent1,
//         style: { position: 'absolute', top: '10%', left: '12%', transform: [{rotate: '-15deg'}] },
//         ...defaultShadow
//       },
//       {
//         name: 'lightbulb-on-outline', type: 'MaterialCommunityIcons', size: 55, color: colors.onboardingIconAccent3,
//         style: { position: 'absolute', top: '12%', right: '10%', transform: [{rotate: '20deg'}] },
//         ...defaultShadow
//       },
//       {
//         name: 'chart-line', type: 'FontAwesome5', size: 40, color: colors.onboardingIconAccent2,
//         style: { position: 'absolute', top: '58%', left: '22%' },
//         ...defaultShadow
//       },
//       {
//         name: 'robot-outline', type: 'MaterialCommunityIcons', size: 45, color: colors.onboardingIconPrimary,
//         style: { position: 'absolute', top: '55%', right: '20%', transform: [{rotate: '10deg'}] },
//         ...defaultShadow
//       },
//     ],
//   },
//   {
//     id: 3,
//     title: 'Begin Your Journey.',
//     description: 'Join Garaad to transform the way you learn — smarter, faster, and with confidence.',
//     icons: [
//       {
//         name: 'rocket-launch-outline', type: 'MaterialCommunityIcons', size: 120, color: colors.onboardingIconPrimary,
//         style: { position: 'absolute', top: '20%', alignSelf: 'center', opacity: 0.9 },
//         ...defaultShadow, shadowRadius: 12, shadowOffset: {width: 0, height: 5}
//       },
//       {
//         name: 'medal-outline', type: 'Ionicons', size: 55, color: colors.onboardingIconAccent1,
//         style: { position: 'absolute', top: '12%', left: '15%', transform: [{rotate: '-15deg'}] },
//         ...defaultShadow
//       },
//       {
//         name: 'book-open-page-variant-outline', type: 'MaterialCommunityIcons', size: 50, color: colors.onboardingIconAccent2,
//         style: { position: 'absolute', top: '15%', right: '12%', transform: [{rotate: '15deg'}] },
//         ...defaultShadow
//       },
//       {
//         name: 'logo-react', type: 'Ionicons', size: 40, color: colors.onboardingIconAccent3,
//         style: { position: 'absolute', top: '55%', left: '20%', transform: [{rotate: '20deg'}] },
//         ...defaultShadow
//       },
//       {
//         name: 'code-tags', type: 'MaterialCommunityIcons', size: 40, color: colors.onboardingIconPrimary, // Was python logo
//         style: { position: 'absolute', top: '58%', right: '18%', transform: [{rotate: '-10deg'}] },
//         ...defaultShadow
//       },
//     ],
//   },
// ];

// The old OnboardingDataItem and OnboardingData can be removed if no longer used elsewhere
// export interface OnboardingDataItem { ... }
// const OnboardingData: OnboardingDataItem[] = [ ... ];
// export default OnboardingData;