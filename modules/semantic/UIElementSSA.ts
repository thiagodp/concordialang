import { SpecificationAnalyzer } from "./SpecificationAnalyzer";
import { Spec } from "../ast/Spec";
import { SemanticException } from "./SemanticException";
import Graph = require( 'graph.js/dist/graph.full.js' );

/**
 * Executes semantic analysis of UI Elements in a specification.
 *
 * Checkings:
 * - duplicated names of global UI Elements
 * - references to declarations - TODO: <<<
 *
 * Changes:
 * - retrieve references' values (EntityRef) - TODO: <<<
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
   public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {
       this._checker.checkDuplicatedNamedNodes( spec.uiElements(), errors, 'global UI Element' );
   }

   retriveReferences( spec: Spec, errors: SemanticException[] ) {

   }

}