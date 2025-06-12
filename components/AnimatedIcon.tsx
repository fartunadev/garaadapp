// // Assuming this is your static icon component (previously AnimatedIcon.tsx)
// import React from 'react';
// import { View } from 'react-native';
// import { OnboardingIconConfig } from '../constants/OnboardingData';
// import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
// import { ComponentType } from 'react';

// type IconComponentType = ComponentType<any>;
// const IconComponentMap: Record<OnboardingIconConfig['type'], IconComponentType> = {
//   FontAwesome5,
//   MaterialCommunityIcons,
//   Ionicons,
// };

// interface StaticIconProps extends Omit<OnboardingIconConfig, 'animationType' | 'animationDelay'> {
//   isActive: boolean;
// }

// const StaticIcon: React.FC<StaticIconProps> = ({
//   name,
//   type,
//   size,
//   color,
//   style,
//   isActive,
// }) => {
//   if (!isActive) {
//     return null; // This is GOOD - returns null, not a string
//   }

//   const Icon = IconComponentMap[type];
//   if (!Icon) return null; // Also GOOD

//   return (
//     <View style={style}>
//       <Icon name={name as any} size={size} color={color} />
//     </View>
//   );
// };

// export default StaticIcon;
// // Assuming this is your static icon component (previously AnimatedIcon.tsx)
// import React from 'react';
// import { View } from 'react-native';
// import { OnboardingIconConfig } from '../constants/OnboardingData';
// import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
// import { ComponentType } from 'react';

// type IconComponentType = ComponentType<any>;
// const IconComponentMap: Record<OnboardingIconConfig['type'], IconComponentType> = {
//   FontAwesome5,
//   MaterialCommunityIcons,
//   Ionicons,
// };

// interface StaticIconProps extends Omit<OnboardingIconConfig, 'animationType' | 'animationDelay'> {
//   isActive: boolean;
// }

// const StaticIcon: React.FC<StaticIconProps> = ({
//   name,
//   type,
//   size,
//   color,
//   style,
//   isActive,
// }) => {
//   if (!isActive) {
//     return null; // This is GOOD - returns null, not a string
//   }

//   const Icon = IconComponentMap[type];
//   if (!Icon) return null; // Also GOOD

//   return (
//     <View style={style}>
//       <Icon name={name as any} size={size} color={color} />
//     </View>
//   );
// };

// export default StaticIcon;
// GaraadApp/components/IconRenderer.tsx
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  Entypo,
  Feather,
  AntDesign,
  Octicons,
  SimpleLineIcons,
  Foundation,
  EvilIcons,
} from '@expo/vector-icons';

export type IconType =
  | 'Ionicons'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'MaterialIcons'
  | 'MaterialCommunityIcons'
  | 'Entypo'
  | 'Feather'
  | 'AntDesign'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Foundation'
  | 'EvilIcons';

interface IconRendererProps {
  type: IconType;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const IconRenderer: React.FC<IconRendererProps> = ({ type, name, size = 24, color = 'black', style }) => {
  switch (type) {
    case 'Ionicons':
      return <Ionicons name={name as any} size={size} color={color} style={style} />;
    case 'FontAwesome':
      return <FontAwesome name={name as any} size={size} color={color} style={style} />;
    case 'FontAwesome5':
      return <FontAwesome5 name={name as any} size={size} color={color} style={style} />;
    case 'MaterialIcons':
      return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={name as any} size={size} color={color} style={style} />;
    case 'Entypo':
      return <Entypo name={name as any} size={size} color={color} style={style} />;
    case 'Feather':
      return <Feather name={name as any} size={size} color={color} style={style} />;
    case 'AntDesign':
      return <AntDesign name={name as any} size={size} color={color} style={style} />;
    case 'Octicons':
        return <Octicons name={name as any} size={size} color={color} style={style} />;
    case 'SimpleLineIcons':
        return <SimpleLineIcons name={name as any} size={size} color={color} style={style} />;
    case 'Foundation':
        return <Foundation name={name as any} size={size} color={color} style={style} />;
    case 'EvilIcons':
        return <EvilIcons name={name as any} size={size} color={color} style={style} />;
    default:
      console.warn(`Icon type "${type}" is not supported.`);
      return null;
  }
};

export default IconRenderer;
