import { Document } from '../../modules/ast/Document';
import { Feature } from '../../modules/ast/Feature';
import { Import } from '../../modules/ast/Import';
import { Language } from '../../modules/ast/Language';
import { LanguageParser } from '../../modules/parser/LanguageParser';
import { NodeIterator } from '../../modules/parser/NodeIterator';
import { ParsingContext } from '../../modules/parser/ParsingContext';
import { NodeTypes } from '../../modules/req/NodeTypes';

describe( 'LanguageParser', () => {

	it( 'cannot analyze an undefined context', () => {
		const p = new LanguageParser();
		const r = p.analyze(
			undefined,
			undefined,
			undefined,
			undefined
		);
		expect( r ).toBeFalsy();
	} );


	it( 'checks for more than one language declaration', () => {

		const node = {
			location: { line: 1, column: 1 },
			nodeType: NodeTypes.LANGUAGE,
			value: 'pt'
		} as Language;

		const nodes = [ node ];

		let it = new NodeIterator( nodes );

		const doc = {
			language: { ... node }
		} as Document;

		const p = new LanguageParser();
		const errors = [];
		const r = p.analyze(
			node,
			new ParsingContext( doc ),
			it,
			errors
		);

		expect( r ).toBeFalsy();
		expect( errors.length ).toEqual( 1 );
		expect( errors[ 0 ].message ).toMatch( /one language declaration/ );
	} );


	it( 'checks for an import declared before a language declaration', () => {

		const imp = {
			location: { line: 1, column: 1 },
			nodeType: NodeTypes.IMPORT,
			value: 'foo.feature'
		} as Import;

		const lang = {
			location: { line: 2, column: 1 },
			nodeType: NodeTypes.LANGUAGE,
			value: 'pt'
		} as Language;

		const nodes = [ imp, lang ];

		let it = new NodeIterator( nodes );

		const doc = {
			imports: [ imp ]
		} as Document;

		const p = new LanguageParser();
		const errors = [];
		const r = p.analyze(
			lang,
			new ParsingContext( doc ),
			it,
			errors
		);

		expect( r ).toBeFalsy();
		expect( errors.length ).toEqual( 1 );
		expect( errors[ 0 ].message ).toMatch( /language must be declared before an import/ );
	} );


	it( 'checks for an import declared before a feature declaration', () => {

		const feat = {
			location: { line: 1, column: 1 },
			nodeType: NodeTypes.FEATURE,
			name: 'Foo'
		} as Feature;

		const lang = {
			location: { line: 2, column: 1 },
			nodeType: NodeTypes.LANGUAGE,
			value: 'pt'
		} as Language;

		const nodes = [ feat, lang ];

		let it = new NodeIterator( nodes );

		const doc = {
			feature: { ... feat }
		} as Document;

		const p = new LanguageParser();
		const errors = [];
		const r = p.analyze(
			lang,
			new ParsingContext( doc ),
			it,
			errors
		);

		expect( r ).toBeFalsy();
		expect( errors.length ).toEqual( 1 );
		expect( errors[ 0 ].message ).toMatch( /language must be declared before a feature/ );
	} );

} );
