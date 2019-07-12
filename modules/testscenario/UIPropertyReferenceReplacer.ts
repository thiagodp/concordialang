import { basename } from 'path';

import { Step, EntityValueType, UIPropertyTypes, UIElement, UIPropertyReference } from "../ast";
import { UIElementNameHandler, isDefined } from "../util";
import { RuntimeException } from '../error/RuntimeException';
import { Symbols } from '../req/Symbols';
import { GenContext } from "./PreTestCaseGenerator";
import { formatValueToUseInASentence } from './value-formater';


export class UIPropertyReferenceReplacer {

    /**
     * Returns the step content with all the UIProperty references replaced by their value.
     *
     * @param step Input step.
     * @param uiePropertyReferences References to replace.
     * @param uieVariableToValueMap Map that contains the value of all UIElement variables.
     * @param ctx Generation context.
     */
    replaceUIPropertyReferencesByTheirValue(
        step: Step,
        uiePropertyReferences: UIPropertyReference[],
        uieVariableToValueMap: Map< string, EntityValueType >,
        ctx: GenContext
    ): string {

        const uieNameHandler = new UIElementNameHandler();
        let content = step.content;

        for ( let uipRef of uiePropertyReferences || [] ) {

            // Properties different from VALUE are not supported yet
            if ( uipRef.property != UIPropertyTypes.VALUE ) {
                const fileName = basename( ctx.doc.fileInfo.path );
                const locStr = '(' + step.location.line + ',' + step.location.column + ')';
                const msg = 'Could not retrieve a value from ' +
                    Symbols.UI_ELEMENT_PREFIX + uipRef.uiElementName +
                    Symbols.UI_PROPERTY_REF_SEPARATOR + uipRef.property + Symbols.UI_ELEMENT_SUFFIX +
                    ' in ' + fileName + ' ' + locStr + '. Not supported yet.';
                ctx.warnings.push( new RuntimeException( msg ) );
                continue;
            }

            const uieName = uipRef.uiElementName;
            const [ featureName, uieNameWithoutFeature ] = uieNameHandler.extractNamesOf( uieName );
            let variable: string;
            let uie: UIElement;

            if ( isDefined( featureName ) ) {
                variable = uieName;
                uie = ctx.spec.uiElementByVariable( uieName );
            } else {
                uie = ctx.spec.uiElementByVariable( uieName, ctx.doc );
                variable = ! uie ? uieName : ( ! uie.info ? uieName : uie.info.fullVariableName );
            }
            // variable is in the format Feature:UIElement

            let value: EntityValueType = uieVariableToValueMap.get( variable );
            if ( ! isDefined( value ) ) {
                const fileName = ctx.doc.fileInfo ? basename( ctx.doc.fileInfo.path ) : 'unknown file';
                const locStr = '(' + step.location.line + ',' + step.location.column + ')';
                const msg = 'Could not retrieve a value from ' +
                    Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX +
                    ' in ' + fileName + ' ' + locStr + '. It will receive an empty value.';
                ctx.warnings.push( new RuntimeException( msg ) );
                value = '';
            }
            const formattedValue = formatValueToUseInASentence( value );
            const refStr: string = Symbols.UI_ELEMENT_PREFIX + uipRef.content + Symbols.UI_ELEMENT_SUFFIX;
            content = content.replace( refStr, formattedValue );
        }

        return content;
    }


}