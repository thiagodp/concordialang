import { UIProperty } from '../ast/UIElement';
import { NodeTypes } from '../req/NodeTypes';
import { ContentNode } from "../ast/Node";
import { Location } from "../ast/Location";
import { NLP } from "./NLP";
import { NLPResult } from '../../modules/nlp/NLPResult';
import { LocatedException } from "../req/LocatedException";
import { NLPException } from "./NLPException";
import { Warning } from '../req/Warning';
import { isDefined } from '../util/TypeChecking';

/**
 * NLP result processor
 *
 * @author Thiago Delgado Pinto
 */
export type NLPResultProcessor = (
    node: ContentNode,
    result: NLPResult,
    errors: LocatedException[],
    warnings: LocatedException[]
) => void;

/**
 * Node sentence recognizer
 *
 * @author Thiago Delgado Pinto
 */
export class NodeSentenceRecognizer {

    constructor( private _nlp: NLP ) {
    }

    /**
     * Tries to recognize the sentences of the given nodes.
     *
     * @param language Language to be used in the recognition.
     * @param nodes Nodes with content to be analyzed.
     * @param targetIntents Target intents, to be used by the NLP.
     * @param targetDisplayName Target name to be displayed to the user in case of error.
     * @param errors Output errors.
     * @param warnings Output warnings.
     * @param resultProcessor Function to process each result.
     * @returns True in case of no errors are found, false otherwise.
     *
     * @throws Error If the NLP is not trained.
     */
    public recognize(
        language: string,
        nodes: ContentNode[],
        targetIntents: string[],
        targetDisplayName: string,
        errors: LocatedException[],
        warnings: LocatedException[],
        resultProcessor: NLPResultProcessor
    ): boolean {

        // Sanity checking
        if ( ! nodes ) {
            return true; // nothing to check
        }

        if ( ! this._nlp.isTrained( language ) ) {
            let msg = 'The NLP is not trained in ' + language;
            errors.push( new NLPException( msg, { line: 1, column: 1 } as Location ) );
            return false;
        }

        for ( let node of nodes ) {

            // console.log( 'Node before: ', node );
            // console.log( language, ', ', node.content, ', ', targetIntents );

            let r: NLPResult = this._nlp.recognize( language, node.content );

            // let r: NLPResult = null;
            // for ( let ti of targetIntents ) {
            //     r = this._nlp.recognize( language, node.content, ti );
            //     if ( isDefined( r ) ) {
            //         break;
            //     }
            // }

            // Not recognized?
            if ( ! r ) {
                let msg = 'Unrecognized: "' + node.content + '". Intents: ' + targetIntents.join( ',' );
                warnings.push( new NLPException( msg, node.location ) );
                continue;
            }

            // Save the result in the node
            node[ 'nlpResult' ] = r;

            // Different intent?
            if ( isDefined( r ) && isDefined( r.intent ) && targetIntents.indexOf( r.intent ) < 0 ) {
                //let msg = 'Unrecognized as part of a ' + targetDisplayName + ': ' + node.content;
                let msg = 'Different intent recognized for: ' + node.content + '. Intent: ' + r.intent;
                warnings.push( new NLPException( msg, node.location ) );
                continue;
            }
            // Process the result
            resultProcessor( node, r, errors, warnings );
        }

        return 0 === errors.length;
    }


    public validate(
        node: ContentNode,
        recognizedEntityNames: string[],
        syntaxRules: any[],
        property: string,
        errors: LocatedException[],
        warnings: LocatedException[]
    ): boolean {

        // Checks if a rule exists for the property
        const propertyRuleIndex: number = syntaxRules.map( sr => sr.name ).indexOf( property );
        if ( propertyRuleIndex < 0 ) {
            const msg = 'The sentence "' + node.content + '" could not be validated due to an inexistent rule for property "' + property + '"';
            warnings.push( new Warning( msg, node.location ) );
            return false;
        }

        // Let's check the rules!
        const rule: any = syntaxRules[ propertyRuleIndex ];
        //console.log( 'recogized are', recognizedEntityNames );
        //console.log( 'targets of', rule.name, 'are', rule.targets );

        // Count the expected targets, ignores the other ones - like verbs
        const expectedTargetsCount = recognizedEntityNames.filter( name => rule.targets.indexOf( name ) >= 0 ).length;
        // Checking minTargets
        if ( expectedTargetsCount < rule.minTargets ) {
            const msg = 'The property "' + property + '" expects at least ' + rule.minTargets + ' values, but it was informed ' +  expectedTargetsCount +  '.';
            errors.push( new NLPException( msg, node.location ) );
            return false;
        }
        // Checking maxTargets
        if ( expectedTargetsCount > rule.maxTargets ) {
            const msg = 'The property "' + property + '" expects at most ' + rule.maxTargets + ' values, but it was informed ' + expectedTargetsCount  + '.';
            errors.push( new NLPException( msg, node.location ) );
            return false;
        }
        // Checking targets
        for ( let target of rule.targets ) {
            // Inexistent rule for the target
            if ( ! rule[ target ] ) {
                const msg = 'The sentence "' + node.content + '" could not be validated due to an inexistent rule for the target "' + target + '" of the property "' + property + '"';
                warnings.push( new NLPException( msg, node.location ) );
                return false;
            }
            const targetRule = rule[ target ];
            // Disconsider in case of incompatible with minTargets and maxTargets
            if ( targetRule.min > rule.minTargets || targetRule.max > rule.maxTargets ) {
                continue;
            }
            const numberOfEntitiesOfTheTarget = recognizedEntityNames.filter( name => name === target ).length;
            if ( numberOfEntitiesOfTheTarget > 0 ) {
                // Min
                if ( numberOfEntitiesOfTheTarget < targetRule.min ) {
                    const msg = 'The property "' + property + '" expects at least ' + targetRule.min + ' for "' + target + '", but it was informed ' + numberOfEntitiesOfTheTarget + '.';
                    errors.push( new NLPException( msg, node.location ) );
                    return false;
                }
                // Max
                if ( numberOfEntitiesOfTheTarget > targetRule.max ) {
                    const msg = 'The property "' + property + '" expects at most ' + targetRule.max + ' for "' + target + '", but it was informed ' + numberOfEntitiesOfTheTarget  + '.';
                    errors.push( new NLPException( msg, node.location ) );
                    return false;
                }
            }
        }

        // Checking mustBeUsedWith
        for ( let otherEntity of rule.mustBeUsedWith ) {
            // Must have the other entity
            if ( recognizedEntityNames.indexOf( otherEntity ) < 0 ) {
                const msg = 'The property "' + property + '" must be used with "' + otherEntity + '".';
                errors.push( new NLPException( msg, node.location ) );
                return false;
            }
        }

        // Passed
        return true;
    }

}