import { Symbols } from "../req/Symbols";

/**
 * Command handler
 *
 * @author Thiago Delgado Pinto
 */
export class CommentHandler {

    remove( content: string, ignoreTrim: boolean = false ): string {
        // Comment is the first character after trim left
        if ( 0 === content.trimLeft().indexOf( Symbols.COMMENT_PREFIX ) ) {
            return content.substring( 0, content.indexOf( Symbols.COMMENT_PREFIX ) );
        }
        // There is content before the comment, let's get the last index
        let commentPos = content.lastIndexOf( Symbols.COMMENT_PREFIX );
        if ( commentPos < 0 ) { // not found
            return content;
        }
        // Check whether it has any terminator after it
        let lastValueIndex = content.lastIndexOf( Symbols.VALUE_WRAPPER );
        let lastUILiteralIndex = content.lastIndexOf( Symbols.UI_LITERAL_SUFFIX );
        let lastCommandIndex = content.lastIndexOf( Symbols.COMMAND_WRAPPER );
        if ( ( lastValueIndex >= 0 && commentPos < lastValueIndex ) ||
            ( lastUILiteralIndex >= 0 && commentPos < lastUILiteralIndex ) ||
            ( lastCommandIndex >= 0 && commentPos < lastCommandIndex )
        ) {
            return content;
        }
        return content.substring( 0, commentPos );
    }

    removeComment( content: string, ignoreTrim: boolean = false ): string {
        const result = this.remove( content );
        return ignoreTrim ? result : result.trim();
    }

}