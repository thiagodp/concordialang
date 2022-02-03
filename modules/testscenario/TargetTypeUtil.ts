import { Document, Step } from '../ast';
import { LanguageDictionary } from '../language/LanguageDictionary';
import { Entities } from '../nlp/Entities';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { ACTION_TARGET_MAP } from '../util/ActionMap';
import { EditableActionTargets } from '../util/ActionTargets';
import { isDefined } from '../util/type-checking';
import { UIElementPropertyExtractor } from '../util/UIElementPropertyExtractor';

export class TargetTypeUtil {

    /**
     * Returns an empty string if the target type is not an input,
     * or the dictionary term to an input otherwise.
     *
     * @param step
     * @param languageDictionary
     */
    analyzeInputTargetTypes( step: Step, languageDictionary: LanguageDictionary ): string {
        let targetType: string = '';
        const INPUT_TARGET_TYPES: string[] = [
            EditableActionTargets.TEXTBOX,
            EditableActionTargets.TEXTAREA,
            EditableActionTargets.FILE_INPUT
        ];
        for ( let tt of step.targetTypes || [] ) {
            if ( INPUT_TARGET_TYPES.indexOf( tt ) >= 0 ) {
                // TO-DO: refactor removing magic strings
                const values: string[] = ( ( languageDictionary.nlp[ "testcase" ] || {} )[ "ui_action_option" ] || {} )[ 'field' ];
                if ( isDefined( values ) && values.length > 0 ) {
                    targetType = values[ 0 ];
                }
                break;
            }
        }
        return targetType;
    }

    hasInputTargetInTheSentence( sentence: string, languageDictionary: LanguageDictionary ): boolean {

        // TO-DO: refactor removing magic strings

        let terms: string[] = ( ( languageDictionary.nlp[ "testcase" ] || {} )[ "ui_action_option" ] || {} )[ 'field' ] || [];

        terms = terms.concat(
            ( ( languageDictionary.nlp[ "testcase" ] || {} )[ "ui_element_type" ] || {} )[ 'textbox' ] || []
        );

        terms = terms.concat(
            ( ( languageDictionary.nlp[ "testcase" ] || {} )[ "ui_element_type" ] || {} )[ 'textarea' ] || []
        );

        terms = terms.concat(
            ( ( languageDictionary.nlp[ "testcase" ] || {} )[ "ui_element_type" ] || {} )[ 'fileInput' ] || []
        );

        for ( let term of terms ) {
            if ( sentence.indexOf( ' ' + term + ' ' ) >= 0 ) {
                return true;
            }
        }
        return false;
    }


    extractTargetTypes( step: Step, doc: Document, spec: AugmentedSpec, extractor: UIElementPropertyExtractor ): string[] {
        if ( ! step.nlpResult ) {
            return [];
        }
        let targetTypes: string[] = step.targetTypes.slice( 0 );
        for ( let e of step.nlpResult.entities || [] ) {
            switch ( e.entity ) {
                case Entities.UI_ELEMENT_REF: {
                    const uie = spec.uiElementByVariable( e.value, doc );
                    if ( isDefined( uie ) ) {
                        const uieType = extractor.extractType( uie );
                        targetTypes.push( uieType );
                        break;
                    }
                    // proceed to Entities.UI_LITERAL
                }
                case Entities.UI_LITERAL: {
                    const action = step.action || null;
                    if ( isDefined( action ) ) {
                        const defaultAction = ACTION_TARGET_MAP.get( action );
                        if ( defaultAction ) {
                            targetTypes.push( defaultAction );
                        }
                    }
                    break;
                }
            }
        }
        return targetTypes;
    }

}
