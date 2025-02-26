import { BibleBook, BibleVerse, BibleChapter } from "@/types/bible";
import { supabase } from "@/integrations/supabase/client";

const BIBLE_BOOKS = [
  { name: "Gênesis", chapters: 50 },
  { name: "Êxodo", chapters: 40 },
  { name: "Levítico", chapters: 27 },
  { name: "Números", chapters: 36 },
  { name: "Deuteronômio", chapters: 34 },
  { name: "Josué", chapters: 24 },
  { name: "Juízes", chapters: 21 },
  { name: "Rute", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Reis", chapters: 22 },
  { name: "2 Reis", chapters: 25 },
  { name: "1 Crônicas", chapters: 29 },
  { name: "2 Crônicas", chapters: 36 },
  { name: "Esdras", chapters: 10 },
  { name: "Neemias", chapters: 13 },
  { name: "Ester", chapters: 10 },
  { name: "Jó", chapters: 42 },
  { name: "Salmos", chapters: 150 },
  { name: "Provérbios", chapters: 31 },
  { name: "Eclesiastes", chapters: 12 },
  { name: "Cânticos", chapters: 8 },
  { name: "Isaías", chapters: 66 },
  { name: "Jeremias", chapters: 52 },
  { name: "Lamentações", chapters: 5 },
  { name: "Ezequiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Oséias", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amós", chapters: 9 },
  { name: "Obadias", chapters: 1 },
  { name: "Jonas", chapters: 4 },
  { name: "Miquéias", chapters: 7 },
  { name: "Naum", chapters: 3 },
  { name: "Habacuque", chapters: 3 },
  { name: "Sofonias", chapters: 3 },
  { name: "Ageu", chapters: 2 },
  { name: "Zacarias", chapters: 14 },
  { name: "Malaquias", chapters: 4 },
  { name: "Mateus", chapters: 28 },
  { name: "Marcos", chapters: 16 },
  { name: "Lucas", chapters: 24 },
  { name: "João", chapters: 21 },
  { name: "Atos", chapters: 28 },
  { name: "Romanos", chapters: 16 },
  { name: "1 Coríntios", chapters: 16 },
  { name: "2 Coríntios", chapters: 13 },
  { name: "Gálatas", chapters: 6 },
  { name: "Efésios", chapters: 6 },
  { name: "Filipenses", chapters: 4 },
  { name: "Colossenses", chapters: 4 },
  { name: "1 Tessalonicenses", chapters: 5 },
  { name: "2 Tessalonicenses", chapters: 3 },
  { name: "1 Timóteo", chapters: 6 },
  { name: "2 Timóteo", chapters: 4 },
  { name: "Tito", chapters: 3 },
  { name: "Filemom", chapters: 1 },
  { name: "Hebreus", chapters: 13 },
  { name: "Tiago", chapters: 5 },
  { name: "1 Pedro", chapters: 5 },
  { name: "2 Pedro", chapters: 3 },
  { name: "1 João", chapters: 5 },
  { name: "2 João", chapters: 1 },
  { name: "3 João", chapters: 1 },
  { name: "Judas", chapters: 1 },
  { name: "Apocalipse", chapters: 22 }
];

const BIBLE_AUDIO_BASE_URL = "https://www.divinerevelations.info/documents/bible/portuguese_mp3_bible/portuguese_bsp_nt_drama";

const AUDIO_FILE_MAPPING: { [key: string]: string } = {
  "Gênesis": "01_genesis",
  "Êxodo": "02_exodo",
  "Levítico": "03_levitico",
  "Números": "04_numeros",
  "Deuteronômio": "05_deuteronomio",
  "Josué": "06_josue",
  "Juízes": "07_judges",
  "Rute": "08_ruth",
  "1 Samuel": "09_1_samuel",
  "2 Samuel": "10_2_samuel",
  "1 Reis": "11_1_kings",
  "2 Reis": "12_2_kings",
  "1 Crônicas": "13_1_cronicas",
  "2 Crônicas": "14_2_cronicas",
  "Esdras": "15_esdras",
  "Neemias": "16_nehemiah",
  "Ester": "17_ester",
  "Jó": "18_job",
  "Salmos": "19_salmos",
  "Provérbios": "20_proverbios",
  "Eclesiastes": "21_eclesiastes",
  "Cânticos": "22_song_of_solomon",
  "Isaías": "23_isaias",
  "Jeremias": "24_jeremias",
  "Lamentações": "25_lamentations",
  "Ezequiel": "26_ezequiel",
  "Daniel": "27_daniel",
  "Oséias": "28_oseas",
  "Joel": "29_joel",
  "Amós": "30_amos",
  "Obadias": "31_obadiah",
  "Jonas": "32_jonah",
  "Miquéias": "33_micah",
  "Naum": "34_nahum",
  "Habacuque": "35_habakkuk",
  "Sofonias": "36_zephaniah",
  "Ageu": "37_haggai",
  "Zacarias": "38_zechariah",
  "Malaquias": "39_malaquias",
  "Mateus": "40_sao_mateus",
  "Marcos": "41_sao_marcos",
  "Lucas": "42_sao_lucas",
  "João": "43_sao_joao",
  "Atos": "44_atos",
  "Romanos": "45_romanos",
  "1 Coríntios": "46_1_corintios",
  "2 Coríntios": "47_2_corintios",
  "Gálatas": "48_galatas",
  "Efésios": "49_efesios",
  "Filipenses": "50_filipenses",
  "Colossenses": "51_colossenses",
  "1 Tessalonicenses": "52_1_tessalonissenses",
  "2 Tessalonicenses": "53_2_tessalonissenses",
  "1 Timóteo": "54_1_timoteo",
  "2 Timóteo": "55_2_timoteo",
  "Tito": "56_tito",
  "Filemom": "57_filemon",
  "Hebreus": "58_hebreus",
  "Tiago": "59_sao_tiago",
  "1 Pedro": "60_1_pedro",
  "2 Pedro": "61_2_pedro",
  "1 João": "62_1_sao_joao",
  "2 João": "63_2_sao_joao",
  "3 João": "64_3_sao_joao",
  "Judas": "65_sao_judas",
  "Apocalipse": "66_apocalipse"
};

export class BibleService {
  private static bibleData: any = null;

  private static getBookAudioUrl(bookName: string): string {
    const audioFileName = AUDIO_FILE_MAPPING[bookName];
    if (!audioFileName) {
      console.error(`Audio file mapping not found for book: ${bookName}`);
      return "";
    }
    return `${BIBLE_AUDIO_BASE_URL}/${audioFileName}.mp3`;
  }

  private static async fetchBibleData(): Promise<any> {
    if (this.bibleData) {
      return this.bibleData;
    }

    try {
      const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json');
      if (!response.ok) {
        throw new Error('Failed to fetch Bible data');
      }
      this.bibleData = await response.json();
      return this.bibleData;
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      throw error;
    }
  }

  static async getBooks(): Promise<BibleBook[]> {
    return BIBLE_BOOKS;
  }

  private static async getCustomAudio(bookName: string, chapter: number, verse: number): Promise<string | null> {
    const { data, error } = await supabase
      .from('verse_audio')
      .select('audio_path')
      .eq('book', bookName)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .single();

    if (error || !data) {
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('bible_audio')
      .getPublicUrl(data.audio_path);

    return publicUrl;
  }

  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    try {
      const bibleData = await this.fetchBibleData();
      const book = bibleData.find((b: any) => b.name === bookName);
      
      if (!book || !book.chapters || !book.chapters[chapter - 1]) {
        return [];
      }

      const defaultAudioUrl = this.getBookAudioUrl(bookName);

      const verses = await Promise.all(book.chapters[chapter - 1].map(async (verse: string, index: number) => {
        const customAudio = await this.getCustomAudio(bookName, chapter, index + 1);
        return {
          book: bookName,
          chapter,
          verse: index + 1,
          text: verse,
          defaultAudioUrl,
          audio: customAudio || undefined,
        };
      }));

      return verses;
    } catch (error) {
      console.error("Error fetching chapter:", error);
      return [];
    }
  }

  static async searchVerses(query: string): Promise<BibleVerse[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const results: BibleVerse[] = [];
      const searchQuery = query.toLowerCase();
      const bibleData = await this.fetchBibleData();

      for (const book of bibleData) {
        if (!book.chapters) continue;
        const defaultAudioUrl = this.getBookAudioUrl(book.name);

        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          const chapter = book.chapters[chapterIndex];
          for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
            const verse = chapter[verseIndex];
            if (verse.toLowerCase().includes(searchQuery)) {
              const customAudio = await this.getCustomAudio(book.name, chapterIndex + 1, verseIndex + 1);
              results.push({
                book: book.name,
                chapter: chapterIndex + 1,
                verse: verseIndex + 1,
                text: verse,
                defaultAudioUrl,
                audio: customAudio || undefined,
              });
            }
          }
        }

        if (results.length >= 100) break;
      }

      return results;
    } catch (error) {
      console.error("Error searching verses:", error);
      return [];
    }
  }
}
