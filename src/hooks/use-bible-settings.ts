
import { useState, useEffect } from "react";
import { SettingsService, AppSettings } from "@/services/SettingsService";

export function useBibleSettings() {
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [displayMode, setDisplayMode] = useState<"box" | "inline">("inline");
  const [showAudio, setShowAudio] = useState<boolean>(true);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | undefined>(undefined);

  // Load settings from local storage on initial render
  useEffect(() => {
    const savedSettings = SettingsService.getSettings();
    if (savedSettings) {
      setDarkTheme(savedSettings.darkTheme);
      setDisplayMode(savedSettings.displayMode);
      setShowAudio(savedSettings.showAudio);
      setSelectedAuthorId(savedSettings.selectedAuthorId);
    }
  }, []);

  // Save settings to local storage whenever they change
  useEffect(() => {
    SettingsService.saveSettings({
      darkTheme,
      displayMode,
      showAudio,
      selectedAuthorId
    });
  }, [darkTheme, displayMode, showAudio, selectedAuthorId]);

  // Apply dark theme
  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkTheme]);

  const toggleAdminSettings = () => {
    setShowAdminSettings(!showAdminSettings);
  };

  const toggleConfig = () => {
    setShowConfig(!showConfig);
  };

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };

  return {
    showAdminSettings,
    displayMode,
    showAudio,
    showConfig,
    darkTheme,
    selectedAuthorId,
    setSelectedAuthorId,
    toggleAdminSettings,
    toggleConfig,
    toggleTheme,
    setDisplayMode,
    setShowAudio
  };
}
