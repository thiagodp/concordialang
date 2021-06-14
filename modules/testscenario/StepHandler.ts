import { Step } from '../ast/Step';
import { dictionaryForLanguage } from '../language/data/map';
import { KeywordDictionary } from '../language/KeywordDictionary';
import { STATE_REGEX } from '../nlp/EntityRecognizerMaker';
import { NodeTypes } from '../req/NodeTypes';
import { upperFirst } from '../util/CaseConversor';
import { isDefined } from '../util/TypeChecking';


const hasState = sentence => STATE_REGEX.test( sentence );

const stepHasState = ( step: Step ) => step ? hasState( step.content ) : false;

export class StepHandler {

	/** Maps language => ( keyword, value ) */
	private _keywords: Map< string, Map< string, string > > =
		new Map< string, Map< string, string > >();

	constructor( private _defaultLanguage: string ) {
	}

	private keywordMapForLanguage( docLanguage: string ): Map< string, string > {

		const lang = isDefined( docLanguage ) ? docLanguage : this._defaultLanguage;

		let dictionary: Map< string, string > = this._keywords.get( lang )
		if ( ! dictionary ) {
			const languageDictionary = dictionaryForLanguage( lang );
			const keywords: KeywordDictionary = languageDictionary.keywords;

			dictionary = new Map< string, string >();
			dictionary.set( NodeTypes.STEP_GIVEN, ( keywords.stepGiven || [ 'given' ] )[ 0 ] );
			dictionary.set( NodeTypes.STEP_WHEN, ( keywords.stepWhen || [ 'when' ] )[ 0 ] );
			dictionary.set( NodeTypes.STEP_THEN, ( keywords.stepThen || [ 'then' ] )[ 0 ] );
			dictionary.set( NodeTypes.STEP_AND, ( keywords.stepAnd || [ 'and' ] )[ 0 ] );
			dictionary.set( NodeTypes.STEP_OTHERWISE, ( keywords.stepOtherwise || [ 'otherwise' ] )[ 0 ] );

			this._keywords.set( lang, dictionary );
		}
		return dictionary;
	}


	startsWithKeyword( stepContent: string, keyword: string ): boolean {
		const searchWithOptionalTabsOrSpaces =
			new RegExp( '^(?: |\t)*' + keyword, 'i' );
		return searchWithOptionalTabsOrSpaces.test( stepContent );
	}

	/**
	 * Returns the step content replace by another, according to the given
	 * prefixes. For example, it can replace a `When` for an `And`.
	 *
	 * @param searchNodeType Type of the node.
	 * @param replaceNodeType Type to replace.
	 * @param stepContent Content to replace
	 * @param docLanguage Document's language.
	 * @returns Replaced content.
	 */
	replacePrefix(
		searchNodeType: string,
		replaceNodeType: string,
		stepContent: string,
		docLanguage: string,
	): string {
		const dictionary: Map< string, string > = this.keywordMapForLanguage( docLanguage );
		if ( ! dictionary || ! stepContent ) {
			return stepContent;
		}

		const searchKeyword = dictionary.get( searchNodeType );
		let replaceKeyword = dictionary.get( replaceNodeType );
		if ( ! searchKeyword || ! replaceKeyword ) {
			return stepContent;
		}

		// Make given/when/then -> Given/When/Then
		if ( replaceNodeType !== NodeTypes.STEP_AND ) {
			replaceKeyword = upperFirst( replaceKeyword );
		}

		const searchWithOptionalTabsOrSpaces =
			new RegExp( '^(?: |\t)*' + searchKeyword, 'i' );
		if ( ! searchWithOptionalTabsOrSpaces.test( stepContent ) ) {
			return stepContent;
		}

		const search = new RegExp( searchKeyword, 'i' );
		const r = stepContent.replace( search, replaceKeyword );

		// Detect repeat words after the replaced one
		const [ , second, third ] = r.split( /[ \t]+/g );
		if ( second && third && second.toLowerCase() === third.toLowerCase() ) {
			return r.replace( new RegExp( '[ \t]+' + second, 'i' ), '' );
		}

		return r;
	}

