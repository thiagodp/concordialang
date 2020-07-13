import { LanguageContent } from "./LanguageContent";
import { LanguageContentLoader } from "./LanguageContentLoader";

/**
 * In-memory language content loader
 *
 * @author Thiago Delgado Pinto
 */
export class InMemoryLanguageContentLoader implements LanguageContentLoader {

	/**
	 * @param map Maps a language to a language content.
	 */
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
