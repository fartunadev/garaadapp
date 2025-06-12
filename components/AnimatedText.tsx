// // GaraadApp/components/AnimatedText.tsx
// import React from 'react';
// import { Text, TextProps, StyleProp, TextStyle } from 'react-native'; // Removed Animated, Easing, useEffect, useRef

// // Define the props for the static text component.
// // Animation-related props (delay, animationType) are removed.
// interface StaticTextProps extends TextProps {
//   text: string;
//   isActive: boolean; // Used to control visibility based on the active slide
//   customStyle?: StyleProp<TextStyle>;
// }

// const StaticTextComponent: React.FC<StaticTextProps> = ({
//   text,
//   isActive,
//   customStyle,
//   ...rest // Passes any other standard TextProps like 'numberOfLines', etc.
// }) => {
//   // If the component is not "active" (e.g., its slide is not visible),
//   // render nothing. This maintains the behavior of appearing when the slide is active.
//   if (!isActive) {
//     return null;
//   }

//   // Render a standard React Native Text component.
//   // The 'style' prop will take the customStyle passed in.
//   // Other standard TextProps are spread onto the component.
//   return (
//     <Text
//       {...rest}
//       style={customStyle}
//     >
//       {text}
//     </Text>
//   );
// };

// export default StaticTextComponent;



// // GaraadApp/components/AnimatedText.tsx
// import React from 'react';
// import { Text, TextProps, StyleProp, TextStyle } from 'react-native'; // Removed Animated, Easing, useEffect, useRef

// // Define the props for the static text component.
// // Animation-related props (delay, animationType) are removed.
// interface StaticTextProps extends TextProps {
//   text: string;
//   isActive: boolean; // Used to control visibility based on the active slide
//   customStyle?: StyleProp<TextStyle>;
// }

// const StaticTextComponent: React.FC<StaticTextProps> = ({
//   text,
//   isActive,
//   customStyle,
//   ...rest // Passes any other standard TextProps like 'numberOfLines', etc.
// }) => {
//   // If the component is not "active" (e.g., its slide is not visible),
//   // render nothing. This maintains the behavior of appearing when the slide is active.
//   if (!isActive) {
//     return null;
//   }

//   // Render a standard React Native Text component.
//   // The 'style' prop will take the customStyle passed in.
//   // Other standard TextProps are spread onto the component.
//   return (
//     <Text
//       {...rest}
//       style={customStyle}
//     >
//       {text}
//     </Text>
//   );
// };

// export default StaticTextComponent;

// GaraadApp/components/AnimatedText.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, TextProps, StyleProp, TextStyle } from 'react-native';

interface AnimatedTextProps extends TextProps {
  text: string;
  isActive: boolean;
  duration?: number;
  delay?: number;
  customStyle?: StyleProp<TextStyle>;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  isActive,
  duration = 500,
  delay = 0,
  customStyle,
  ...rest
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isActive ? 1 : 0,
      duration: duration,
      delay: isActive ? delay : 0, // Apply delay only when becoming active
      useNativeDriver: true,
    }).start();
  }, [isActive, opacityAnim, duration, delay]);

  return (
    <Animated.Text style={[customStyle, { opacity: opacityAnim }]} {...rest}>
      {text}
    </Animated.Text>
  );
};

export default AnimatedText;