import { camel, kebab, pascal, snake } from 'case';
import { CaseType } from './CaseType';

export function convertCase( text: string, type: CaseType | string ): string {
    switch ( type.toString().trim().toLowerCase() ) {
        case CaseType.CAMEL: return camel( text );
        case CaseType.PASCAL: return pascal( text );
        case CaseType.SNAKE: return snake( text );
        case CaseType.KEBAB: return kebab( text );
        default: return text; // do nothing
    }
}

export function upperFirst( text: string ): string {
    if ( !! text[ 0 ] ) {
        return text[ 0 ].toUpperCase() + text.substr( 1 );
    }
    return text;
}


export function removeDiacritics( text: string ): string {
	return text.normalize( "NFD" ).replace( /[\u0300-\u036f]/g, "" );
}
