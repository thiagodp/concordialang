import { LanguageContent } from "./LanguageContent";

/**
 * Language content loader
 *
 * @author Thiago Delgado Pinto
 */
export interface LanguageContentLoader {

    /**
     * Returns true if the language is available.
     */
    has( language: string ): boolean;

    /**
     * Loads a language content synchronously.
     *
     * @param language The language to load.
     * @returns LanguageContent
     * @throws Error Whether the corresponding file does not exist.
     */
    load( language: string ): LanguageContent;

}