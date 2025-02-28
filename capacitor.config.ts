
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7db395c84e8b4852896c62249d2d4f66',
  appName: 'bible-audio-journey',
  webDir: 'dist',
  server: {
    url: 'https://7db395c8-4e8b-4852-896c-62249d2d4f66.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
