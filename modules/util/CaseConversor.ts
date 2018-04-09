import { CaseType } from '../app/CaseType';
import { camel, pascal, snake, kebab } from 'case';

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