// GaraadApp/constants/QuestionnaireData.ts
import { ComponentProps } from 'react';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SignUpData } from '../types/auth';

export type IconName = ComponentProps<typeof FontAwesome5>['name'] | ComponentProps<typeof MaterialCommunityIcons>['name'] | ComponentProps<typeof Ionicons>['name'];
export type IconSet = 'FontAwesome5' | 'MaterialCommunityIcons' | 'Ionicons';

export interface QuestionnaireOption {
  id: string;
  text: string;
  value: string | number;
  iconName?: IconName;
  iconSet?: IconSet;
  tag?: string;
  subtext?: string;
  example?: string;
}

export interface QuestionnaireStep {
  id: string;
  question: string;
  options: QuestionnaireOption[];
  dataKey: keyof SignUpData['onboarding_data'];
  isDynamic?: boolean;
  dynamicOptionSourceKey?: keyof SignUpData['onboarding_data'];
  questionTitleContext?: string; // For displaying "Heerkaaga Xisaabta"
}

const programmingLevels: QuestionnaireOption[] = [
  { id: 'prog_basic', text: 'Barnaamijyada Aasaasiga ah', value: 'basic', iconSet: 'Ionicons', iconName: 'code-slash-outline', subtext: 'Isticmaalka variables, shuruudaha if, iyo loops.', example: 'Qor function dib u celinaysa string.' },
  { id: 'prog_oop', text: 'Barnaamijyada OOP', value: 'oop', iconSet: 'FontAwesome5', iconName: 'cubes', subtext: 'Abuurista classes, objects, iyo inheritance.', example: 'Samee class matalaya xisaabaad bangi oo leh deposit iyo withdraw.' },
  { id: 'prog_dsa', text: 'Qaab-dhismeedka Xogta & Algorithms', value: 'dsa', iconSet: 'FontAwesome5', iconName: 'sitemap', subtext: 'Fahamka arrays, linked lists, trees, iyo algorithms sida sorting.', example: 'Samee algorithm raadiya element array-ga ku jira.' },
];

// Updated Math Levels based on the new image
const mathLevels: QuestionnaireOption[] = [
    { id: 'math_basic_arithmetic', text: 'Xisaabta aasaasiga ah', value: 'basic_arithmetic', iconSet: 'MaterialCommunityIcons', iconName: 'calculator-variant-outline', subtext: 'Waxaan doonayaa inaan ka bilaabo aasaaska xisaabta si aan u fahmo.', example: '2,000 + 500 = ?' },
    { id: 'math_basic_algebra', text: 'Aljebrada aasaasiga ah', value: 'basic_algebra', iconSet: 'MaterialCommunityIcons', iconName: 'variable', subtext: 'Waxaan fahmi karaa isticmaalka xarfaha iyo calaamadaha xisaabta.', example: 'x + 5 = 12' },
    { id: 'math_advanced_algebra', text: 'Aljebrada sare', value: 'advanced_algebra', iconSet: 'MaterialCommunityIcons', iconName: 'chart-function', subtext: 'Waxaan si fiican u fahmi karaa xiriirka xisaabta iyo jaantuskeeda.', example: 'y = 2x + 1' },
];


