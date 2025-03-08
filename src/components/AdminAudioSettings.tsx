
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioService } from "@/services/AudioService";
import { BIBLE_AUDIO_BASE_URL } from "@/constants/bibleData";
import { useToast } from "@/hooks/use-toast";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Users,
  RefreshCw,
  Save,
  ListMusic
} from "lucide-react";
import { AuthorService } from "@/services/AuthorService";
import { AudioAuthor } from "@/types/bible";

export const AdminAudioSettings = () => {
  const [useDefaultAudio, setUseDefaultAudio] = useState(true);
  const [defaultAudioSource, setDefaultAudioSource] = useState(BIBLE_AUDIO_BASE_URL);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Author management state
  const [authors, setAuthors] = useState<AudioAuthor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState<AudioAuthor | null>(null);

  // Author form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ministryRole, setMinistryRole] = useState("");
  const [biography, setBiography] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [instagram, setInstagram] = useState("");

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
  }, [toast]);

  const loadAuthors = async () => {
    setIsLoading(true);
    try {
      const authorsList = await AuthorService.getAuthors();
      setAuthors(authorsList);
    } catch (error) {
      console.error("Error loading authors:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de autores.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const success = await AudioService.updateAudioSettings({
        useDefaultAudio,
        defaultAudioSource
      });
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Configurações de áudio atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar as configurações de áudio.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to save audio settings:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDefaultAudioSource(BIBLE_AUDIO_BASE_URL);
    setUseDefaultAudio(true);
  };

  // Author management functions
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setMinistryRole("");
    setBiography("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setFacebook("");
    setYoutube("");
    setInstagram("");
    setCurrentAuthor(null);
  };

  const handleOpenDialog = (author?: AudioAuthor) => {
    resetForm();
    if (author) {
      // Edit mode
      setIsEditing(true);
      setCurrentAuthor(author);
      setFirstName(author.firstName);
      setLastName(author.lastName);
      setMinistryRole(author.ministryRole || "");
      setBiography(author.biography || "");
      setEmail(author.email || "");
      setPhone(author.phone || "");
      setWebsite(author.website || "");
      setFacebook(author.facebook || "");
      setYoutube(author.youtube || "");
      setInstagram(author.instagram || "");
    } else {
      // Create mode
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSaveAuthor = async () => {
    if (!firstName || !lastName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor preencha o Nome e Sobrenome.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const authorData = {
        firstName,
        lastName,
        ministryRole,
        biography,
        email,
        phone,
        website,
        facebook,
        youtube,
        instagram
      };

      if (isEditing && currentAuthor) {
        // Update existing author
        const success = await AuthorService.updateAuthor(currentAuthor.id, authorData);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Autor atualizado com sucesso."
          });
          loadAuthors();
          handleCloseDialog();
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o autor.",
            variant: "destructive"
          });
        }
      } else {
        // Create new author
        const newAuthor = await AuthorService.createAuthor(authorData);
        if (newAuthor) {
          toast({
            title: "Sucesso",
            description: "Autor criado com sucesso."
          });
          loadAuthors();
          handleCloseDialog();
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível criar o autor.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error saving author:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o autor.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAuthor = async (authorId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este autor?")) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await AuthorService.deleteAuthor(authorId);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Autor excluído com sucesso."
        });
        loadAuthors();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o autor.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting author:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o autor.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm space-y-6">
      {/* Audio Settings Section */}
      <div className="p-6">
        <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
          <ListMusic className="h-5 w-5" />
          Configurações de Áudio
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="default-audio-toggle" 
              checked={useDefaultAudio}
              onCheckedChange={setUseDefaultAudio}
              disabled={isLoading}
            />
            <Label htmlFor="default-audio-toggle">
              Exibir áudio padrão para usuários
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="audio-source">URL Base do Áudio Padrão</Label>
            <Input 
              id="audio-source"
              value={defaultAudioSource}
              onChange={(e) => setDefaultAudioSource(e.target.value)}
              disabled={isLoading || !useDefaultAudio}
              placeholder="https://exemplo.com/audio/"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              A URL base será usada para construir os links para os arquivos de áudio padrão.
            </p>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button 
              onClick={handleSaveSettings}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar Configurações
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isLoading}
            >
              Restaurar Padrão
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-3 mt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Apenas administradores podem alterar essas configurações.
            Elas afetam como o áudio é exibido para todos os usuários do sistema.
          </p>
        </div>
      </div>
      
      {/* Author Management Section */}
      <Card className="m-6 mt-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciamento de Autores
              </CardTitle>
              <CardDescription>
                Cadastre e gerencie autores que narram os áudios bíblicos
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadAuthors()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => handleOpenDialog()}>
                <UserPlus className="h-4 w-4 mr-1" />
                Novo Autor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {authors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isLoading ? 'Carregando autores...' : 'Nenhum autor cadastrado'}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {authors.map((author) => (
                <Card key={author.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{author.firstName} {author.lastName}</CardTitle>
                    {author.ministryRole && (
                      <CardDescription>{author.ministryRole}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2 text-sm">
                    {author.email && <p className="mb-1">Email: {author.email}</p>}
                    {author.phone && <p className="mb-1">Telefone: {author.phone}</p>}
                    {author.biography && (
                      <p className="line-clamp-2 text-muted-foreground">
                        {author.biography}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDialog(author)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteAuthor(author.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Excluir
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Author Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Autor" : "Adicionar Novo Autor"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Edite as informações do autor abaixo." 
                : "Preencha as informações para cadastrar um novo autor."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nome"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sobrenome"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ministryRole">Cargo/Ministério</Label>
              <Input
                id="ministryRole"
                value={ministryRole}
                onChange={(e) => setMinistryRole(e.target.value)}
                placeholder="Ex: Pastor, Evangelista, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="biography">Biografia</Label>
              <Input
                id="biography"
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="Breve biografia do autor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://exemplo.com"
              />
            </div>

            <div className="space-y-1">
              <Label>Redes Sociais</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="Facebook"
                  />
                </div>
                <div>
                  <Input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Instagram"
                  />
                </div>
                <div>
                  <Input
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="YouTube"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAuthor} disabled={isLoading}>
              {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
