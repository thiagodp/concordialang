import { TagUtil } from "../../modules/util/TagUtil";
import { Tag } from "../../modules/ast/Tag";

describe( 'TagUtil', () => {

	it( 'filters the tag names that has the given keywords', () => {

		const [ t1, t2, t3 ]: Tag[] = [
			{
				name: 'foo'
			} as Tag,
			{
				name: 'bar'
			} as Tag,
			{
				name: 'foo'
			} as Tag,
		];

		const u = new TagUtil();
		const r = u.tagsWithNameInKeywords( [ t1, t2, t3 ], [ 'foo' ] );
		expect( r ).toEqual( [ t1, t3 ] );
	} );


	it( 'recognizes the content of the first tag', () => {

		const tag = {
			content: 'x'
		} as Tag;

		const u = new TagUtil();
		const r = u.contentOfTheFirstTag( [ tag ] );
		expect( r ).toEqual( 'x' );
	} );


	it( 'recognizes a numeric content of the first tag', () => {

		const tag = {
			content: '10'
		} as Tag;

		const u = new TagUtil();
		const r = u.numericContentOfTheFirstTag( [ tag ] );
		expect( r ).toEqual( 10 );
	} );


	it( 'recognizes an invalid numeric content of the first tag as null', () => {

		const tag = {
			content: 'x'
		} as Tag;

		const u = new TagUtil();
		const r = u.numericContentOfTheFirstTag( [ tag ] );
		expect( r ).toEqual( null );
	} );

} );
