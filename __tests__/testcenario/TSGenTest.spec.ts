import { TSGen, TestScenario } from "../../modules/testscenario/TSGen";
import { SimpleCompiler } from "../../modules/util/SimpleCompiler";
import { AllVariantsSelectionStrategy } from "../../modules/testscenario/VariantSelectionStrategy";
import { Variant } from "../../modules/ast/Variant";
import { Spec } from "../../modules/ast/Spec";
import { Document } from "../../modules/ast/Document";
import { LocatedException } from "../../modules/req/LocatedException";
import { BatchSpecificationAnalyzer } from "../../modules/semantic/BatchSpecificationAnalyzer";
import { SpecFilter } from "../../modules/selection/SpecFilter";
import { FileInfo } from "../../modules/ast/FileInfo";

describe( 'TSGenTest', () => {

    let gen: TSGen = null; // under test

    const LANGUAGE: string = 'pt';

    let cp: SimpleCompiler;
    let variantToTestScenariosMap: Map< Variant, TestScenario[] >;
    let postconditionNameToVariantsMap: Map< string, Variant[] >;

    beforeEach( () => {
        cp = new SimpleCompiler( LANGUAGE );
        variantToTestScenariosMap = new Map< Variant, TestScenario[] >();
        postconditionNameToVariantsMap = new Map< string, Variant[] >();

        gen = new TSGen(
            cp.langLoader,
            cp.language,
            new AllVariantsSelectionStrategy(),
            variantToTestScenariosMap,
            postconditionNameToVariantsMap,
            'myseed'
        );
    } );

    afterEach( () => {
        gen = null;
        cp = null;
        variantToTestScenariosMap = null;
        postconditionNameToVariantsMap = null;
    } );


    it( 'generates test scenario of a single Variant', async () => {


        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]',
                ' Então eu tenho ~foo~'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = gen.generate( LANGUAGE, variant1, errors );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );
    } );



    it( 'generates test scenario that includes other Variant', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]',
                ' Então eu tenho ~foo~'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        let doc2: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Import "doc1.feature"',
                'Feature: Feature 2',
                'Scenario: Bar',
                'Variant: Bar',
                '  Dado que eu tenho ~foo~',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = gen.generate( LANGUAGE, variant1, errors );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );

        let variant2: Variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let ts2 = gen.generate( LANGUAGE, variant2, errors );
        expect( errors ).toHaveLength( 0 );
        expect( ts2 ).toHaveLength( 1 );

        const expectedSteps: string[] = [
            'Quando eu preencho <a> com [ipsum]',
            'E eu preencho <b> com [pi]',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"'
        ];

        const stepsContent: string[] = ts2[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( expectedSteps );
    } );



    it( 'generates test scenario that replaces orfan AND with THEN', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]',
                ' Então eu tenho ~foo~',
                '   e eu vejo "foo"' // <<<<<<<<<<<<<<<<<<<<<<<<<
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        let doc2: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Import "doc1.feature"',
                'Feature: Feature 2',
                'Scenario: Bar',
                'Variant: Bar',
                '  Dado que eu tenho ~foo~',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = gen.generate( LANGUAGE, variant1, errors );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );

        let variant2: Variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let ts2 = gen.generate( LANGUAGE, variant2, errors );
        expect( errors ).toHaveLength( 0 );
        expect( ts2 ).toHaveLength( 1 );

        const expectedSteps: string[] = [
            'Quando eu preencho <a> com [ipsum]',
            'E eu preencho <b> com [pi]',
            'Então eu vejo "foo"', // <<<<<<<<<<<<<<<<<<<<<<<<<
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"'
        ];

        const stepsContent: string[] = ts2[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( expectedSteps );
    } );

} );