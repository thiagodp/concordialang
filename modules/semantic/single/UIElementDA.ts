import { DocumentAnalyzer } from "./DocumentAnalyzer";
import { Document } from '../../ast/Document';
import { SemanticException } from "../SemanticException";
import { DuplicationChecker } from "../../util/DuplicationChecker";
import { UIElement, UIProperty } from "../../ast/UIElement";
import { isDefined } from "../../util/TypeChecking";
import { UIElementPropertyExtractor } from "../../util/UIElementPropertyExtractor";

/**
 * UI Element analyzer for a single document.
 *
 * Checkings:
 *  - Duplicated local names.
 *  - Duplicated global names.
 *  - Duplicated non-repeatable properties.
 *  - Triplicated non-triplicatable properties.
 *  - Incompatible properties.
 *  - Incompatible properties' operators.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementDA implements DocumentAnalyzer {

    analyze( doc: Document, errors: SemanticException[] ) {

        const checker = new DuplicationChecker();

        // In the Document (global)
        const globalOnes: UIElement[] = doc.uiElements || [];
        checker.checkDuplicatedNamedNodes( globalOnes, errors, 'global UI Element' );

        // In the Feature (local)
        const localOnes: UIElement[] = isDefined( doc.feature ) ? doc.feature.uiElements || [] : [];
        checker.checkDuplicatedNamedNodes( localOnes, errors, 'UI Element' );

        // Between both
        // const all: UIElement[] = [ ...global, ...fromFeature ];
        // checker.checkDuplicatedNamedNodes( all, errors, 'UI Element' );

        this.analyzeUIPropertiesOfEvery( globalOnes, doc, errors );
        this.analyzeUIPropertiesOfEvery( localOnes, doc, errors );
    }


    analyzeUIPropertiesOfEvery( uiElements: UIElement[], doc: Document, errors: SemanticException[] ) {

        const uipExtractor = new UIElementPropertyExtractor();

        const baseNonRepeatableMsg = 'Non-repeatable properties found:';
        const baseNonTriplicableMsg = 'Three instances of the same property found:';
        const baseIncompatibleMsg = 'Incompatible properties found:';
        const baseIncompatibleOperatorsMsg = 'Incompatible operators found:';

        let makeMsg = ( msg: string, properties: UIProperty[] ): string => {
            let fullMsg = msg;
            for ( let p of properties ) {
                fullMsg += "\n  (" + p.location.line + ',' + p.location.column + ') ' + p.content;
            }
            return fullMsg;
        };

        for ( let uie of uiElements ) {

            const propertiesMap = uipExtractor.mapProperties( uie );

            const nonRepeatable = uipExtractor.nonRepeatableProperties( propertiesMap );
            for ( let nr of nonRepeatable ) {
                const msg = makeMsg( baseNonRepeatableMsg, nr );
                const err = new SemanticException( msg, uie.location );
                errors.push( err );
            }

            const nonTriplicable = uipExtractor.nonTriplicatableProperties( propertiesMap );
            for ( let nt of nonTriplicable ) {
                const msg = makeMsg( baseNonTriplicableMsg, nt );
                const err = new SemanticException( msg, uie.location );
                errors.push( err );
            }

            const incompatibles = uipExtractor.incompatibleProperties( propertiesMap );
            for ( let inc of incompatibles ) {
                const msg = makeMsg( baseIncompatibleMsg, inc );
                const err = new SemanticException( msg, uie.location );
                errors.push( err );
            }

            const incompatibleOperators = uipExtractor.incompatibleOperators( propertiesMap );
            for ( let inc of incompatibles ) {
                const msg = makeMsg( baseIncompatibleOperatorsMsg, inc );
                const err = new SemanticException( msg, uie.location );
                errors.push( err );
            }
        }
    }

}