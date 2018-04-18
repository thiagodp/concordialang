import { PreTestCaseGenerator, GenContext } from "../../modules/testscenario/PreTestCaseGenerator";
import { SimpleCompiler } from "../../modules/util/SimpleCompiler";
import { Spec } from "../../modules/ast/Spec";
import { Document } from "../../modules/ast/Document";
import { FileInfo } from "../../modules/ast/FileInfo";
import { SpecFilter } from "../../modules/selection/SpecFilter";
import { BatchSpecificationAnalyzer } from "../../modules/semantic/BatchSpecificationAnalyzer";
import { LocatedException } from "../../modules/req/LocatedException";
import { Variant } from "../../modules/ast/Variant";
import { TestPlanMaker } from "../../modules/testcase/TestPlanMaker";
import { AllValidMix } from "../../modules/testcase/DataTestCaseMix";
import { SingleRandomOfEachStrategy } from "../../modules/selection/CombinationStrategy";

describe( 'PreTestCaseGeneratorTest', () => {

    let gen: PreTestCaseGenerator; // under test

    const LANGUAGE = 'pt';
    const SEED = 'concordia';
    let cp: SimpleCompiler;


    beforeEach( () => {
        cp = new SimpleCompiler( LANGUAGE );

        gen = new PreTestCaseGenerator(
            cp.langLoader,
            cp.language,
            SEED,
            cp.nlpRec.variantSentenceRec
        );
    } );

    afterEach( () => {
        cp = null;
        gen = null;
    } );


    it( 'replaces Constants by their values', async () => {

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
                'Constantes:',
                ' - "ipsum" é "ip!"',
                ' - "pi" é 3.14'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [],
        warnings: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        const testPlanMakers: TestPlanMaker[] = [
            new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        const preTestCases = gen.generate( variant1.sentences, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( preTestCases ).toHaveLength( 1 );

        const preTC = preTestCases[ 0 ];

        // Content + Comment
        const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com "ip!" # [ipsum]',
                'E eu preencho <b> com 3.14 # [pi]',
                'Então eu tenho ~foo~'
            ]
        );

    } );


    it( 'replaces UI Elements with values by their literals', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho {A} com "ip!"',
                '    E eu preencho {B} com 3.14',
                ' Então eu tenho ~foo~',
                'Elemento de IU: A',
                ' - id é "aa"',
                'Elemento de IU: B',
                ' - id é "bb"',
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [],
        warnings: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        const testPlanMakers: TestPlanMaker[] = [
            new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        const preTestCases = gen.generate( variant1.sentences, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( warnings ).toHaveLength( 0 );
        expect( preTestCases ).toHaveLength( 1 );

        const preTC = preTestCases[ 0 ];

        // Content + Comment
        const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );

        expect( lines ).toEqual(
            [
                'Quando eu preencho <aa> com "ip!" # {A}',
                'E eu preencho <bb> com 3.14 # {B}',
                'Então eu tenho ~foo~'
            ]
        );

    } );



    it( 'replaces UI Elements with Constants by their literals and values', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho {A} com [ipsum]',
                '    E eu preencho {B} com [pi]',
                ' Então eu tenho ~foo~',
                'Elemento de IU: A',
                ' - id é "aa"',
                'Elemento de IU: B',
                ' - id é "bb"',
                'Constantes:',
                ' - "ipsum" é "ip!"',
                ' - "pi" é 3.14',
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [],
        warnings: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        const testPlanMakers: TestPlanMaker[] = [
            new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        const preTestCases = gen.generate( variant1.sentences, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( warnings ).toHaveLength( 0 );
        expect( preTestCases ).toHaveLength( 1 );

        const preTC = preTestCases[ 0 ];

        // Content + Comment
        const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );

        expect( lines ).toEqual(
            [
                'Quando eu preencho <aa> com "ip!" # {A} [ipsum]',
                'E eu preencho <bb> com 3.14 # {B} [pi]',
                'Então eu tenho ~foo~'
            ]
        );

    } );

} );