import { Variant } from '../ast/Variant';
import { State } from '../ast/VariantLike';
import { Entities } from '../nlp/Entities';
import { NLPUtil } from '../nlp/NLPResult';
import { NodeTypes } from '../req/NodeTypes';

/**
 * Detects preconditions, state calls and postconditions.
 *
 * @author Thiago Delgado Pinto
 */
export class VariantStateDetector {

    /**
     * Detects State references and adds them to the given object.
     *
     * @param variantLike Variant or Variant Background object to be updated.
     */
    update( variantLike: any, isVariant: boolean ): void {

        // No sentences? -> Exit
        if ( ! variantLike || ! variantLike.sentences || variantLike.sentences.length < 1 ) {
            return;
        }

        // Preparing the state references

        if ( ! variantLike.preconditions ) {
            variantLike.preconditions = [];
        }

        if ( ! variantLike.stateCalls ) {
            variantLike.stateCalls = [];
        }

        if ( isVariant && ! variantLike.postconditions ) {
            variantLike.postconditions = [];
        }

        // Analysing detected entities of the steps

        const nlpUtil = new NLPUtil();
        let lastGWT: NodeTypes = null;

        let stepIndex = -1;
        for ( let step of variantLike.sentences ) {
            ++stepIndex;

            if ( ! step.nlpResult ) {
                continue;
            }

            // Handles "AND" steps as the last Given/When/Then
            if ( step.nodeType !== NodeTypes.STEP_AND && step.nodeType !== NodeTypes.STEP_OTHERWISE ) {
                lastGWT = step.nodeType;
            }

            if ( null === lastGWT ) {
                continue;
            }

            let targetStates: State[] | null = null;
            switch ( lastGWT ) {
                case NodeTypes.STEP_GIVEN: targetStates = variantLike.preconditions; break;
                case NodeTypes.STEP_WHEN: targetStates = variantLike.stateCalls; break;
                case NodeTypes.STEP_THEN: {
                    targetStates = isVariant ? variantLike.postconditions : null;
                    break;
                }
            }

            if ( null === targetStates ) {
                continue;
            }

            const stateNames: string[] = nlpUtil.valuesOfEntitiesNamed( Entities.STATE, step.nlpResult );
            for ( let name of stateNames ) {
                targetStates.push( new State( name, stepIndex ) );
            }
        }
    }


    /**
     * Returns the removed preconditions.
     */
    removePreconditionsThatRefersToPostconditions( variant: Variant ): State[] {
        let removed: State[] = [];
        for ( let postc of variant.postconditions || [] ) {
            let index = 0;
            for ( let prec of variant.preconditions || [] ) {
                if ( prec.equals( postc ) ) {
                    removed.push( prec );
                    variant.preconditions.splice( index, 1 );
                }
                ++index;
            }
        }
        return removed;
    }

}