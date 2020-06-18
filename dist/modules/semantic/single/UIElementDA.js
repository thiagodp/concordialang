"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SemanticException_1 = require("../../error/SemanticException");
const TypeChecking_1 = require("../../util/TypeChecking");
const UIElementPropertyExtractor_1 = require("../../util/UIElementPropertyExtractor");
const DuplicationChecker_1 = require("../DuplicationChecker");
/**
 * Analyzes UI Element declarations for a single document.
 *
 * It checks for:
 *  - Duplicated local names.
 *  - Duplicated global names.
 *  - Duplicated non-repeatable properties.
 *  - Triplicated non-triplicatable properties.
 *  - Incompatible properties.
 *  - Incompatible properties' operators.
 *
 * @author Thiago Delgado Pinto
 */
class UIElementDA {
    analyze(doc, errors) {
        const checker = new DuplicationChecker_1.DuplicationChecker();
        // In the Document (global)
        const globalOnes = doc.uiElements || [];
        checker.checkDuplicatedNamedNodes(globalOnes, errors, 'global UI Element');
        // In the Feature (local)
        const localOnes = TypeChecking_1.isDefined(doc.feature) ? doc.feature.uiElements || [] : [];
        checker.checkDuplicatedNamedNodes(localOnes, errors, 'UI Element');
        // Between both
        // const all: UIElement[] = [ ...global, ...fromFeature ];
        // checker.checkDuplicatedNamedNodes( all, errors, 'UI Element' );
        this.analyzeUIPropertiesOfEvery(globalOnes, doc, errors);
        this.analyzeUIPropertiesOfEvery(localOnes, doc, errors);
    }
    analyzeUIPropertiesOfEvery(uiElements, doc, errors) {
        const uipExtractor = new UIElementPropertyExtractor_1.UIElementPropertyExtractor();
        const baseNonRepeatableMsg = 'Non-repeatable properties found:';
        const baseNonTriplicableMsg = 'Three instances of the same property found:';
        const baseIncompatiblePropertiesMsg = 'Incompatible properties found:';
        const baseIncompatibleOperatorsMsg = 'Incompatible operators found:';
        let makeMsg = (msg, properties) => {
            let fullMsg = msg;
            for (let p of properties) {
                fullMsg += "\n  (" + p.location.line + ',' + p.location.column + ') ' + p.content;
            }
            return fullMsg;
        };
        for (let uie of uiElements) {
            const propertiesMap = uipExtractor.mapProperties(uie);
            const nonRepeatable = uipExtractor.nonRepeatableProperties(propertiesMap);
            for (let nr of nonRepeatable) {
                const msg = makeMsg(baseNonRepeatableMsg, nr);
                const err = new SemanticException_1.SemanticException(msg, uie.location);
                errors.push(err);
            }
            const nonTriplicable = uipExtractor.nonTriplicatableProperties(propertiesMap);
            for (let nt of nonTriplicable) {
                const msg = makeMsg(baseNonTriplicableMsg, nt);
                const err = new SemanticException_1.SemanticException(msg, uie.location);
                errors.push(err);
            }
            const incompatiblesProperties = uipExtractor.incompatibleProperties(propertiesMap);
            for (let inc of incompatiblesProperties) {
                const msg = makeMsg(baseIncompatiblePropertiesMsg, inc);
                const err = new SemanticException_1.SemanticException(msg, uie.location);
                errors.push(err);
            }
            const incompatibleOperators = uipExtractor.incompatibleOperators(propertiesMap);
            for (let inc of incompatibleOperators) {
                const msg = makeMsg(baseIncompatibleOperatorsMsg, inc);
                const err = new SemanticException_1.SemanticException(msg, uie.location);
                errors.push(err);
            }
        }
    }
}
exports.UIElementDA = UIElementDA;
