
import { BibleBook } from "@/types/bible";
import { BIBLE_BOOKS } from "@/constants/bibleData";

export class BibleBookService {
  static async getBooks(): Promise<BibleBook[]> {
    return BIBLE_BOOKS;
  }
}
