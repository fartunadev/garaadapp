// GaraadApp/screens/OnboardingQuestionnaireScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet, // Import StyleSheet
  TouchableOpacity,
  SafeAreaView, // Import SafeAreaView
  ScrollView,   // Import ScrollView
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, OnboardingData } from '../navigation/AuthStack'; // Make sure OnboardingData is exported from AuthStack.tsx
import colors from '../constants/colors';
import {
  questionnaireSteps, // Import questionnaireSteps
  QuestionnaireStep,
  QuestionnaireOption,
  IconSet,
  // IconName, // IconName might not be directly used here if IconComponents handles it
  getLevelOptions
} from '../constants/QuestionnaireData';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

const { width } = Dimensions.get('window');

// Define IconComponentType and IconComponents map
type IconComponentType = typeof FontAwesome5 | typeof MaterialCommunityIcons | typeof Ionicons;

const IconComponents: Record<IconSet, IconComponentType> = {
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
};

// Define Props for the screen
type QuestionnaireScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'OnboardingQuestionnaire'>;

interface Props {
  navigation: QuestionnaireScreenNavigationProp;
}

const OnboardingQuestionnaireScreen: React.FC<Props> = ({ navigation }) => {
  // Define state variables
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Partial<OnboardingData>>({});
  const [currentSteps, setCurrentSteps] = useState<QuestionnaireStep[]>(questionnaireSteps); // Initialize with imported steps

  useEffect(() => {
    const updatedSteps = questionnaireSteps.map(step => {
      if (step.id === 'level_step' && step.isDynamic && step.dynamicOptionSourceKey) {
        const sourceValue = selections[step.dynamicOptionSourceKey] as string | undefined;
        return { ...step, options: getLevelOptions(sourceValue) };
      }
      return step;
    });
    setCurrentSteps(updatedSteps);
  }, [selections]); // Removed currentStepIndex as it might cause infinite loops if not handled carefully with dynamic steps

  const currentStepData = currentSteps[currentStepIndex];

  const handleSelectOption = (optionValue: string | number, dataKey: keyof OnboardingData) => { // Removed levelContext for now, can be added back if needed
    setSelections(prev => {
        const newSelections: Partial<OnboardingData> = {...prev, [dataKey]: optionValue};
        if (dataKey === 'topic') {
            let levelContextValue: 'math' | 'programming' | 'general' = 'general';
            if (optionValue === 'math') levelContextValue = 'math';
            else if (optionValue === 'programming') levelContextValue = 'programming';
            newSelections.level_context = levelContextValue;
            delete newSelections.level; // Reset level if topic changes
        }
        // If you need to pass levelContext for the 'level' dataKey:
        // if (dataKey === 'level' && prev.level_context) {
        //     newSelections.level_context = prev.level_context;
        // }
        return newSelections;
    });
  };

  const handleNext = () => {
    if (currentStepIndex < currentSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      navigation.navigate('Signup', { onboardingData: selections as OnboardingData });
    }
  };

  const renderOption = (option: QuestionnaireOption, step: QuestionnaireStep) => {
    const isSelected = selections[step.dataKey] === option.value;
    const Icon = option.iconSet ? IconComponents[option.iconSet] : null;

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionButton,
          isSelected && styles.selectedOptionButton,
          option.subtext && styles.complexOptionButton
        ]}
        onPress={() => handleSelectOption(option.value, step.dataKey)}
      >
        {option.tag && isSelected && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{option.tag}</Text>
          </View>
        )}
        <View style={styles.optionContent}>
          {Icon && (
             <View style={[styles.iconWrapper, isSelected && styles.selectedIconWrapper]}>
                <Icon
                    name={option.iconName as any} // Type assertion for icon name
                    size={option.subtext ? 22 : 24}
                    color={isSelected ? colors.questionnaireSelectedIconColor : colors.questionnaireUnselectedIconColor}
                />
            </View>
          )}
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionText, isSelected && styles.selectedOptionText, option.subtext && styles.complexOptionText]}>
              {option.text}
            </Text>
            {option.subtext && <Text style={styles.optionSubtext}>{option.subtext}</Text>}
          </View>
        </View>
        {option.example && isSelected && (
            <View style={styles.exampleContainer}>
                <Text style={styles.exampleText}>{option.example}</Text>
            </View>
        )}
      </TouchableOpacity>
    );
  };


  // This is the part of your snippet:
  if (!currentStepData) {
    return <View style={styles.container}><Text>Loading questionnaire...</Text></View>;
  }

  const progress = (currentStepIndex + 1) / currentSteps.length;
  const isNextDisabled = selections[currentStepData.dataKey] === undefined;

  let questionDisplayTitle = currentStepData.question;
  if (currentStepData.id === 'level_step' && currentStepData.questionTitleContext) {
    const selectedTopicValue = selections[currentStepData.dynamicOptionSourceKey!] as string | undefined; // Added non-null assertion for dynamicOptionSourceKey
    let topicName = '';

    // Find the text of the selected topic from the 'topic_step' options
    const topicStep = questionnaireSteps.find(step => step.id === 'topic_step');
    if (topicStep && selectedTopicValue) {
        const topicOption = topicStep.options.find(opt => opt.value === selectedTopicValue);
        topicName = topicOption ? topicOption.text : '';
    }

    if (topicName) {
      questionDisplayTitle = `${currentStepData.questionTitleContext} ${topicName}`;
    }
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.progressBarContainer}>
        <Progress.Bar
            progress={progress}
            width={width - 40}
            height={8}
            color={colors.questionnaireProgressBar}
            unfilledColor={colors.grey}
            borderColor={colors.grey}
            borderRadius={4}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.questionText}>{questionDisplayTitle}</Text>
          <View style={styles.optionsContainer}>
            {currentStepData.options.map((opt: QuestionnaireOption) => renderOption(opt, currentStepData))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, isNextDisabled && styles.disabledButton]}
          onPress={handleNext}
          disabled={isNextDisabled}
        >
          <Text style={styles.nextButtonText}>Sii wad</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ // StyleSheet.create should work now
  safeArea: {
    flex: 1,
    backgroundColor: colors.questionnaireBackground,
  },
  progressBarContainer: {
    marginTop: 55,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  scrollContainer: {
    
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    // alignItems: 'center', // Can remove if options take full width
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.questionnaireQuestionText,
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: colors.questionnaireCardBackground,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.questionnaireOptionBorder,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOptionButton: {
    borderColor: colors.questionnaireSelectedOptionBorder,
    backgroundColor: '#FAF5FF',
  },
  complexOptionButton: {
    paddingVertical: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
    marginRight: 15,
  },
  selectedIconWrapper: {
    backgroundColor: colors.questionnaireSelectedIconBackground,
  },
  optionTextContainer: {
    flex: 1, // Allow text to take remaining space
  },
  optionText: {
    fontSize: 16,
    color: colors.questionnaireText,
    fontWeight: '500',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  complexOptionText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 13,
    color: colors.lightText,
    marginTop: 4,
  },
  tagContainer: {
    position: 'absolute',
    top: -12, // Adjust for better positioning
    left: '50%',
    transform: [{ translateX: -(width * 0.2) }], // Approximation, may need adjustment
    backgroundColor: colors.questionnaireTagBackground,
    paddingHorizontal: 10, // Slightly reduced padding
    paddingVertical: 3,  // Slightly reduced padding
    borderRadius: 8,    // Slightly reduced radius
    alignSelf: 'center',
    zIndex: 1,
    elevation: 3,
    minWidth: width * 0.35, // Ensure it's wide enough but not excessively
    maxWidth: width * 0.5,
  },
  tagText: {
    fontSize: 10, // Smaller tag text
    color: colors.questionnaireTagText,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exampleContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.lightGrey,
    borderRadius: 8,
  },
  exampleText: {
      fontSize: 13,
      color: colors.darkGrey,
      fontStyle: 'italic',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
    backgroundColor: '#ffff', // Match overall screen background
  },
  nextButton: {
    backgroundColor: colors.questionnaireButtonActive,
       paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: colors.questionnaireButtonInactive,
  },
  nextButtonText: {
    color: colors.questionnaireButtonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingQuestionnaireScreen;