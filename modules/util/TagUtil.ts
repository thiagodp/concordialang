import { Tag } from "../ast/Tag";

/**
 * Tag utilities
 *
 * @author Thiago Delgado Pinto
 */
export class TagUtil {

    isNameInKeywords( tag: Tag, keywords: string[] ): boolean {
        return keywords.indexOf( tag.name.toLowerCase() ) >= 0;
    }

    tagsWithNameInKeywords( tags: Tag[], keywords: string[] ): Tag[] {
        return tags.filter( ( t: Tag ) => this.isNameInKeywords( t, keywords ) );
    }

    firstContentOf( tags: Tag[] ): string | null {
        return ( tags.length > 0 ) ? tags[ 0 ].content : null;
    }

    firstNumericContentOf( tags: Tag[] ): number | null {
        const content = this.firstContentOf( tags );
        if ( content !== null ) {
            const num = parseInt( content );
            return isNaN( num ) ? null : num;
        }
        return null;
    }

}