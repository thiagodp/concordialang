import { Entities } from '../nlp/Entities';
import { ACTION_TARGET_MAP } from './ActionMap';
import { EditableActionTargets } from './ActionTargets';
import { isDefined } from './TypeChecking';
export class TargetTypeUtil {
    /**
     * Returns an empty string if the target type is not an input,
     * or the dictionary term to an input otherwise.
     *
     * @param step
     * @param languageDictionary
     */
    analyzeInputTargetTypes(step, languageDictionary) {
        let targetType = '';
        const INPUT_TARGET_TYPES = [
            EditableActionTargets.TEXTBOX,
            EditableActionTargets.TEXTAREA,
            EditableActionTargets.FILE_INPUT
        ];
        for (let tt of step.targetTypes || []) {
            if (INPUT_TARGET_TYPES.indexOf(tt) >= 0) {
                // TO-DO: refactor removing magic strings
                const values = ((languageDictionary.nlp["testcase"] || {})["ui_action_option"] || {})['field'];
                if (isDefined(values) && values.length > 0) {
                    targetType = values[0];
                }
                break;
            }
        }
        return targetType;
    }
    hasInputTargetInTheSentence(sentence, languageDictionary) {
        // TO-DO: refactor removing magic strings
        let terms = ((languageDictionary.nlp["testcase"] || {})["ui_action_option"] || {})['field'] || [];
        terms = terms.concat(((languageDictionary.nlp["testcase"] || {})["ui_element_type"] || {})['textbox'] || []);
        terms = terms.concat(((languageDictionary.nlp["testcase"] || {})["ui_element_type"] || {})['textarea'] || []);
        terms = terms.concat(((languageDictionary.nlp["testcase"] || {})["ui_element_type"] || {})['fileInput'] || []);
        for (let term of terms) {
            if (sentence.indexOf(' ' + term + ' ') >= 0) {
                return true;
            }
        }
        return false;
    }
    extractTargetTypes(step, doc, spec, extractor) {
        if (!step.nlpResult) {
            return [];
        }
        let targetTypes = step.targetTypes.slice(0);
        for (let e of step.nlpResult.entities || []) {
            switch (e.entity) {
                case Entities.UI_ELEMENT_REF: {
                    const uie = spec.uiElementByVariable(e.value, doc);
                    if (isDefined(uie)) {
                        const uieType = extractor.extractType(uie);
                        targetTypes.push(uieType);
                        break;
                    }
                    // proceed to Entities.UI_LITERAL
                }
                case Entities.UI_LITERAL: {
                    const action = step.action || null;
                    if (isDefined(action)) {
                        const defaultAction = ACTION_TARGET_MAP.get(action);
                        if (defaultAction) {
                            targetTypes.push(defaultAction);
                        }
                    }
                    break;
                }
            }
        }
        return targetTypes;
    }
}
