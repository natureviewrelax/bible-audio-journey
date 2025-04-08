
import { AudioAuthor } from "@/types/bible";
import { BaseAudioService } from "./audio/BaseAudioService";
import { VerseAudioService } from "./audio/VerseAudioService";
import { AudioSettingsService } from "./audio/AudioSettingsService";
import { AuthorService } from "./AuthorService";

export class AudioService {
  // Métodos de áudio base
  static getBookAudioUrl(bookName: string): string {
    return BaseAudioService.getBookAudioUrl(bookName);
  }

  // Métodos de áudio de versículos
  static async getCustomAudio(bookName: string, chapter: number, verse: number, preferredAuthorId?: string): Promise<{ url: string | null; authorId: string | null }> {
    return VerseAudioService.getCustomAudio(bookName, chapter, verse, preferredAuthorId);
  }

  static async updateVerseAudioAuthor(bookName: string, chapter: number, verse: number, authorId: string | null): Promise<boolean> {
    return VerseAudioService.updateVerseAudioAuthor(bookName, chapter, verse, authorId);
  }

  // Métodos de autor
  static async getAuthorForAudio(authorId: string): Promise<AudioAuthor | null> {
    return AuthorService.getAuthor(authorId);
  }

  // Métodos de configurações
  static async getAudioSettings(): Promise<{useDefaultAudio: boolean, defaultAudioSource: string}> {
    return AudioSettingsService.getAudioSettings();
  }

  static async updateAudioSettings(settings: {useDefaultAudio: boolean, defaultAudioSource: string}): Promise<boolean> {
    return AudioSettingsService.updateAudioSettings(settings);
  }
}