	/**
	 * Makes single `Given` / `When` / `Then` steps, replacing additional
	 * occurrences by `And`.
	 *
	 * @param steps
	 * @param docLanguage
	 */
	adjustPrefixes(
		steps: Step[],
		docLanguage: string
	): void {
		let lastStepType: NodeTypes;
		for ( const step of steps ) {

			if ( step.nodeType !== NodeTypes.STEP_AND ) {

				if ( ! lastStepType ) {
					lastStepType = step.nodeType;
					continue;
				}

				if ( step.nodeType === lastStepType ) {
					step.content = this.replacePrefix(
						step.nodeType,
						NodeTypes.STEP_AND,
						step.content,
						docLanguage
					);
					step.nodeType = NodeTypes.STEP_AND;
				}
			}

			lastStepType = step.nodeType;
		}
	}


	adjustPrefixesToReplaceStates(
		steps: Step[],
		docLanguage: string
	): void {

        let priorWasGiven = false, priorWasWhen = false, priorHasState = false;
        for ( let step of steps ) {

            if ( step.nodeType === NodeTypes.STEP_GIVEN ) {
                priorWasGiven = true;
                priorWasWhen = false;
                priorHasState = stepHasState( step );

            } else if ( step.nodeType === NodeTypes.STEP_WHEN ) {
                priorWasGiven = false;
                priorWasWhen = true;
                priorHasState = stepHasState( step );

			} else if ( step.nodeType === NodeTypes.STEP_AND &&
				priorHasState &&
				( priorWasGiven || priorWasWhen ) &&
				! stepHasState( step ) // current does not have state
			) {

                if ( priorWasGiven ) {

					step.content = this.replacePrefix(
						NodeTypes.STEP_AND, NodeTypes.STEP_GIVEN, step.content, docLanguage );

                    step.nodeType = NodeTypes.STEP_GIVEN;

                } else { // When

					step.content = this.replacePrefix(
						NodeTypes.STEP_AND, NodeTypes.STEP_WHEN, step.content, docLanguage );

                    step.nodeType = NodeTypes.STEP_WHEN;
                }

                priorHasState = false; // important
            }

        }

	}

	/**
	 * Returns a copy of the given array with the index removed and the
	 * sentences adjusted accordingly.
	 *
	 * @param steps Steps to consider.
	 * @param index Index to remove.
	 * @param docLanguage Document language.
	 * @return
	 */
	removeStep(
		steps: Step[],
		index: number,
		docLanguage: string,
	): Step[] {

		// Check index range
		const len = steps.length;
		if ( index < 0 || index >= len ) {
			return steps;
		}

		// Check target in the index
		const target = steps[ index ];
		if ( ! target ) {
			return steps;
		}

		const isTargetAnAndStep = target.nodeType === NodeTypes.STEP_AND;

		const nextStep: Step = index + 1 < len ? steps[ index + 1 ] : null;
		const isNextAnAndStep = nextStep && nextStep.nodeType === NodeTypes.STEP_AND;

		// Case 1:
		//  Given/When/Then/Otherwise ...	 <-- TARGET
		//    and ...          				 <-- NEXT STEP
		//
		if ( ! isTargetAnAndStep && isNextAnAndStep ) {

			// Change the content of the next node and then the type
			nextStep.content = this.replacePrefix(
				nextStep.nodeType,
				target.nodeType,
				nextStep.content,
				docLanguage
			);

			nextStep.nodeType = target.nodeType;

			// Continue to remove the target
		}
		// Case 2:
		//  Given/When/Then/Otherwise ...	<-- PREVIOUS
		//    and ...           			<-- TARGET
		//	  and ...           			<-- NEXT
		//
		// Case 3:
		//    and ...	<-- PREVIOUS
		//    and ...	<-- TARGET
		//	  and ...	<-- NEXT
		//
		// Case 4:
		//  Given/When/Then/Otherwise ...	<-- PREVIOUS
		//  Given/When/Then/Otherwise ...	<-- TARGET
		//  Given/When/Then/Otherwise ...	<-- NEXT

		// Removes the target
		const arrayCopy = [ ... steps ];
		arrayCopy.splice( index, 1 );
		return arrayCopy;
	}


	// stepsAfterGivenSteps( steps: Step[] ): Step[] {
	// 	const r = [];
	// 	let lastNonAndWasGiven: boolean = false;
	// 	for ( const step of steps ) {

