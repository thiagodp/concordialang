
import { TSGen } from "../../modules/testscenario/TSGen";
import { TestScenario } from "../../modules/testscenario/TestScenario";
import { SimpleCompiler } from "../../modules/util/SimpleCompiler";
import { AllVariantsSelectionStrategy } from "../../modules/selection/VariantSelectionStrategy";
import { Variant } from "../../modules/ast/Variant";
import { Spec } from "../../modules/ast/Spec";
import { Document } from "../../modules/ast/Document";
import { LocatedException } from "../../modules/req/LocatedException";
import { BatchSpecificationAnalyzer } from "../../modules/semantic/BatchSpecificationAnalyzer";
import { SpecFilter } from "../../modules/selection/SpecFilter";
import { FileInfo } from "../../modules/ast/FileInfo";
import { CartesianProductStrategy } from "../../modules/selection/CombinationStrategy";
import { PreTestCaseGenerator, GenContext } from "../../modules/testscenario/PreTestCaseGenerator";


describe( 'TSGenTest', () => {

    let gen: TSGen = null; // under test

    let ptcGen: PreTestCaseGenerator;
    const LANGUAGE: string = 'pt';
    const SEED = 'concordia';

    let cp: SimpleCompiler;
    let variantToTestScenariosMap: Map< Variant, TestScenario[] >;
    let postconditionNameToVariantsMap: Map< string, Variant[] >;

    beforeEach( () => {
        cp = new SimpleCompiler( LANGUAGE );
        variantToTestScenariosMap = new Map< Variant, TestScenario[] >();
        postconditionNameToVariantsMap = new Map< string, Variant[] >();

        ptcGen = new PreTestCaseGenerator(
            cp.nlpRec.variantSentenceRec,
            cp.langLoader,
            cp.language,
            SEED,
        );

        gen = new TSGen(
            ptcGen,
            new AllVariantsSelectionStrategy(),
            new CartesianProductStrategy(),
            variantToTestScenariosMap,
            postconditionNameToVariantsMap
        );
    } );

    afterEach( () => {
        variantToTestScenariosMap = null;
        postconditionNameToVariantsMap = null;
        ptcGen = null;
        cp = null;
        gen = null;
    } );


    it( 'generates for a single Variant without preconditions', async () => {

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
        let errors: LocatedException[] = [];
        let warnings: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let ctx1 = new GenContext( spec, doc1, errors, warnings );
        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = await gen.generate( ctx1, variant1 );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );
    } );



    it( 'includes other TS based on precondition', async () => {

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
        let errors: LocatedException[] = [], warnings: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let ctx1 = new GenContext( spec, doc1, errors, warnings );
        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = await gen.generate( ctx1, variant1 );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );

        let ctx2 = new GenContext( spec, doc2, errors, warnings );
        let variant2: Variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let ts2 = await gen.generate( ctx2, variant2 );
        expect( errors ).toHaveLength( 0 );
        expect( ts2 ).toHaveLength( 1 );

        const expectedSteps: string[] = [
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"'
        ];

        const stepsContent: string[] = ts2[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( expectedSteps );
    } );



    it( 'gets an error when precondition requires a state not declared', async () => {

        let spec = new Spec( '.' );

        let doc: Document = cp.addToSpec( spec,
            [
                '#language:pt',
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
        let errors: LocatedException[] = [], warnings = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        let ctx = new GenContext( spec, doc, errors, warnings );

        let variant: Variant = doc.feature.scenarios[ 0 ].variants[ 0 ];
        let ts = await gen.generate( ctx, variant );
        expect( errors ).toHaveLength( 1 );
        expect( ts ).toHaveLength( 0 );
    } );



    it( 'replaces orfan postcondition AND steps with THEN', async () => {

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
                '   e eu vejo "foo"', // <<<<<<<<<<<<<<<<<<<<<<<<<
                'Constantes:',
                ' - "ipsum" é "ip!"',
                ' - "pi" é 3.14'
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
        let errors: LocatedException[] = [], warnings = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );
        let ctx1 = new GenContext( spec, doc1, errors, warnings );
        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = await gen.generate( ctx1, variant1 );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );

        let ctx2 = new GenContext( spec, doc2, errors, warnings );
        let variant2: Variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let ts2 = await gen.generate( ctx2, variant2 );
        expect( errors ).toHaveLength( 0 );
        expect( ts2 ).toHaveLength( 1 );

        const expectedSteps: string[] = [
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Então eu vejo "foo"', // <<<<<<<<<<<<<<<<<<<<<<<<<
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"'
        ];

        const stepsContent: string[] = ts2[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( expectedSteps );
    } );



    it( 'replaces orfan precondition AND steps with GIVEN', async () => {

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

        let doc2: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Import "doc1.feature"',
                'Feature: Feature 2',
                'Scenario: Bar',
                'Variant: Bar',
                '  Dado que eu tenho ~foo~',
                '    E eu vejo "bar"', // <<<<<<<<<<<<<<<<<<<<<<<<
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"',
                '  Então eu vejo "baz"'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [], warnings = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let ctx1 = new GenContext( spec, doc1, errors, warnings );
        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = await gen.generate( ctx1, variant1 );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );

        let ctx2 = new GenContext( spec, doc2, errors, warnings );
        let variant2: Variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let ts2 = await gen.generate( ctx2, variant2 );
        expect( errors ).toHaveLength( 0 );
        expect( ts2 ).toHaveLength( 1 );

        const expectedSteps: string[] = [
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Dado que eu vejo "bar"', // <<<<<<<<<<<<<<<<<<
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"',
            'Então eu vejo "baz"'
        ];

        const stepsContent: string[] = ts2[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( expectedSteps );
    } );



    it( 'replaces state calls', async () => {

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

        let doc2: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Import "doc1.feature"',
                'Feature: Feature 2',
                'Scenario: Bar',
                'Variant: Bar',
                '  Dado que eu vejo "bar"',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"',
                '    E eu tenho ~foo~',
                '  Então eu vejo "baz"'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [], warnings = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let ctx1 = new GenContext( spec, doc1, errors, warnings );
        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = await gen.generate( ctx1, variant1 );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );

        let ctx2 = new GenContext( spec, doc2, errors, warnings );
        let variant2: Variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let ts2 = await gen.generate( ctx2, variant2 );
        expect( errors ).toHaveLength( 0 );
        expect( ts2 ).toHaveLength( 1 );

        const expectedSteps: string[] = [
            'Dado que eu vejo "bar"',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"',
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Então eu vejo "baz"'
        ];

        const stepsContent: string[] = ts2[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( expectedSteps );
    } );



    it( 'includes preconditions of preconditions', async () => {

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

        let doc2: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Import "doc1.feature"',
                'Feature: Feature 2',
                'Scenario: Bar',
                'Variant: Bar',
                '  Dado que eu tenho ~foo~',
                '    E eu vejo "bar"',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"',
                '  Então eu vejo "baz"',
                '    e eu tenho ~bar~'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        let doc3: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Import "doc2.feature"',
                'Feature: Feature 3',
                'Scenario: Zoo',
                'Variant: Zoo',
                '  Dado que eu tenho ~bar~',
                '    E eu vejo "zoo"',
                '  Quando eu preencho <x> com "x"',
                '    E eu preencho <y> com "Y"',
                '  Então eu vejo "zoo"'
            ],
            { path: 'doc3.feature', hash: 'doc3' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [], warnings = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let ctx1 = new GenContext( spec, doc1, errors, warnings );
        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = await gen.generate( ctx1, variant1 );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );

        let ctx2 = new GenContext( spec, doc2, errors, warnings );
        let variant2: Variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let ts2 = await gen.generate( ctx2, variant2 );
        expect( errors ).toHaveLength( 0 );
        expect( ts2 ).toHaveLength( 1 );

        let ctx3 = new GenContext( spec, doc3, errors, warnings );
        let variant3: Variant = doc3.feature.scenarios[ 0 ].variants[ 0 ];
        let ts3 = await gen.generate( ctx3, variant3 );
        expect( errors ).toHaveLength( 0 );
        expect( ts3 ).toHaveLength( 1 );

        const expectedSteps: string[] = [
            'Quando eu preencho <a> com "ip!"',
            'E eu preencho <b> com 3.14',
            'Dado que eu vejo "bar"',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"',
            'Então eu vejo "baz"',
            'Dado que eu vejo "zoo"',
            'Quando eu preencho <x> com "x"',
            'E eu preencho <y> com "Y"',
            'Então eu vejo "zoo"'
        ];

        const stepsContent: string[] = ts3[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( expectedSteps );
    } );



    it( 'does not include preconditions of state calls', async () => {

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

        let doc2: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Import "doc1.feature"',
                'Feature: Feature 2',
                'Scenario: Bar',
                'Variant: Bar',
                '  Dado que eu tenho ~foo~',
                '    E eu vejo "bar"',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"',
                '  Então eu vejo "baz"',
                '    e eu tenho ~bar~'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        let doc3: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Import "doc2.feature"',
                'Feature: Feature 3',
                'Scenario: Zoo',
                'Variant: Zoo',
                '  Dado que eu vejo "zoo"',
                '  Quando eu tenho ~bar~', // <<<
                '    E eu preencho <x> com "x"',
                '    E eu preencho <y> com "Y"',
                '  Então eu vejo "zoo"'
            ],
            { path: 'doc3.feature', hash: 'doc3' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [], warnings = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let ctx1 = new GenContext( spec, doc1, errors, warnings );
        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = await gen.generate( ctx1, variant1 );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );

        let ctx2 = new GenContext( spec, doc2, errors, warnings );
        let variant2: Variant = doc2.feature.scenarios[ 0 ].variants[ 0 ];
        let ts2 = await gen.generate( ctx2, variant2 );
        expect( errors ).toHaveLength( 0 );
        expect( ts2 ).toHaveLength( 1 );

        let ctx3 = new GenContext( spec, doc3, errors, warnings );
        let variant3: Variant = doc3.feature.scenarios[ 0 ].variants[ 0 ];
        let ts3 = await gen.generate( ctx3, variant3 );
        expect( errors ).toHaveLength( 0 );
        expect( ts3 ).toHaveLength( 1 );

        const expectedSteps: string[] = [
            'Dado que eu vejo "zoo"', // 1st original
            'Dado que eu vejo "bar"',
            'Quando eu preencho <c> com "c"',
            'E eu preencho <d> com "d"',
            'Então eu vejo "baz"',
            'Quando eu preencho <x> com "x"', // 2nd original
            'E eu preencho <y> com "Y"',
            'Então eu vejo "zoo"'
        ];

        const stepsContent: string[] = ts3[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( expectedSteps );
    } );

} );