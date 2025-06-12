// // GaraadApp/types/auth.d.ts

// // Data structure for social media links within a user's profile
// export interface SocialLinks {
//   twitter?: string | null;
//   linkedin?: string | null;
//   github?: string | null;
//   facebook?: string | null;
//   // Add other platforms as needed
// }

// // Data structure representing the user's profile information
// // This should match what your backend API returns for profile details
// export interface UserProfileData {
//   bio?: string | null;
//   avatar?: string | null;         // URL to the avatar image
//   location?: string | null;
//   website?: string | null;
//   social_links?: SocialLinks;   // Matches common backend snake_case, adjust if your API uses camelCase

//   // UI-specific or engagement stats, verify if these come from backend profile
//   is_verified?: boolean;
//   progress_percentage?: number;
//   lessons_completed?: number;
//   points?: number;
//   streak_days?: number;
//   current_league?: string;
//   league_rank?: number;          // Can be number or null if not ranked
//   points_to_next_league?: number;
// }

// // Main User object structure
// // This should match the user object returned by your API (e.g., from /api/users/me/ or in AuthResponse)
// export interface User {
//   id: string | number; // API might use string (UUID) or number
//   email: string;
//   username: string;      // This is often the @handle, should be unique

//   name?: string;          // Full name if backend sends it combined
//   first_name?: string;    // If backend sends first name separately
//   last_name?: string;     // If backend sends last name separately

//   date_joined?: string;   // ISO date string
//   is_active?: boolean;
//   is_staff?: boolean;
//   is_superuser?: boolean;
//   last_login?: string | null; // ISO date string or null

//   // Profile data. Assumes it's nested under a 'profile' key in the User object from API.
//   // If profile fields are at the root of the User object from API, move UserProfileData fields here directly.
//   profile?: UserProfileData;
// }

// // Data structure for the payload when a user signs in
// export type LoginData = {
//   email: string;
//   password: string;
// };

// // Data collected from the multi-step onboarding questionnaire
// export interface OnboardingQuestionnaireData {
//   goal?: string;
//   learning_approach?: string;
//   topic?: string;
//   level?: string;
//   level_context?: 'math' | 'programming' | 'general';
//   minutes_per_day?: number;
//   preferred_learning_time?: string;
//   [key: string]: any; // For any other dynamic onboarding data
// }

// // Data structure for the payload sent to the signup API endpoint
// export type SignUpDataAPI = {
//   email: string;
//   password: string;
//   name: string; // Backend will likely map this to first_name, last_name, or a 'name' field
//   age: number;
//   onboarding_data: OnboardingQuestionnaireData; // Data from the questionnaire
//   profile?: UserProfileData; // Optional profile details to send during signup
// };

// // Structure of the response received from successful login or signup
// export interface AuthResponse {
//   user: User; // The complete User object, including profile information
//   tokens: {
//     refresh: string;
//     access: string;
//   };
// }
// GaraadApp/types/auth.d.ts

export interface SocialLinks {
  twitter?: string | null;
  linkedin?: string | null;
  github?: string | null;
  facebook?: string | null;
}

export interface UserProfileData {
  bio?: string | null;
  avatar?: string | null;
  location?: string | null;
  website?: string | null;
  social_links?: SocialLinks; // Assuming snake_case from backend

  // Stats - verify if these are part of 'profile' or root 'user' from API
  is_verified?: boolean;
  progress_percentage?: number;
  lessons_completed?: number;
  points?: number;
  streak_days?: number;
  current_league?: string;
  league_rank?: number;
  points_to_next_league?: number;
}

export interface User {
  id: number; // From your API log
  email: string;
  first_name: string;
  last_name: string | null;
  username: string;
  has_completed_onboarding: boolean; // From your API log
  is_premium: boolean;              // From your API log
  is_superuser: boolean;            // From your API log

  // Optional fields that might not be in every API response for user
  name?: string; // Client-side derived or if API sends it
  date_joined?: string;
  is_active?: boolean;
  is_staff?: boolean;
  last_login?: string | null;

  // If your dedicated profile endpoint (e.g., /api/users/me/) returns profile data nested like this:
  profile?: UserProfileData;
  // If not, and profile fields are at the root of the /users/me/ response, add them here directly.
}

// This is the structure of the 'onboarding' object within AuthResponse
export interface OnboardingAPIResponseData {
  goal: string;
  has_completed_onboarding: boolean;
  learning_approach: string;
  math_level: string; // Or 'level'
  minutes_per_day: number;
  preferred_study_time: string; // Or 'preferred_learning_time'
  topic: string;
}

// Structure for Login/Signup API response (MUST MATCH YOUR LOGS)
export interface AuthResponse {
  message?: string; // For signup
  user: User;
  tokens: {
    refresh: string;
    access: string;
  };
  onboarding: OnboardingAPIResponseData; // Present in both login and signup responses from your logs
}

// --- Payloads ---
export type LoginData = {
  email: string;
  password: string;
};

// Data collected from the multi-step questionnaire for the signup payload
export interface OnboardingQuestionnaireData {
  goal?: string;
  learning_approach?: string;
  topic?: string;
  level?: string;
  level_context?: 'math' | 'programming' | 'general';
  minutes_per_day?: number;
  preferred_learning_time?: string;
  [key: string]: any;
}

// Data sent TO the backend during signup
export type SignUpDataAPI = {
  email: string;
  password: string;
  name: string; // Corresponds to first_name on backend based on your logs
  age: number; // Assuming backend expects age
  onboarding_data: OnboardingQuestionnaireData;
  profile?: Partial<UserProfileData>; // Optional profile data to send during signup
                                     // Using Partial if not all fields are sent initially
};