
export class BibleTextService {
  static async fetchBibleData(): Promise<any> {
    try {
      console.log("Carregando dados da Bíblia do arquivo JSON");
      
      // Adicionar cache buster para evitar cache do navegador
      const cacheBuster = `?_=${Date.now()}`;
      const response = await fetch('/SF_20251803_PORTUGUESEJFAC_1848.json' + cacheBuster);
      
      if (!response.ok) {
        throw new Error(`Falha ao carregar dados da Bíblia: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Dados da Bíblia carregados com sucesso: ${data.length} livros`);
      
      return data;
    } catch (error) {
      console.error("Erro ao carregar dados da Bíblia:", error);
      // Relançar para permitir que o código chamador trate o erro
      throw new Error(`Falha ao carregar dados da Bíblia: ${error.message}`);
    }
  }
}
