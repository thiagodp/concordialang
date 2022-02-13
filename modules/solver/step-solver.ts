import * as enumUtil from 'enum-util';

import { Location } from 'concordialang-types';
import { extractFeatureNameOf, makeVariableName } from 'modules/util/variable-reference';

import { Document, EntityValueType, Step, UIPropertyReference, UIPropertyTypes } from '../ast';
import { RuntimeException } from '../error';
import { LocatedException } from '../error/LocatedException';
import { LanguageDictionary } from '../language/LanguageDictionary';
import { Entities } from '../nlp/Entities';
import { Symbols } from '../req/Symbols';
import { UIEPropertyCache } from '../testdata/dtc/prop-cfg';
import { formatValueToUseInASentence, UIPropertyReferenceExtractor } from '../testscenario';
import { LocaleContext } from '../testscenario/LocaleContext';
import { ValueType } from '../util/ValueTypeDetector';
import { DocContext } from './doc-context';

async function replaceUIPropertyReferencesInsideValuesOfStep(
	step: Step,
	propertyCache: UIEPropertyCache,
	localeContext: LocaleContext,
	docContext: DocContext,
	languageDictionary: LanguageDictionary,
): Promise< void > {
	const extractor = new UIPropertyReferenceExtractor();
	const valueEntities = nlpUtil.entitiesNamed( Entities.VALUE, step.nlpResult );

	const contentBefore: string = step.content;

	// For all the values in the step
	for ( let entity of valueEntities ) {

		const before: string = entity.value;

		const references: UIPropertyReference[] =
			extractor.extractReferencesFromValue( before, step.location.line );

		const after: string = await replaceUIPropertyReferencesByTheirValue(
			before, references, localeContext, propertyCache, docContext, languageDictionary );

		if ( after == before ) {
			continue;
		}
		// Change the value of the step
		step.content = step.content.replace(
			Symbols.VALUE_WRAPPER + before + Symbols.VALUE_WRAPPER,
			Symbols.VALUE_WRAPPER + after + Symbols.VALUE_WRAPPER
			)
	}

	// Updates NLP if needed
	if ( contentBefore != step.content ) {
		variantSentenceRec.recognizeSentences(
			localeContext.language, [ step ], ctx.errors, ctx.warnings
		);
	}
}



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
async function replaceUIPropertyReferencesByTheirValue(
	content: string,
	uiePropertyReferences: UIPropertyReference[],
	// stepLocation: Location,
	localeContext: LocaleContext,
	propertyCache: UIEPropertyCache,
	docContext: DocContext,
	languageDictionary: LanguageDictionary,
	isAlreadyInsideAString: boolean = false
): Promise< string > {

	const { doc, errors } = docContext;
	let newContent = content;

	for ( let uipRef of uiePropertyReferences || [] ) {

		// TO-DO: move this to another place ---
		if ( uipRef.location && ! uipRef.location.filePath ) {
			uipRef.location.filePath = doc.fileInfo.path;
		}
		// ---

		const variable: string | null = makeVariableThatContainsFeatureName( uipRef.uiElementName, doc );
		if ( ! variable ) {
			const msg = `Referenced UI Element in "${uipRef.content}" was not found.`;
			errors.push( new RuntimeException( msg, uipRef.location ) );
			continue;
		}

		const propCfg = propertyCache.get( variable );
		if ( ! propCfg ) {
			const msg = `Referenced UI Element in "${uipRef.content}" has no valued properties.`;
			errors.push( new RuntimeException( msg, uipRef.location ) );
			continue;
		}

		let property = uipRef.property;

		// Checking the property
		if ( ! enumUtil.isValue( UIPropertyTypes, property ) ) {
			// Try to convert to a language-independent property. Example: 'valor' (pt) -> value
			property = languageIndependentProperty( property, languageDictionary );
			if ( ! property ) {
				const accepted: string = enumUtil.getValues( UIPropertyTypes ).join( ', ' );
				const msg = `Referenced UI Element property "${uipRef.property}" not found in "${doc.fileInfo.path}". Accepted values: ${accepted}.`;
				errors.push( new RuntimeException( msg, uipRef.location ) );
				continue;
			}
		}

		const prop = propCfg[ property ];
		if ( prop === null || prop === undefined ) {
			// const fileName = doc.fileInfo ? basename( doc.fileInfo.path ) : 'unknown file';
			// const locStr = '(' + stepLocation.line + ',' + stepLocation.column + ')';
			// const msg = 'Could not retrieve a value from ' +
			// 	Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX +
			// 	' in ' + fileName + ' ' + locStr + '. It will receive an empty value.';

			const msg = `Referenced property "${uipRef.content}" has no value.`;
			errors.push( new RuntimeException( msg, uipRef.location ) );
			continue;
		}

		const value: EntityValueType = prop.value;

		const valueType: ValueType = propCfg[ UIPropertyTypes.DATA_TYPE ].value;

		const uieLocale: string = propCfg[ UIPropertyTypes.LOCALE ]
			? propCfg[ UIPropertyTypes.LOCALE ].value || localeContext.language
			: localeContext.language;

		const uieLocaleFormat: string | null = propCfg[ UIPropertyTypes.LOCALE_FORMAT ]
			? propCfg[ UIPropertyTypes.LOCALE_FORMAT ].value
			: null;

		const uieLocaleContext = localeContext.clone()
			.withLocale( uieLocale )
			.withLocaleFormat( uieLocaleFormat );

		const formattedValue = await formatValueToUseInASentence(
			valueType, uieLocaleContext, value, isAlreadyInsideAString );

		const refStr: string = Symbols.UI_ELEMENT_PREFIX + uipRef.content + Symbols.UI_ELEMENT_SUFFIX;
		newContent = newContent.replace( refStr, formattedValue );
	}

	return newContent;
}



function makeVariableThatContainsFeatureName( uiElementName: string, doc: Document ): string | null {

	const featureName = extractFeatureNameOf( uiElementName );
	if ( featureName ) { // It has a Feature name
		return uiElementName;
	}

	if ( doc?.feature?.name ) { // Doc has Feature name, use it
		return makeVariableName( doc.feature.name, uiElementName );
	}

	return null;
}



function languageIndependentProperty( property: string, languageDictionary: LanguageDictionary ): string | null {
	// TO-DO: refactor magic values
	const langUIProperties = ( ( languageDictionary.nlp[ "ui" ] || {} )[ "ui_property" ] || {} );
	const uipRefProp = property.toLowerCase();
	for ( const prop in langUIProperties ) {
		const propValues = langUIProperties[ prop ] || [];
		if ( uipRefProp == prop || propValues.indexOf( uipRefProp ) >= 0 ) {
			return prop;
		}
	}
	return null;
}
