import * as arrayMove from 'array-move';
import * as deepcopy from 'deepcopy';
import { CaseType } from "../app/CaseType";
import { Step } from '../ast/Step';
import { KeywordDictionary } from "../language/KeywordDictionary";
import { Entities, NLPUtil } from '../nlp';
import { NodeTypes } from "../req/NodeTypes";
import { convertCase } from "../util/CaseConversor";
import { isDefined } from "../util/TypeChecking";



export class StepUtil {

    /**
     * Move precondition steps to the beginning of the array, after other precondition steps.
     * When there is a GIVEN step followed by an AND step, and the GIVEN needs to be moved,
     * the AND step is changed to become a GIVEN step.
     *
     * @param steps Steps to analyze
     */
    movePreconditionStepsToTheBeginning( steps: Step[], keywords: KeywordDictionary ): Step[] {
        const nlpUtil = new NLPUtil();
        let lastWasGiven: boolean | null = null;
        let index = 0, preconditionCount = 0;
        const stepCount = steps.length;
        let newSteps = deepcopy( steps ); // << important
        for ( let step of steps ) {

            if ( NodeTypes.STEP_GIVEN === step.nodeType
                || ( NodeTypes.STEP_AND == step.nodeType && true === lastWasGiven ) ) {

                const hasPrecondition = isDefined( step.nlpResult )
                    && nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult );

                if ( hasPrecondition ) {

                    // Does not have prior GIVEN ? -> Make it a GIVEN
                    if ( preconditionCount < 1 ) {
                        newSteps[ index ].nodeType = NodeTypes.STEP_GIVEN;
                    }

                    if ( preconditionCount != index ) {
                        arrayMove.mut( newSteps, index, preconditionCount );
                    }

                    // Is the next step an AND step ?
                    if ( index + 1 < stepCount && newSteps[ index + 1 ].nodeType === NodeTypes.STEP_AND ) {
                        let nextStep = newSteps[ index + 1 ];
                        // Make it a GIVEN step
                        nextStep.nodeType = NodeTypes.STEP_GIVEN;
                        // Change the sentence content!
                        if ( !! nextStep.content ) {
                            const stepAndKeyword: string = ( keywords.stepAnd || [ 'and' ] )[ 0 ];
                            const stepGivenKeyword: string = ( keywords.stepGiven || [ 'given' ] )[ 0 ];
                            const regex = new RegExp( stepAndKeyword, 'i' );
                            nextStep.content = nextStep.content.replace( regex, convertCase( stepGivenKeyword, CaseType.PASCAL ) ); // Given ...
                        }
                    }

                    ++preconditionCount;
                }

                lastWasGiven = true;

            } else {
                lastWasGiven = false;
            }

            ++index;
        }

        return newSteps;
    }

}