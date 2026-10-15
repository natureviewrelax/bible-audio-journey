
import { useEffect } from "react";
import { AuthorsList } from "./admin/audio-settings/AuthorsList";
import { AuthorForm } from "./admin/audio-settings/AuthorForm";
import { useAuthorManagement } from "./admin/audio-settings/useAuthorManagement";

export const AdminAudioSettings = () => {
  
  const {
    authors,
    isLoading,
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
    loadAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-card rounded-lg shadow-sm space-y-6">
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
