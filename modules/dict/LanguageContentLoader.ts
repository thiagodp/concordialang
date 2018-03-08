import { LanguageContent } from "./LanguageContent";
import { LanguageBasedJsonFileLoader } from "../util/LanguageBasedJsonFileLoader";

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

/**
 * In-memory language content loader
 * 
 * @author Thiago Delgado Pinto
 */
export class InMemoryLanguageContentLoader implements LanguageContentLoader {

    constructor( private _map: Map< string, LanguageContent > ) {
    }

    /** @inheritDoc */
    has( language: string ): boolean {
        return this._map.has( language );
    }

    /** @inheritDoc */
    load( language: string ): LanguageContent {
        return this._map.get( language );
    }
}


/**
 * Json language content loader
 * 
 * @author Thiago Delgado Pinto
 */
export class JsonLanguageContentLoader
    extends LanguageBasedJsonFileLoader
    implements LanguageContentLoader {    
}