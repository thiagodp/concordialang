import { basename } from 'path';

import { EntityValueType, Step, UIElement, UIPropertyReference, UIPropertyTypes } from '../ast';
import { Warning } from '../error/Warning';
import { Symbols } from '../req/Symbols';
import { isDefined, UIElementNameHandler, UIElementPropertyExtractor } from '../util';
import { removeDuplicated } from '../util/remove-duplicated';
import { LocaleContext } from './LocaleContext';
import { GenContext } from './PreTestCaseGenerator';
import { formatValueToUseInASentence } from './value-formatter';

/**
 * Replaces UIE property references.
 *
 * @author Thiago Delgado Pinto
 */
export class UIPropertyReferenceReplacer {

    /**
     * Returns the content with all the UIProperty references replaced by their value.
     *
     * @param localeContext Locale context.
     * @param step Input step.
     * @param content Input content.
     * @param uiePropertyReferences References to replace.
     * @param uieVariableToValueMap Map that contains the value of all UIElement variables.
     * @param ctx Generation context.
     * @param isAlreadyInsideAString Indicates if the value is already inside a string. Optional, defaults to `false`.
     */
    async replaceUIPropertyReferencesByTheirValue(
        localeContext: LocaleContext,
        step: Step,
        content: string,
        uiePropertyReferences: UIPropertyReference[],
        uieVariableToValueMap: Map< string, EntityValueType >,
        ctx: GenContext,
        isAlreadyInsideAString: boolean = false
    ): Promise< string > {

        const uieNameHandler = new UIElementNameHandler();
        const propExtractor = new UIElementPropertyExtractor();

        let newContent = content;

        for ( let uipRef of uiePropertyReferences || [] ) {

            // Properties different from VALUE are not supported yet
            if ( uipRef.property != UIPropertyTypes.VALUE ) {
                const fileName = ctx.doc.fileInfo ? basename( ctx.doc.fileInfo.path ) : 'unknown file';
                const locStr = '(' + step.location.line + ',' + step.location.column + ')';
                const msg = 'Could not retrieve a value from ' +
                    Symbols.UI_ELEMENT_PREFIX + uipRef.uiElementName +
                    Symbols.UI_PROPERTY_REF_SEPARATOR + uipRef.property + Symbols.UI_ELEMENT_SUFFIX +
                    ' in ' + fileName + ' ' + locStr + '. Not supported yet.';
                const err = new Warning( msg );
                ctx.warnings.push( err );
                continue;
            }

            const uieName = uipRef.uiElementName;
            const [ featureName, /* uieNameWithoutFeature */ ] = uieNameHandler.extractNamesOf( uieName );
            let variable: string;
            let uie: UIElement | null;

            if ( isDefined( featureName ) ) {
                variable = uieName;
                uie = ctx.spec.uiElementByVariable( uieName );
            } else {
                uie = ctx.spec.uiElementByVariable( uieName, ctx.doc );
                variable = ! uie ? uieName : ( ! uie.info ? uieName : uie.info.fullVariableName );
            }

            if ( ! uie ) {
                // TO-DO: add warning ?
                continue;
            }

            // variable is in the format Feature:UIElement

            let value: EntityValueType | undefined = uieVariableToValueMap.get( variable );
            if ( ! isDefined( value ) ) {
                const fileName = ctx.doc.fileInfo ? basename( ctx.doc.fileInfo.path ) : 'unknown file';
                const locStr = '(' + step.location.line + ',' + step.location.column + ')';
                const msg = 'Could not retrieve a value from ' +
                    Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX +
                    ' in ' + fileName + ' ' + locStr + '. It will receive an empty value.';
                const err = new Warning( msg );
                ctx.warnings.push( err );
                value = '';
            }

            const propertyMap = propExtractor.mapFirstPropertyOfEachType( uie );
            const valueType = propExtractor.guessDataType( propertyMap );

            const uieLocale: string = propExtractor.extractLocale( uie ) || localeContext.language;
            const uieLocaleFormat: string | null = propExtractor.extractLocaleFormat( uie );
            const uieLocaleContext = localeContext.clone()
                .withLocale( uieLocale )
                .withLocaleFormat( uieLocaleFormat );

            const formattedValue = await formatValueToUseInASentence(
                valueType, uieLocaleContext, value, isAlreadyInsideAString );

            const refStr: string = Symbols.UI_ELEMENT_PREFIX + uipRef.content + Symbols.UI_ELEMENT_SUFFIX;
            newContent = newContent.replace( refStr, formattedValue );
        }

        removeDuplicated( ctx.warnings, ( a, b ) => a.message == b.message );

        return newContent;
    }

}
