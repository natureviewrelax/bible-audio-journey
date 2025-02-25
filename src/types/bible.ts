
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  audio?: string;
  defaultAudioUrl?: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  name: string;
  chapters: number;
}
