
// Service to handle local storage operations for application settings
export interface AppSettings {
  darkTheme: boolean;
  displayMode: "box" | "inline";
  showAudio: boolean;
  selectedAuthorId?: string;
}

const SETTINGS_KEY = "bibliaudio_settings";

export const SettingsService = {
  getSettings: (): AppSettings | null => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        return JSON.parse(storedSettings) as AppSettings;
      }
      return null;
    } catch (error) {
      console.error("Failed to retrieve settings from localStorage:", error);
      return null;
    }
  },

  saveSettings: (settings: AppSettings): boolean => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
      return false;
    }
  },

  clearSettings: (): void => {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error("Failed to clear settings from localStorage:", error);
    }
  }
};
