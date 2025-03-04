
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="flex gap-4 mb-6">
      <Input
        type="text"
        placeholder="Pesquisar versículos..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1"
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <Button onClick={handleSearch}>
        <Search className="h-4 w-4 mr-2" />
        Pesquisar
      </Button>
    </div>
  );
};
