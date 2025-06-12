// GaraadApp/utils/timeUtils.ts
export const isDayTime = (): boolean => {
  const hours = new Date().getHours();
  // Consider daytime from 6 AM to 6 PM (adjust as needed)
  return hours >= 6 && hours < 18;
};