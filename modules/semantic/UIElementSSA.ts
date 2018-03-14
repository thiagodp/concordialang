import { SpecSemanticAnalyzer } from "./SpecSemanticAnalyzer";
import { Spec } from "../ast/Spec";
import { SemanticException } from "./SemanticException";

/**
 * Executes semantic analysis of UI Elements in a specification.
 *
 * Checkings:
 * - duplicated names of global UI Elements
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementSSA extends SpecSemanticAnalyzer {

    /** @inheritDoc */
   public async analyze( spec: Spec, errors: SemanticException[] ): Promise< void > {
       this._checker.checkDuplicatedNamedNodes( spec.globalUiElements(), errors, 'UI Element' );
   }

}