import { Document } from '../../ast/Document';
import { LocatedException } from '../../req/LocatedException';

/**
 * Node-based semantic analyzer for a single document.
 * 
 * @author Thiago Delgado Pinto
 */
export interface NodeBasedSDA {

    analyze( doc: Document, errors: LocatedException[] ) ;

}