import * as fs from 'fs';
import { resolve, join } from 'path';
import { Options } from '../../modules/app/Options';
import { Document } from '../../modules/ast/Document';
import { FileInfo } from "../../modules/ast/FileInfo";
import { JsonLanguageContentLoader, LanguageContentLoader } from '../../modules/language';
import { Lexer } from '../../modules/lexer/Lexer';
import { Parser } from '../../modules/parser/Parser';
import { AugmentedSpec } from '../../modules/req/AugmentedSpec';
import { SpecFilter } from '../../modules/selection/SpecFilter';
import { FeatureSSA } from '../../modules/semantic/FeatureSSA';
import { FSFileHandler } from '../../modules/util/file/FSFileHandler';
import { FileProblemMapper } from '../../modules/error/FileProblemMapper';
import { BatchSpecificationAnalyzer } from "../../modules/semantic/BatchSpecificationAnalyzer";

import { SimpleCompiler } from "../SimpleCompiler";

describe( 'FeatureSSA', () => {

	let analyzer: FeatureSSA; // under test

    const path = __dirname;
    let cp: SimpleCompiler;


    beforeEach( () => {
        analyzer = new FeatureSSA();
        cp = new SimpleCompiler();
    } );

    afterEach( () => {
        cp = null;
        analyzer = null;
    } );


    it( 'does not criticize when everything is ok', async () => {

		const spec = new AugmentedSpec( path );

		await cp.addToSpec(
			spec,
			[
				'feature: my feature 1',
			],
			{ path: join( path, 'feature1.feature' ) } as FileInfo
		);

        await cp.addToSpec(
			spec,
			[
				'feature: my feature 2',
			],
			{ path: join( path, 'feature2.feature' ) } as FileInfo
		);

        const graph = ( new SpecFilter( spec ) ).graph();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, graph );
        const errors = problems.getAllErrors();

        expect( errors ).toHaveLength( 0 );
    } );


    it( 'criticizes duplicated names', async () => {

		const spec = new AugmentedSpec( path );

		await cp.addToSpec(
			spec,
			[
				'feature: my feature 1',
			],
			{ path: join( path, 'feature1.feature' ) } as FileInfo
		);

        await cp.addToSpec(
			spec,
			[
				'feature: my feature 1',
			],
			{ path: join( path, 'feature2.feature' ) } as FileInfo
		);

        const graph = ( new SpecFilter( spec ) ).graph();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, graph );
        const errors = problems.getAllErrors();
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
	} );


    it( 'detect all references', async () => {

        const spec = new AugmentedSpec( path );

        const mydbPath = join( __dirname, '../db/users.json' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Constantes:',
                ' - "ipsum" é "ipsum_lorem"',
                ' - "pi" é 3.1416',
                'Elemento de IU: zoo',
                'Banco de Dados: mydb',
                ' - tipo é "json"',
                ' - caminho é "' + mydbPath + '"'
            ],
            { path: join( path, 'feature1.feature' ) } as FileInfo
        );

        let doc2: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'import "feature1.feature"',
                '',
                'Feature: Feature 2',
                'Cenário: Cenário 1',
                'Elemento de IU: foo',
                'Elemento de IU: bar',
                ' - comprimento mínimo é [x]',
                ' - comprimento máximo é [pi]',
                ' - valor vem de "SELECT * FROM [mydb].[ipsum] WHERE name = {foo} OR name = {Feature 1:zoo}"',
                'Constantes:',
                ' - "x" é 2',
            ],
            { path: join( path, 'feature2.feature' ) } as FileInfo
        );

        // console.log( spec.constantNames() );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        expect( errors ).toEqual( [] );

        const mydb = doc1.databases[ 0 ];

        const ipsum = doc1.constantBlock.items[ 0 ];
        const pi = doc1.constantBlock.items[ 1 ];
        const x = doc2.constantBlock.items[ 0 ];

        const zoo = doc1.feature.uiElements[ 0 ];
        const foo = doc2.feature.uiElements[ 0 ];
        const bar = doc2.feature.uiElements[ 1 ];

        expect( bar.items[ 0 ].value.references[ 0 ] ).toEqual( x );
        expect( bar.items[ 1 ].value.references[ 0 ] ).toEqual( pi );
        expect( bar.items[ 2 ].value.references[ 0 ] ).toEqual( mydb );
        expect( bar.items[ 2 ].value.references[ 1 ] ).toEqual( ipsum );
        expect( bar.items[ 2 ].value.references[ 2 ] ).toEqual( foo );
        expect( bar.items[ 2 ].value.references[ 3 ] ).toEqual( zoo );
    } );


} );
