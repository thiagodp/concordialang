import { Document } from '../../ast/Document';
import { LocatedException } from '../../req/LocatedException';

/**
 * Node semantic analyzer.
 * 
 * @author Thiago Delgado Pinto
 */
export interface NodeSA {

    analyze( doc: Document, errors: LocatedException[] ) ;

}