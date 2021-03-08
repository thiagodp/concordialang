import { Entities } from './Entities';
import { NLPEntity } from './NLPEntity';
import { NLPResult } from './NLPResult';

/**
 * Entity handler
 *
 * @author Thiago Delgado Pinto
 */
export class EntityHandler {

    with( r: NLPResult, target: Entities ): NLPEntity[] {
		if ( ! r.entities ) {
			return [];
		}
        return r.entities.filter( e => e.entity === target );
    }

    count( r: NLPResult, target: Entities ): number {
        return this.with( r, target ).length;
    }

    has( r: NLPResult, target: Entities ): boolean {
        return this.count( r, target ) > 0;
    }

    values( r: NLPResult, target: Entities ): any[] {
        return this.with( r, target ).map( e => e.value );
    }
}
