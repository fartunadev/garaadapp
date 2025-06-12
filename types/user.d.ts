// types/user.ts
export interface UserProfile {
  name: string;
  email: string;
  onboarding_data: {
    goal: string;
    learning_approach: string;
    topic: string;
    math_level: string;
    minutes_per_day: number;
  };
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
}
