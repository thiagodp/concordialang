import { Document, FileInfo, TestCase, Variant } from "../../modules/ast";
import { FileProblemMapper } from "../../modules/error";
import { LocatedException } from "../../modules/error/LocatedException";
import { AugmentedSpec } from "../../modules/req/AugmentedSpec";
import { IndexOfEachStrategy } from "../../modules/selection/CombinationStrategy";
import { SpecFilter } from "../../modules/selection/SpecFilter";
import { BatchSpecificationAnalyzer } from "../../modules/semantic2/BatchSpecificationAnalyzer";
import { JustOneInvalidMix, UnfilteredMix } from "../../modules/testcase/DataTestCaseMix";
import { TCGen } from "../../modules/testcase/TCGen";
import { TestPlanner } from "../../modules/testcase/TestPlanner";
import { LongLimits } from "../../modules/testdata/limits/LongLimits";
import { GenContext, PreTestCaseGenerator } from "../../modules/testscenario/PreTestCaseGenerator";
import { TestScenario } from "../../modules/testscenario/TestScenario";
import { SimpleCompiler } from "../SimpleCompiler";

describe( 'TCGen', () => {

    let gen: TCGen; // under test

    const LANGUAGE = 'pt';
    const SEED = 'concordia';
    let preTCGen: PreTestCaseGenerator;
    let cp: SimpleCompiler;


    beforeEach( () => {
        cp = new SimpleCompiler( LANGUAGE );

        preTCGen = new PreTestCaseGenerator(
            cp.nlpRec.variantSentenceRec,
            cp.langLoader,
            cp.language,
            SEED
        );

        gen = new TCGen( preTCGen );
    } );

    afterEach( () => {
        cp = null;
        preTCGen = null;
        gen = null;
    } );


    it( 'generates invalid values and oracles based on UI Element properties', async () => {

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
                'Variante: Foo',
                '  Quando eu preencho {A}',
                '    E eu preencho <b> com "foo"',
                '  Então eu devo ver "x"',
                '',
                'Elemento de IU: A',
                ' - valor mínimo é 5',
                '   Caso contrário, eu devo ver a mensagem "bar"' // <<< oracle
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        const testPlanMakers: TestPlanner[] = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner( new JustOneInvalidMix(), new IndexOfEachStrategy( 0 ), SEED )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];

        let ts = new TestScenario();
        ts.steps = variant1.sentences;

        const testCases = await gen.generate( ts, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( testCases ).toHaveLength( 1 );

        const tc: TestCase = testCases[ 0 ];

        // Content + Comment
        const lines = tc.sentences.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        const value1 = LongLimits.MIN;
        const comment = '# {A}, inválido: menor valor aplicável';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com ' + value1 + ' ' + comment,
                'E eu preencho <b> com "foo"',
                'Então eu devo ver a mensagem "bar" # de <a>' // << Then replaced with the oracle
            ]
        );

        expect( tc.shouldFail ).toBeFalsy();

    } );


    it( 'indicates that it should fail when one of two UI Elements receives an invalid value but it does not have an oracle', async () => {

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
                'Variante: Foo',
                '  Quando eu preencho {A}',
                '    E eu preencho {B}',
                '    E eu preencho <c> com "foo"',
                '  Então eu devo ver "x"',
                '',
                'Elemento de IU: A',
                ' - valor mínimo é 5',
                '   Caso contrário, eu devo ver a mensagem "bar"', // <<< oracle
                '',
                'Elemento de IU: B',
                ' - valor mínimo é 5' // <<< no oracle
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        const testPlanMakers: TestPlanner[] = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner( new UnfilteredMix, new IndexOfEachStrategy( 0 ), SEED )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];

        let ts = new TestScenario();
        ts.steps = variant1.sentences;

        const testCases = await gen.generate( ts, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( testCases ).not.toHaveLength( 0 );

        const tc: TestCase = testCases[ 0 ];

        // Content + Comment
        const lines = tc.sentences.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        const value1 = LongLimits.MIN;
        const comment1 = '# {A}, inválido: menor valor aplicável';
        const value2 = LongLimits.MIN;
        const comment2 = '# {B}, inválido: menor valor aplicável';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com ' + value1 + ' ' + comment1,
                'E eu preencho <b> com ' + value2 + ' ' + comment2,
                'E eu preencho <c> com "foo"',
                'Então eu devo ver a mensagem "bar" # de <a>' // << Then replaced with the oracle
            ]
        );

        expect( tc.shouldFail ).toBeTruthy();

    } );


    it( 'indicates that it should fail when one of three UI Elements receives an invalid value but it does not have an oracle', async () => {

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
                'Variante: Foo',
                '  Quando eu preencho {A}',
                '    E eu preencho {B}',
                '    E eu preencho {C}',
                '    E eu preencho <d> com "foo"',
                '  Então eu devo ver "x"',
                '',
                'Elemento de IU: A',
                ' - valor mínimo é 5',
                '   Caso contrário, eu devo ver a mensagem "bar"', // <<< oracle
                '',
                'Elemento de IU: B',
                ' - valor mínimo é 5',
                '   Caso contrário, eu devo ver a mensagem "zoo"', // <<< oracle
                '',
                'Elemento de IU: C',
                ' - valor mínimo é 5' // <<< no oracle
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        const testPlanMakers: TestPlanner[] = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner( new UnfilteredMix, new IndexOfEachStrategy( 0 ), SEED )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];

        let ts = new TestScenario();
        ts.steps = variant1.sentences;

        const testCases = await gen.generate( ts, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( testCases ).not.toHaveLength( 0 );

        const tc: TestCase = testCases[ 0 ];

        // Content + Comment
        const lines = tc.sentences.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        const valueA = LongLimits.MIN;
        const commentA = '# {A}, inválido: menor valor aplicável';
        const valueB = LongLimits.MIN;
        const commentB = '# {B}, inválido: menor valor aplicável';
        const valueC = LongLimits.MIN;
        const commentC = '# {C}, inválido: menor valor aplicável';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com ' + valueA + ' ' + commentA,
                'E eu preencho <b> com ' + valueB + ' ' + commentB,
                'E eu preencho <c> com ' + valueC + ' ' + commentC,
                'E eu preencho <d> com "foo"',
                'Então eu devo ver a mensagem "bar" # de <a>', // << Then replaced with the oracle
                'E eu devo ver a mensagem "zoo" # de <b>' // << Then replaced with the oracle
            ]
        );

        expect( tc.shouldFail ).toBeTruthy();
    } );


    it( 'indicates that should fail when no Otherwise is declared and has Then sentence without state', async () => {

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho {A}',
                '    E eu preencho <b> com "foo"',
                ' Então eu devo ver "x"',
                'Elemento de IU: A',
                ' - valor mínimo é 5'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        const testPlanMakers: TestPlanner[] = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner( new JustOneInvalidMix(), new IndexOfEachStrategy( 0 ), SEED )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];

        let ts = new TestScenario();
        ts.steps = variant1.sentences;

        const testCases = await gen.generate( ts, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( testCases ).toHaveLength( 1 );

        const tc: TestCase = testCases[ 0 ];

        // Content + Comment
        const lines = tc.sentences.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        const value1 = LongLimits.MIN;
        const comment = '# {A}, inválido: menor valor aplicável';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com ' + value1 + ' ' + comment,
                'E eu preencho <b> com "foo"',
                'Então eu devo ver "x"' // << same Then statement
            ]
        );

        expect( tc.shouldFail ).toBeTruthy();

        // ---

        // let docGen = new TCDocGen( '.testcase' );
        // let newDoc = docGen.generate( doc1, testCases );
        // let linesGen = new TestCaseFileGenerator( cp.langLoader, cp.language );
        // let fileLines = linesGen.createLinesFromDoc( newDoc, errors );
        // console.log( fileLines );

    } );

} );