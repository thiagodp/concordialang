import { Symbols } from "../req/Symbols";

export type VariableExtractionResult = {
	feature?: string,
	uie: string,
	property?: string
};

/**
 * Extracts a UI Element and other references from a variable.
 * It may contain a Feature name and a Property reference.
 *
 * Accepted formats:
 * 1. "{UIE}"
 * 2. "{Feature:UIE}"
 * 3. "{Feature:UIE|property}"
 * 4. UIE
 * 5. Feature:UIE
 * 6. Feature:UIE|property
 *
 * @param variable Variable
 * @returns An object with the properties or `null` if it cannot extract them.
 */
export function extractVariableReferences( variable: string ): VariableExtractionResult | null {

	if ( ! variable ) {
		return null;
	}

	const v = variable
		.replace( Symbols.UI_ELEMENT_PREFIX, '' ) // Removes "{"
		.replace( Symbols.UI_ELEMENT_SUFFIX, '' ) // Removes "}"
		.trim();

	const [ feature, uiePlus ] = v.includes( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR )
		? v.split( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR ).map( s => s.trim() || undefined )
		: [ undefined, v ];

	if ( ! uiePlus ) {
		return null;
	}

	const [ uie, property ] = uiePlus.split( Symbols.UI_PROPERTY_REF_SEPARATOR ).map( s => s.trim() || undefined );

	if ( ! uie ) {
		return null;
	}

	return { feature, uie, property };
}


/**
 * Extracts the feature name a variable.
 *
 * Accepted formats:
 * 1. "{Feature:UIE}"
 * 2. "{Feature:UIE|property}"
 * 3. Feature:UIE
 * 4. Feature:UIE|property
 *
 * @param variable Variable
 * @returns A string or `null` if it cannot be extracted.
 */
export function extractFeatureNameOf( variable: string ): string | null {
	const r = extractVariableReferences( variable );
	return r?.feature || null;
}



/**
 * Makes a variable name from the given parameters.
 *
 * @param featureName Feature name (optional).
 * @param uiElementName UI Element name
 * @param surroundVariable If it should surround the variable with a variable symbol (brackets).
 */
 export function makeVariableName(
	featureName: string | null,
	uiElementName: string,
	surroundVariable: boolean = false
): string {
	let v = uiElementName;
	if ( featureName ) {
		v = featureName + Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR + v;
	}
	if ( surroundVariable ) {
		return Symbols.UI_ELEMENT_PREFIX + v + Symbols.UI_ELEMENT_SUFFIX;
	}
	return v;
}
