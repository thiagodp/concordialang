import { LocatedException } from '../req/LocatedException';
import { Spec } from "../ast/Spec";

/**
 * Node-based semantic analyzer for a specification.
 * 
 * @author Thiago Delgado Pinto
 */
export interface NodeBasedSpecAnalyzer {

    analyze( spec: Spec, errors: LocatedException[] );

}