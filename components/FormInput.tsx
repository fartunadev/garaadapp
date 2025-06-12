// // GaraadApp/components/FormInput.tsx
// import React from 'react';
// import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
// import colors from '../constants/colors';

// interface FormInputProps extends TextInputProps {
//   label?: string;
//   error?: string;
//   touched?: boolean;
// }

// const FormInput: React.FC<FormInputProps> = ({ label, error, touched, ...props }) => {
//   return (
//     <View style={styles.container}>
//       {label && <Text style={styles.label}>{label}</Text>}
//       <TextInput
//         style={[styles.input, touched && error ? styles.inputError : null]}
//         placeholderTextColor={colors.darkGrey}
//         {...props}
//       />
//       {touched && error && <Text style={styles.errorText}>{error}</Text>}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 15,
//     width: '100%',
//   },
//   label: {
//     marginBottom: 5,
//     fontSize: 14,
//     color: colors.text,
//     fontWeight: '500',
//   },
//   input: {
//     backgroundColor: colors.lightGrey,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     borderRadius: 8,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: colors.grey,
//     color: colors.text,
//   },
//   inputError: {
//     borderColor: colors.error,
//   },
//   errorText: {
//     marginTop: 4,
//     fontSize: 12,
//     color: colors.error,
//   },
// });

// export default FormInput;
// GaraadApp/components/FormInput.tsx
import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Platform } from 'react-native';
import colors from '../constants/colors'; // Adjust path if needed

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string | null; // Allow error to be null
  touched?: boolean;
  containerStyle?: object;
  labelStyle?: object;
  inputStyle?: object;
  errorTextStyle?: object;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  touched,
  containerStyle,
  labelStyle,
  inputStyle,
  errorTextStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          Platform.OS === 'ios' && styles.inputIOS, // Specific padding for iOS if needed
          touched && error ? styles.inputError : null,
          inputStyle,
        ]}
        placeholderTextColor={colors.darkGrey} // Use a color from your theme
        {...props}
      />
      {touched && error && <Text style={[styles.errorText, errorTextStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    color: colors.text, // Use a color from your theme
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.lightGrey, // Use a color from your theme
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.grey, // Use a color from your theme
    color: colors.text,
  },
  inputIOS: { // Example iOS specific padding
    paddingVertical: 14,
  },
  inputError: {
    borderColor: colors.error, // Use a color from your theme
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: colors.error,
  },
});

export default FormInput;