export const questionnaireSteps: QuestionnaireStep[] = [
  // ... (goal_step, learning_approach_step, topic_step remain the same) ...
  {
    id: 'goal_step',
    question: 'Waa maxey hadafkaaga ugu weyn?',
    dataKey: 'goal',
    options: [
      { id: 'goal1', text: 'Horumarinta xirfadaha', value: 'skills_development', iconSet: 'FontAwesome5', iconName: 'chart-line' },
      { id: 'goal2', text: 'La socoshada cilmiga', value: 'knowledge_update', iconSet: 'Ionicons', iconName: 'earth-outline' },
      { id: 'goal3', text: 'Guul dugsiyeedka', value: 'academic_success', iconSet: 'FontAwesome5', iconName: 'book-reader' },
      { id: 'goal4', text: 'Waxbarashada ilmahayga', value: 'child_education', iconSet: 'MaterialCommunityIcons', iconName: 'human-child', tag: 'Ubadku waa mustaqbalka' },
      { id: 'goal5', text: 'Caawinta ardaydayda', value: 'student_help', iconSet: 'FontAwesome5', iconName: 'chalkboard-teacher' },
    ],
  },
  {
    id: 'learning_approach_step',
    question: 'Sidee jeceshahay inaad wax u barato?',
    dataKey: 'learning_approach',
    options: [
      { id: 'la1', text: 'Kaligaa (Self-paced)', value: 'self_paced', iconSet: 'Ionicons', iconName: 'walk-outline' },
      { id: 'la2', text: 'Hagitaan leh (Guided lessons)', value: 'guided', iconSet: 'MaterialCommunityIcons', iconName: 'directions' },
      { id: 'la3', text: 'Tartamo & caqabado (Interactive challenges)', value: 'interactive_challenges', iconSet: 'Ionicons', iconName: 'game-controller-outline' },
    ]
  },
  {
    id: 'topic_step',
    question: 'Maadada aad ugu horayn rabto inaad barato?',
    dataKey: 'topic',
    options: [
      { id: 'topic1', text: 'Xisaabta', value: 'math', iconSet: 'MaterialCommunityIcons', iconName: 'calculator-variant-outline', tag: "Xisaab iyo xikmad waa walaalo" },
      { id: 'topic2', text: 'Xogta Falanqeynta', value: 'data_analysis', iconSet: 'FontAwesome5', iconName: 'chart-pie' },
      { id: 'topic3', text: 'Saynis & Injineernimo', value: 'science_engineering', iconSet: 'Ionicons', iconName: 'flask-outline' },
      { id: 'topic4', text: 'Samaynta Barnaamijyada', value: 'programming', iconSet: 'Ionicons', iconName: 'code-slash-outline', tag: 'Dhis Barnaamijyo tayo leh' },
      { id: 'topic5', text: 'Fikirka iyo Xalinta', value: 'critical_thinking', iconSet: 'MaterialCommunityIcons', iconName: 'brain' },
      { id: 'topic6', text: 'Tijaabooyinka (puzzles)', value: 'puzzles', iconSet: 'FontAwesome5', iconName: 'puzzle-piece' },
    ],
  },
  {
    id: 'level_step',
    question: 'Heerkaaga waxbarashada?', // Main question can be simpler
    dataKey: 'level',
    isDynamic: true,
    dynamicOptionSourceKey: 'topic',
    options: [],
    questionTitleContext: "Heerkaaga", // Prefix for "Heerkaaga Xisaabta" or "Heerkaaga Barnaamijyada"
  },
  // ... (time_pref_step, minutes_step remain the same) ...
  {
    id: 'time_pref_step',
    question: 'Waqtigee kuugu habboon inaad waxbarato?',
    dataKey: 'preferred_learning_time',
    options: [
      { id: 'time1', text: 'Aroorti Subaxda inta aan quraacanayo', value: 'morning_before_breakfast', iconSet: 'Ionicons', iconName: 'sunny-outline', tag: 'هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ (الزمر: 9)'},
      { id: 'time2', text: 'Waqtiga Nasashasha intaan Khadaynayo.', value: 'lunch_break', iconSet: 'MaterialCommunityIcons', iconName: 'food-apple-outline' },
      { id: 'time3', text: 'Habeenki ah ka dib cashada ama Kahor intan seexanin', value: 'evening', iconSet: 'Ionicons', iconName: 'moon-outline', tag: 'نَّ رَبَّكَ يَعْلَمُ أَنَّكَ تَقُومُ أَدْنَىٰ مِن ثُلُثَيِ اللَّيْلِ وَنِصْفَهُ وَثُلُثَهُ (المزمل: 20)' /* Example, adjust as needed */ },
      { id: 'time4', text: 'Waqti kale oo maalintayda ah', value: 'other_daytime', iconSet: 'Ionicons', iconName: 'time-outline' },
    ],
  },
  {
    id: 'minutes_step',
    question: 'Immisa daqiiqo ayaad rabtaa inaad Wax-barato maalin walba?',
    dataKey: 'minutes_per_day',
    options: [
      { id: 'min5', text: '5 daqiiqo?', value: 5, iconSet: 'Ionicons', iconName: 'timer-outline', tag: 'Talaabo yar, guul weyn' },
      { id: 'min10', text: '10 daqiiqo?', value: 10, iconSet: 'Ionicons', iconName: 'timer-outline' },
      { id: 'min15', text: '15 daqiiqo?', value: 15, iconSet: 'Ionicons', iconName: 'timer-outline' },
      { id: 'min20', text: '20 daqiiqo?', value: 20, iconSet: 'Ionicons', iconName: 'timer-outline' },
      { id: 'min30', text: '30 daqiiqo?', value: 30, iconSet: 'Ionicons', iconName: 'timer-outline' },
    ],
  },
];

export const getLevelOptions = (topicValue?: string): QuestionnaireOption[] => {
  if (topicValue === 'programming') {
    return programmingLevels;
  }
  if (topicValue === 'math') {
    return mathLevels;
  }
  return [ // Generic fallback if needed, or could be empty if topic must match
    { id: 'level_beginner', text: 'Beginner', value: 'beginner', iconSet: 'MaterialCommunityIcons', iconName: 'signal-cellular-1' },
    { id: 'level_intermediate', text: 'Intermediate', value: 'intermediate', iconSet: 'MaterialCommunityIcons', iconName: 'signal-cellular-2' },
    { id: 'level_advanced', text: 'Advanced', value: 'advanced', iconSet: 'MaterialCommunityIcons', iconName: 'signal-cellular-3' },
  ];
};