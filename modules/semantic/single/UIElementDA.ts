import { DocumentAnalyzer } from "./DocumentAnalyzer";
import { Document } from '../../ast/Document';
import { SemanticException } from "../SemanticException";
import { DuplicationChecker } from "../../util/DuplicationChecker";
import { UIElement } from "../../ast/UIElement";
import { isDefined } from "../../util/TypeChecking";

/**
 * Scenario analyzer for a single document.
 *
 * Checkings:
 *  - Duplicated names in a Feature.
 *  - Duplicated names in the Document.
 *  - Duplicated names between a Feature and a Document
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementDA implements DocumentAnalyzer {

    analyze( doc: Document, errors: SemanticException[] ) {

        const checker = new DuplicationChecker();

        // In the Document
        const global: UIElement[] = doc.uiElements || [];
        // checker.checkDuplicatedNamedNodes( global, errors, 'global UI Element' );

        // In the Feature
        const fromFeature: UIElement[] = isDefined( doc.feature )
            ? doc.feature.uiElements || []
            : [];
        // checker.checkDuplicatedNamedNodes( fromFeature, errors, 'UI Element' );

        // Between both
        const all: UIElement[] = [ ...global, ...fromFeature ];
        checker.checkDuplicatedNamedNodes( all, errors, 'UI Element' );
    }
}