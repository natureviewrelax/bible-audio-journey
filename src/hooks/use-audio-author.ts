
import { useState, useEffect } from "react";
import { AudioAuthor } from "@/types/bible";
import { AuthorService } from "@/services/AuthorService";
import { SettingsService } from "@/services/SettingsService";

interface UseAudioAuthorProps {
  initialAuthorId?: string;
}

export function useAudioAuthor({ initialAuthorId }: UseAudioAuthorProps = {}) {
  const [authors, setAuthors] = useState<AudioAuthor[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | undefined>(initialAuthorId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load authors when hook is initialized
    const loadAuthorsAndSettings = async () => {
      setIsLoading(true);
      try {
        const authorsList = await AuthorService.getAuthors();
        setAuthors(authorsList);
        
        // Get preferred author from settings
        const settings = SettingsService.getSettings();
        
        // Determine which author to select (with priority)
        // 1. Use initial author if available
        // 2. Use preferred author from settings
        // 3. Use the first author in the list
        if (initialAuthorId) {
          setSelectedAuthorId(initialAuthorId);
        } else if (settings?.selectedAuthorId) {
          // Find if the preferred author is in the list
          const authorExists = authorsList.some(author => author.id === settings.selectedAuthorId);
          if (authorExists) {
            setSelectedAuthorId(settings.selectedAuthorId);
          } else if (authorsList.length > 0) {
            setSelectedAuthorId(authorsList[0].id);
            // Update settings with the first author
            saveAuthorPreference(authorsList[0].id);
          }
        } else if (authorsList.length > 0) {
          setSelectedAuthorId(authorsList[0].id);
          // Update settings with the first author
          saveAuthorPreference(authorsList[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthorsAndSettings();
  }, [initialAuthorId]);

  // Update author preference in settings
  const saveAuthorPreference = (authorId: string) => {
    const settings = SettingsService.getSettings() || {
      darkTheme: false,
      displayMode: "inline",
      showAudio: true
    };
    
    SettingsService.saveSettings({
      ...settings,
      selectedAuthorId: authorId
    });
  };

  const handleAuthorChange = (authorId: string) => {
    setSelectedAuthorId(authorId);
    saveAuthorPreference(authorId);
  };

  return {
    authors,
    selectedAuthorId,
    setSelectedAuthorId,
    handleAuthorChange,
    isLoading
  };
}
