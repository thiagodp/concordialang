import { UIElementSSA } from "../../modules/semantic/UIElementSSA";
import { SimpleCompiler } from "../../modules/util/SimpleCompiler";
import { Spec } from "../../modules/ast/Spec";
import { Document } from "../../modules/ast/Document";
import { SpecFilter } from "../../modules/selection/SpecFilter";
import { BatchSpecificationAnalyzer } from "../../modules/semantic/BatchSpecificationAnalyzer";
import { LocatedException } from "../../modules/req/LocatedException";
import { FileInfo } from "../../modules/ast/FileInfo";
import { join } from 'path';

describe( 'UIElementSSATest', () => {

    let sa: UIElementSSA; // under test

    let cp: SimpleCompiler;


    beforeEach( () => {
        sa = new UIElementSSA();
        cp = new SimpleCompiler();
    } );

    afterEach( () => {
        cp = null;
        sa = null;
    } );


    it( 'detect all references', async () => {

        let spec = new Spec( './' );

        const mydbPath = join( __dirname, '../db/users.json' );

        let doc1: Document = cp.addToSpec( spec,
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
            { path: 'feature1.feature' } as FileInfo
        );

        let doc2: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Import "feature1.feature"',
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
            { path: 'feature2.feature' } as FileInfo
        );

        // console.log( spec.constantNames() );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

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