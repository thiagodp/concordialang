import { NodeParser } from "./NodeParser";
import { VariantBackground } from "../ast/VariantBackground";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';
import { SyntaticException } from "../req/SyntaticException";

/**
 * Variant Background parser
 *
 * @author Thiago Delgado Pinto
 */
export class VariantBackgroundParser implements NodeParser< VariantBackground > {

    /** @inheritDoc */
    public analyze( node: VariantBackground, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if a feature has been declared before it
        if ( ! context.doc.feature ) {
            let e = new SyntaticException(
                'A background must be declared after a feature.', node.location );
            errors.push( e );
            return false;
        }

        let feature = context.doc.feature;

        const wasDeclaredForTheFeature = !! feature.variantBackground;
        const doesNotHaveScenarios = ! feature.scenarios || feature.scenarios.length < 1;

        if ( wasDeclaredForTheFeature && doesNotHaveScenarios ) {
            let e = new SyntaticException(
                'A feature cannot have more than one variant background.', node.location );
            errors.push( e );
            return false;
        }

        let target = doesNotHaveScenarios ? feature : context.currentScenario;
        if ( ! target ) { // Only when currentScenario is not defined
            let e = new SyntaticException(
                'Could not determine the current scenario for the variant background.', node.location );
            errors.push( e );
            return false;
        }

        // Sets the node
        target.variantBackground = node;

        // Adjusts the context
        context.resetInValues();
        if ( doesNotHaveScenarios ) {
            context.inVariantBackground = true;
            context.currentVariantBackground = node;
        } else {
            context.inScenarioVariantBackground = true;
            context.currentScenarioVariantBackground = node;
        }

    }

}