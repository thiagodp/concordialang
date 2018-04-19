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
import { AllValidMix, JustOneInvalidMix } from "../../modules/testcase/DataTestCaseMix";
import { SingleRandomOfEachStrategy, IndexOfEachStrategy } from "../../modules/selection/CombinationStrategy";
import { RandomString } from "../../modules/testdata/random/RandomString";
import { Random } from "../../modules/testdata/random/Random";
import { LongLimits } from "../../modules/testdata/limits/LongLimits";

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
        const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
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
        const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
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
        const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
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


    it( 'fills UI Literals without value with random value', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho <a>',
                '    E eu preencho <b> com "foo"',
                '    E eu preencho <c>',
                ' Então eu tenho ~foo~',
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
        const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( preTestCases ).toHaveLength( 1 );

        const preTC = preTestCases[ 0 ];

        // Content + Comment
        const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );

        const rand = new RandomString( new Random( SEED ) );
        const value1 = rand.between( gen.minRandomStringSize, gen.maxRandomStringSize );
        const value2 = rand.between( gen.minRandomStringSize, gen.maxRandomStringSize );
        const comment = '# válido: aleatório';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com "' + value1 + '" ' + comment,
                'E eu preencho <b> com "foo"',
                'E eu preencho <c> com "' + value2 + '" ' + comment,
                'Então eu tenho ~foo~'
            ]
        );

    } );



    it( 'fills UI Elements without value with generated value', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho {A}',
                '    E eu preencho <b> com "foo"',
                '    E eu preencho {C}',
                ' Então eu tenho ~foo~',
                'Elemento de IU: A',
                'Elemento de IU: C'
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
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanMaker( new AllValidMix(), new IndexOfEachStrategy( 1 ) )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( preTestCases ).toHaveLength( 1 );

        const preTC = preTestCases[ 0 ];

        // Content + Comment
        const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        const value1 = '';
        const value2 = '';
        const comment = '# válido: obrigatório não preenchido';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com "' + value1 + '" ' + comment,
                'E eu preencho <b> com "foo"',
                'E eu preencho <c> com "' + value2 + '" ' + comment,
                'Então eu tenho ~foo~'
            ]
        );

    } );



    it( 'separates UI literals and UI Elements', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho {A}, <b>, {C} e <d>',
                '  Então eu tenho ~foo~',
                'Elemento de IU: A',
                'Elemento de IU: C'
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
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanMaker( new AllValidMix(), new IndexOfEachStrategy( 1 ) )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( preTestCases ).toHaveLength( 1 );

        const preTC = preTestCases[ 0 ];

        // Content + Comment
        const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        const value1 = '';
        const value2 = '';
        const commentValue = '# válido: obrigatório não preenchido';
        const randStr = new RandomString( new Random( SEED ) );
        const random1 = randStr.between( gen.minRandomStringSize, gen.maxRandomStringSize );
        const random2 = randStr.between( gen.minRandomStringSize, gen.maxRandomStringSize );
        const commentRandom = '# válido: aleatório';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com "' + value1 + '" ' + commentValue,
                'E eu preencho <b> com "' + random1 + '" ' + commentRandom,
                'E eu preencho <c> com "' + value2 + '" ' + commentValue,
                'E eu preencho <d> com "' + random2 + '" ' + commentRandom,
                'Então eu tenho ~foo~'
            ]
        );

    } );



    it( 'generates invalid values and oracles based on UI Element properties', async () => {

        let spec = new Spec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho {A}',
                '    E eu preencho <b> com "foo"',
                ' Então eu devo ver "x"',
                'Elemento de IU: A',
                ' - valor mínimo é 5',
                '   Caso contrário, eu devo ver a mensagem "bar"' // <<< oracle
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
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanMaker( new JustOneInvalidMix(), new IndexOfEachStrategy( 0 ) )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( preTestCases ).toHaveLength( 1 );

        const preTC = preTestCases[ 0 ];

        // Content + Comment
        const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        const value1 = LongLimits.MIN;
        const comment = '# inválido: menor valor aplicável';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com "' + value1 + '" ' + comment,
                'E eu preencho <b> com "foo"',
                'Então eu devo ver "x"'
            ]
        );

        // Content + Comment
        const oracleLines = preTC.oracles.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        expect( oracleLines ).toEqual( [
            'Então, eu devo ver a mensagem "bar"' // << Otherwise is replaced by Then
        ] );

    } );


} );