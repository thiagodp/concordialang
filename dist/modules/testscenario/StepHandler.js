"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepHandler = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const CaseConversor_1 = require("../util/CaseConversor");
const TypeChecking_1 = require("../util/TypeChecking");
const EntityRecognizerMaker_1 = require("../nlp/EntityRecognizerMaker");
const hasState = sentence => EntityRecognizerMaker_1.STATE_REGEX.test(sentence);
const stepHasState = (step) => step ? hasState(step.content) : false;
class StepHandler {
    constructor(_langContentLoader, _defaultLanguage) {
        this._langContentLoader = _langContentLoader;
        this._defaultLanguage = _defaultLanguage;
        /** Maps language => ( keyword, value ) */
        this._keywords = new Map();
    }
    keywordMapForLanguage(docLanguage) {
        const lang = TypeChecking_1.isDefined(docLanguage) ? docLanguage : this._defaultLanguage;
        let dictionary = this._keywords.get(lang);
        if (!dictionary) {
            const langContent = this._langContentLoader.load(lang);
            const keywords = langContent.keywords;
            dictionary = new Map();
            dictionary.set(NodeTypes_1.NodeTypes.STEP_GIVEN, (keywords.stepGiven || ['given'])[0]);
            dictionary.set(NodeTypes_1.NodeTypes.STEP_WHEN, (keywords.stepWhen || ['when'])[0]);
            dictionary.set(NodeTypes_1.NodeTypes.STEP_THEN, (keywords.stepThen || ['then'])[0]);
            dictionary.set(NodeTypes_1.NodeTypes.STEP_AND, (keywords.stepAnd || ['and'])[0]);
            dictionary.set(NodeTypes_1.NodeTypes.STEP_OTHERWISE, (keywords.stepOtherwise || ['otherwise'])[0]);
            this._keywords.set(lang, dictionary);
        }
        return dictionary;
    }
    startsWithKeyword(stepContent, keyword) {
        const searchWithOptionalTabsOrSpaces = new RegExp('^(?: |\t)*' + keyword, 'i');
        return searchWithOptionalTabsOrSpaces.test(stepContent);
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
    replacePrefix(searchNodeType, replaceNodeType, stepContent, docLanguage) {
        const dictionary = this.keywordMapForLanguage(docLanguage);
        if (!dictionary || !stepContent) {
            return stepContent;
        }
        const searchKeyword = dictionary.get(searchNodeType);
        let replaceKeyword = dictionary.get(replaceNodeType);
        if (!searchKeyword || !replaceKeyword) {
            return stepContent;
        }
        // Make given/when/then -> Given/When/Then
        if (replaceNodeType !== NodeTypes_1.NodeTypes.STEP_AND) {
            replaceKeyword = CaseConversor_1.upperFirst(replaceKeyword);
        }
        const searchWithOptionalTabsOrSpaces = new RegExp('^(?: |\t)*' + searchKeyword, 'i');
        if (!searchWithOptionalTabsOrSpaces.test(stepContent)) {
            return stepContent;
        }
        const search = new RegExp(searchKeyword, 'i');
        const r = stepContent.replace(search, replaceKeyword);
        // Detect repeat words after the replaced one
        const [, second, third] = r.split(/[ \t]+/g);
        if (second && third && second.toLowerCase() === third.toLowerCase()) {
            return r.replace(new RegExp('[ \t]+' + second, 'i'), '');
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
    adjustPrefixes(steps, docLanguage) {
        let lastStepType;
        for (const step of steps) {
            if (step.nodeType !== NodeTypes_1.NodeTypes.STEP_AND) {
                if (!lastStepType) {
                    lastStepType = step.nodeType;
                    continue;
                }
                if (step.nodeType === lastStepType) {
                    step.content = this.replacePrefix(step.nodeType, NodeTypes_1.NodeTypes.STEP_AND, step.content, docLanguage);
                    step.nodeType = NodeTypes_1.NodeTypes.STEP_AND;
                }
            }
            lastStepType = step.nodeType;
        }
    }
    adjustPrefixesToReplaceStates(steps, docLanguage) {
        let priorWasGiven = false, priorWasWhen = false, priorHasState = false;
        for (let step of steps) {
            if (step.nodeType === NodeTypes_1.NodeTypes.STEP_GIVEN) {
                priorWasGiven = true;
                priorWasWhen = false;
                priorHasState = stepHasState(step);
            }
            else if (step.nodeType === NodeTypes_1.NodeTypes.STEP_WHEN) {
                priorWasGiven = false;
                priorWasWhen = true;
                priorHasState = stepHasState(step);
            }
            else if (step.nodeType === NodeTypes_1.NodeTypes.STEP_AND &&
                priorHasState &&
                (priorWasGiven || priorWasWhen) &&
                !stepHasState(step) // current does not have state
            ) {
                if (priorWasGiven) {
                    step.content = this.replacePrefix(NodeTypes_1.NodeTypes.STEP_AND, NodeTypes_1.NodeTypes.STEP_GIVEN, step.content, docLanguage);
                    step.nodeType = NodeTypes_1.NodeTypes.STEP_GIVEN;
                }
                else { // When
                    step.content = this.replacePrefix(NodeTypes_1.NodeTypes.STEP_AND, NodeTypes_1.NodeTypes.STEP_WHEN, step.content, docLanguage);
                    step.nodeType = NodeTypes_1.NodeTypes.STEP_WHEN;
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
    removeStep(steps, index, docLanguage) {
        // Check index range
        const len = steps.length;
        if (index < 0 || index >= len) {
            return steps;
        }
        // Check target in the index
        const target = steps[index];
        if (!target) {
            return steps;
        }
        const isTargetAnAndStep = target.nodeType === NodeTypes_1.NodeTypes.STEP_AND;
        const nextStep = index + 1 < len ? steps[index + 1] : null;
        const isNextAnAndStep = nextStep && nextStep.nodeType === NodeTypes_1.NodeTypes.STEP_AND;
        // Case 1:
        //  Given/When/Then/Otherwise ...	 <-- TARGET
        //    and ...          				 <-- NEXT STEP
        //
        if (!isTargetAnAndStep && isNextAnAndStep) {
            // Change the content of the next node and then the type
            nextStep.content = this.replacePrefix(nextStep.nodeType, target.nodeType, nextStep.content, docLanguage);
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
        const arrayCopy = [...steps];
        arrayCopy.splice(index, 1);
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
    stepsExceptExternalOrGivenStepsWithState(steps, docLanguage) {
        let lastNonAndWasGiven = false;
        let indexesToRemove = [];
        let index = -1;
        for (const step of steps) {
            ++index;
            if (step.external) {
                indexesToRemove.push(index);
                continue;
            }
            if (step.nodeType === NodeTypes_1.NodeTypes.STEP_GIVEN) {
                lastNonAndWasGiven = true;
                if (stepHasState(step)) {
                    indexesToRemove.push(index);
                    continue;
                }
            }
            else if (step.nodeType === NodeTypes_1.NodeTypes.STEP_WHEN ||
                step.nodeType === NodeTypes_1.NodeTypes.STEP_THEN) {
                lastNonAndWasGiven = false;
            }
            if (lastNonAndWasGiven && step.nodeType === NodeTypes_1.NodeTypes.STEP_AND) {
                if (stepHasState(step)) {
                    indexesToRemove.push(index);
                    continue;
                }
            }
        }
        let newSteps = [...steps];
        for (const index of indexesToRemove.reverse()) {
            newSteps = this.removeStep(newSteps, index, docLanguage);
        }
        return newSteps;
    }
}
exports.StepHandler = StepHandler;
