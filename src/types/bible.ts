
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  audio?: string;
  defaultAudioUrl?: string;
  authorId?: string;
  authorName?: string;
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

export interface AudioAuthor {
  id: string;
  firstName: string;
  lastName: string;
  ministryRole?: string;
  biography?: string;
  email?: string;
  phone?: string;
  website?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
}
