"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Entities_1 = require("../nlp/Entities");
const ActionMap_1 = require("./ActionMap");
const ActionTargets_1 = require("./ActionTargets");
const TypeChecking_1 = require("./TypeChecking");
class TargetTypeUtil {
    /**
     * Returns an empty string if the target type is not an input,
     * or the dictionary term to an input otherwise.
     *
     * @param step
     * @param langContent
     */
    analyzeInputTargetTypes(step, langContent) {
        let targetType = '';
        const INPUT_TARGET_TYPES = [
            ActionTargets_1.EditableActionTargets.TEXTBOX,
            ActionTargets_1.EditableActionTargets.TEXTAREA,
            ActionTargets_1.EditableActionTargets.FILE_INPUT
        ];
        for (let tt of step.targetTypes || []) {
            if (INPUT_TARGET_TYPES.indexOf(tt) >= 0) {
                // TO-DO: refactor removing magic strings
                const values = ((langContent.nlp["testcase"] || {})["ui_action_option"] || {})['field'];
                if (TypeChecking_1.isDefined(values) && values.length > 0) {
                    targetType = values[0];
                }
                break;
            }
        }
        return targetType;
    }
    hasInputTargetInTheSentence(sentence, langContent) {
        // TO-DO: refactor removing magic strings
        let terms = ((langContent.nlp["testcase"] || {})["ui_action_option"] || {})['field'] || [];
        terms = terms.concat(((langContent.nlp["testcase"] || {})["ui_element_type"] || {})['textbox'] || []);
        terms = terms.concat(((langContent.nlp["testcase"] || {})["ui_element_type"] || {})['textarea'] || []);
        terms = terms.concat(((langContent.nlp["testcase"] || {})["ui_element_type"] || {})['fileInput'] || []);
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
                case Entities_1.Entities.UI_ELEMENT_REF: {
                    const uie = spec.uiElementByVariable(e.value, doc);
                    if (TypeChecking_1.isDefined(uie)) {
                        const uieType = extractor.extractType(uie);
                        targetTypes.push(uieType);
                        break;
                    }
                    // proceed to Entities.UI_LITERAL
                }
                case Entities_1.Entities.UI_LITERAL: {
                    const action = step.action || null;
                    if (TypeChecking_1.isDefined(action)) {
                        const defaultAction = ActionMap_1.ACTION_TARGET_MAP.get(action);
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
exports.TargetTypeUtil = TargetTypeUtil;