	// 		if ( step.nodeType === NodeTypes.STEP_GIVEN ) {
	// 			lastNonAndWasGiven = true;
	// 			continue;
	// 		} else if ( step.nodeType === NodeTypes.STEP_WHEN ||
	// 			step.nodeType === NodeTypes.STEP_THEN
	// 		) {
	// 			lastNonAndWasGiven = false;
	// 		}

	// 		if ( lastNonAndWasGiven && step.nodeType === NodeTypes.STEP_AND ) {
	// 			continue;
	// 		}

	// 		r.push( step );
	// 	}
	// 	return r;
	// }

	/**
	 * Returns all steps, except External and Given steps with state.
	 */
	stepsExceptExternalOrGivenStepsWithState(
		steps: Step[],
		docLanguage: string
	): Step[] {

		let lastNonAndWasGiven: boolean = false;
		let indexesToRemove = [];
		let index = -1;
		for ( const step of steps ) {
			++index;

			if ( step.external ) {
				indexesToRemove.push( index );
				continue;
			}

			if ( step.nodeType === NodeTypes.STEP_GIVEN ) {
				lastNonAndWasGiven = true;
				if ( stepHasState( step ) ) {
					indexesToRemove.push( index );
					continue;
				}
			} else if ( step.nodeType === NodeTypes.STEP_WHEN ||
				step.nodeType === NodeTypes.STEP_THEN
			) {
				lastNonAndWasGiven = false;
			}

			if ( lastNonAndWasGiven && step.nodeType === NodeTypes.STEP_AND ) {
				if ( stepHasState( step ) ) {
					indexesToRemove.push( index );
					continue;
				}
			}
		}

		let newSteps = [ ... steps ];
		for ( const index of indexesToRemove.reverse() ) {
			newSteps = this.removeStep( newSteps, index, docLanguage );
		}

		return newSteps;
	}




	// import * as arrayMove from 'array-move';
	//
	//
    // /**
    //  * Move precondition steps to the beginning of the array, after other precondition steps.
    //  * When there is a GIVEN step followed by an AND step, and the GIVEN needs to be moved,
    //  * the AND step is changed to become a GIVEN step.
    //  *
    //  * @param steps Steps to analyze
    //  */
    // movePreconditionStepsToTheBeginning( steps: Step[], keywords: KeywordDictionary ): Step[] {
    //     const nlpUtil = new NLPUtil();
    //     let lastWasGiven: boolean | null = null;
    //     let index = 0, preconditionCount = 0;
    //     const stepCount = steps.length;
    //     let newSteps = deepcopy( steps ); // << important
    //     for ( let step of steps ) {

    //         if ( NodeTypes.STEP_GIVEN === step.nodeType
    //             || ( NodeTypes.STEP_AND == step.nodeType && true === lastWasGiven ) ) {

    //             const hasPrecondition = isDefined( step.nlpResult )
    //                 && nlpUtil.hasEntityNamed( Entities.STATE, step.nlpResult );

    //             if ( hasPrecondition ) {

    //                 // Does not have prior GIVEN ? -> Make it a GIVEN
    //                 if ( preconditionCount < 1 ) {
    //                     newSteps[ index ].nodeType = NodeTypes.STEP_GIVEN;
    //                 }

    //                 if ( preconditionCount != index ) {
    //                     arrayMove.mut( newSteps, index, preconditionCount );
    //                 }

    //                 // Is the next step an AND step ?
    //                 if ( index + 1 < stepCount && newSteps[ index + 1 ].nodeType === NodeTypes.STEP_AND ) {
    //                     let nextStep = newSteps[ index + 1 ];
    //                     // Make it a GIVEN step
    //                     nextStep.nodeType = NodeTypes.STEP_GIVEN;
    //                     // Change the sentence content!
    //                     if ( !! nextStep.content ) {
    //                         const stepAndKeyword: string = ( keywords.stepAnd || [ 'and' ] )[ 0 ];
    //                         const stepGivenKeyword: string = ( keywords.stepGiven || [ 'given' ] )[ 0 ];
    //                         const regex = new RegExp( stepAndKeyword, 'i' );
    //                         nextStep.content = nextStep.content.replace( regex, convertCase( stepGivenKeyword, CaseType.PASCAL ) ); // Given ...
    //                     }
    //                 }

    //                 ++preconditionCount;
    //             }

    //             lastWasGiven = true;

    //         } else {
    //             lastWasGiven = false;
    //         }

    //         ++index;
    //     }

    //     return newSteps;
    // }


}
