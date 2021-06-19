
type TextMatch = {
	value: string,
	index: number,
	rating: number
};

/**
 * Returns the best match of a text compared to a list.
 *
 * @param text Text to compare.
 * @param values Values to compare.
 * @param comparingFunction Comparing function.
 */
export function bestMatch(
	text: string,
	values: string[],
	comparingFunction: ( a: string, b: string ) => number
): TextMatch | null {
	const matches = sortedMatches( text, values, comparingFunction );
	const [ first ] = matches;
	return first || null;
}

/**
 * Returns a list of matches sorted by rating (descending).
 *
 * @param text Text to compare.
 * @param values Values to compare.
 * @param comparingFunction Comparing function.
 */
export function sortedMatches(
	text: string,
	values: string[],
	comparingFunction: ( a: string, b: string ) => number
): TextMatch[] {

	if ( ! text || ! values || values.length < 1 || ! comparingFunction ) {
		return [];
	}

	return values
		.map( ( v, i ) => ({ value: v, index: i, rating: comparingFunction( text, v ) }) )
		.sort( ( a, b ) => b.rating - a.rating );
}
