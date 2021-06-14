import { Warning } from '../error/Warning';
import { isDefined } from '../util/TypeChecking';
import { NLPException } from './NLPException';
/**
 * Node sentence recognizer
 *
 * @author Thiago Delgado Pinto
 */
export class NodeSentenceRecognizer {
    constructor(_nlp) {
        this._nlp = _nlp;
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
    recognize(language, nodes, targetIntents, targetDisplayName, errors, warnings, resultProcessor) {
        // Sanity checking
        if (!nodes) {
            return true; // nothing to check
        }
        if (!this._nlp.isTrained(language)) {
            let msg = 'The language processor is not trained in ' + language;
            errors.push(new NLPException(msg, { line: 1, column: 1 }));
            return false;
        }
        // for ( let node of nodes ) {
        nodes.forEach((node, index, allNodes) => {
            // console.log( 'Node before: ', node );
            // console.log( language, ', ', node.content, ', ', targetIntents );
            let r = this._nlp.recognize(language, node.content);
            // console.log( r );
            // let r: NLPResult = null;
            // for ( let ti of targetIntents ) {
            //     r = this._nlp.recognize( language, node.content, ti );
            //     if ( isDefined( r ) ) {
            //         break;
            //     }
            // }
            // Not recognized?
            if (!r) {
                let msg = 'Unrecognized: "' + node.content + '". Intents: ' + targetIntents.join(',');
                warnings.push(new NLPException(msg, node.location));
                // continue;
                return;
            }
            // Save the result in the node
            node['nlpResult'] = r;
            // Different intent?
            if (isDefined(r) && isDefined(r.intent) && targetIntents.indexOf(r.intent) < 0) {
                //let msg = 'Unrecognized as part of a ' + targetDisplayName + ': ' + node.content;
                let msg = 'Different intent recognized for: ' + node.content + '. Intent: ' + r.intent;
                warnings.push(new NLPException(msg, node.location));
                // continue;
                return;
            }
            // Process the result
            let newNode = resultProcessor(node, r, errors, warnings);
            // console.log( 'Node after: ', newNode );
            if (!newNode) {
                newNode = node;
            }
            // Replace the old node
            allNodes[index] = newNode;
        });
        return 0 === errors.length;
    }
    validate(node, recognizedEntityNames, syntaxRules, property, errors, warnings) {
        // Checks if a rule exists for the property
        const propertyRuleIndex = syntaxRules.map(sr => sr.name).indexOf(property);
        if (propertyRuleIndex < 0) {
            const msg = 'The sentence "' + node.content + '" could not be validated due to an inexistent rule for "' + property + '"';
            warnings.push(new Warning(msg, node.location));
            return false;
        }
        // Let's check the rules!
        const rule = syntaxRules[propertyRuleIndex];
        //console.log( 'recognized are', recognizedEntityNames );
        //console.log( 'targets of', rule.name, 'are', rule.targets );
        // Count the expected targets, ignores the other ones - like verbs
        const expectedTargetsCount = recognizedEntityNames.filter(name => rule.targets.indexOf(name) >= 0).length;
        // Checking minTargets
        if (expectedTargetsCount < rule.minTargets) {
            const msg = '"' + property + '" expects at least ' + rule.minTargets + ' values, but it was informed ' + expectedTargetsCount + '.';
            warnings.push(new Warning(msg, node.location));
            return false;
        }
        // Checking maxTargets
        if (expectedTargetsCount > rule.maxTargets) {
            const msg = '"' + property + '" expects at most ' + rule.maxTargets + ' values, but it was informed ' + expectedTargetsCount + '.';
            warnings.push(new Warning(msg, node.location));
            return false;
        }
        // Checking targets
        for (let target of rule.targets) {
            // Inexistent rule for the target
            if (!rule[target]) {
                const msg = 'The sentence "' + node.content + '" could not be validated due to an inexistent rule for the target "' + target + '" of "' + property + '"';
                warnings.push(new Warning(msg, node.location));
                return false;
            }
            const targetRule = rule[target];
            // Disconsider in case of incompatible with minTargets and maxTargets
            if (targetRule.min > rule.minTargets || targetRule.max > rule.maxTargets) {
                continue;
            }
            const numberOfEntitiesOfTheTarget = recognizedEntityNames.filter(name => name === target).length;
            if (numberOfEntitiesOfTheTarget > 0) {
                // Min
                if (numberOfEntitiesOfTheTarget < targetRule.min) {
                    const msg = '"' + property + '" expects at least ' + targetRule.min + ' for "' + target + '", but it was informed ' + numberOfEntitiesOfTheTarget + '.';
                    warnings.push(new Warning(msg, node.location));
                    return false;
                }
                // Max
                if (numberOfEntitiesOfTheTarget > targetRule.max) {
                    const msg = '"' + property + '" expects at most ' + targetRule.max + ' for "' + target + '", but it was informed ' + numberOfEntitiesOfTheTarget + '.';
                    warnings.push(new Warning(msg, node.location));
                    return false;
                }
            }
        }
        // Checking mustBeUsedWith
        for (let otherEntity of rule.mustBeUsedWith || []) {
            // Must have the other entity
            if (recognizedEntityNames.indexOf(otherEntity) < 0) {
                const msg = '"' + property + '" must be used with "' + otherEntity + '".';
                warnings.push(new Warning(msg, node.location));
                return false;
            }
        }
        // Passed
        return true;
    }
}
