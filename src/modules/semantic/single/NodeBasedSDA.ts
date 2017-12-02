import { Spec } from '../../ast/Spec';
import { Document } from '../../ast/Document';
import { LocatedException } from '../../req/LocatedException';

/**
 * Node-based semantic analyzer for a single document.
 * 
 * @author Thiago Delgado Pinto
 */
export interface NodeBasedSDA {

    analyze( spec: Spec, doc: Document, errors: LocatedException[] ) ;

}