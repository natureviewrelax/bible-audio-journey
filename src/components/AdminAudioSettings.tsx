
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AudioService } from "@/services/AudioService";
import { BIBLE_AUDIO_BASE_URL } from "@/constants/bibleData";
import { AudioSettingsForm } from "./admin/audio-settings/AudioSettingsForm";
import { AuthorsList } from "./admin/audio-settings/AuthorsList";
import { AuthorForm } from "./admin/audio-settings/AuthorForm";
import { useAuthorManagement } from "./admin/audio-settings/useAuthorManagement";

export const AdminAudioSettings = () => {
  const [useDefaultAudio, setUseDefaultAudio] = useState(true);
  const [defaultAudioSource, setDefaultAudioSource] = useState(BIBLE_AUDIO_BASE_URL);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    authors,
    isDialogOpen,
    isEditing,
    currentAuthor,
    loadAuthors,
    handleOpenDialog,
    handleCloseDialog,
    handleSaveAuthor,
    handleDeleteAuthor
  } = useAuthorManagement();

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await AudioService.getAudioSettings();
        setUseDefaultAudio(settings.useDefaultAudio);
        setDefaultAudioSource(settings.defaultAudioSource);
      } catch (error) {
        console.error("Failed to load audio settings:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações de áudio.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
    loadAuthors();
  }, [toast, loadAuthors]);

  return (
    <div className="bg-card rounded-lg shadow-sm space-y-6">
      {/* Audio Settings Form */}
      <AudioSettingsForm 
        isLoading={isLoading}
        useDefaultAudio={useDefaultAudio}
        setUseDefaultAudio={setUseDefaultAudio}
        defaultAudioSource={defaultAudioSource}
        setDefaultAudioSource={setDefaultAudioSource}
      />
      
      {/* Authors List */}
      <AuthorsList 
        authors={authors}
        isLoading={isLoading}
        onRefresh={loadAuthors}
        onAddAuthor={() => handleOpenDialog()}
        onEditAuthor={(author) => handleOpenDialog(author)}
        onDeleteAuthor={handleDeleteAuthor}
      />

      {/* Author Form Dialog */}
      <AuthorForm 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveAuthor}
        currentAuthor={currentAuthor}
        isEditing={isEditing}
        isLoading={isLoading}
      />
    </div>
  );
};
