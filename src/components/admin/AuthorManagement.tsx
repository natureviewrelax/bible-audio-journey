
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogTrigger, 
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
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthorService } from "@/services/AuthorService";
import { AudioAuthor } from "@/types/bible";

export const AuthorManagement = () => {
  const [authors, setAuthors] = useState<AudioAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState<AudioAuthor | null>(null);
  const { toast } = useToast();

  // Form state
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

  const loadAuthors = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

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

    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleDeleteAuthor = async (authorId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este autor?")) {
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
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
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
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
            {loading ? 'Carregando autores...' : 'Nenhum autor cadastrado'}
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
                    disabled={loading}
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
            <Button variant="outline" onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAuthor} disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
