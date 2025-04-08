
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { AudioAuthor } from "@/types/bible";

interface AuthorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (authorData: Omit<AudioAuthor, "id">) => void;
  currentAuthor: AudioAuthor | null;
  isEditing: boolean;
  isLoading: boolean;
}

export const AuthorForm = ({
  isOpen,
  onClose,
  onSave,
  currentAuthor,
  isEditing,
  isLoading
}: AuthorFormProps) => {
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
    if (currentAuthor) {
      setFirstName(currentAuthor.firstName);
      setLastName(currentAuthor.lastName);
      setMinistryRole(currentAuthor.ministryRole || "");
      setBiography(currentAuthor.biography || "");
      setEmail(currentAuthor.email || "");
      setPhone(currentAuthor.phone || "");
      setWebsite(currentAuthor.website || "");
      setFacebook(currentAuthor.facebook || "");
      setYoutube(currentAuthor.youtube || "");
      setInstagram(currentAuthor.instagram || "");
    } else {
      resetForm();
    }
  }, [currentAuthor, isOpen]);

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
  };

  const handleSubmit = () => {
    onSave({
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
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !firstName || !lastName}>
            {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
