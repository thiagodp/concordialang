import { Document, FileInfo, Variant } from "../../modules/ast";
import { FileProblemMapper } from "../../modules/error";
import { AugmentedSpec } from "../../modules/req/AugmentedSpec";
import { CartesianProductStrategy } from "../../modules/selection/CombinationStrategy";
import { SpecFilter } from "../../modules/selection/SpecFilter";
import { AllVariantsSelectionStrategy } from "../../modules/selection/VariantSelectionStrategy";
import { BatchSpecificationAnalyzer } from "../../modules/semantic/BatchSpecificationAnalyzer";
import { GenContext, PreTestCaseGenerator } from "../../modules/testscenario/PreTestCaseGenerator";
import { TestScenario } from "../../modules/testscenario/TestScenario";
import { TestScenarioGenerator } from "../../modules/testscenario/TestScenarioGenerator";
import { SimpleCompiler } from "../SimpleCompiler";

describe( 'TestScenarioGenerator', () => {

    let gen: TestScenarioGenerator = null; // under test

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

        gen = new TestScenarioGenerator(
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

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
                'Variante: Foo',
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
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        let ctx1 = new GenContext( spec, doc1, errors, warnings );
        let variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        let ts1 = await gen.generate( ctx1, variant1 );
        expect( errors ).toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );
    } );



    it( 'includes other TS based on precondition', async () => {

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
                'Variante: Foo',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]',
                ' Então eu tenho ~foo~',
                'Constantes:',
                ' - "ipsum" é "ip!"',
                ' - "pi" é 3.14'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        let doc2: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Importe "doc1.feature"',
                'Funcionalidade: Feature 2',
                'Cenário: Bar',
                'Variante: Bar',
                '  Dado que eu tenho ~foo~',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

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


    it( 'replaces orphan postcondition AND steps with THEN', async () => {

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
                'Variante: Foo',
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

        let doc2: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Importe "doc1.feature"',
                'Funcionalidade: Feature 2',
                'Cenário: Bar',
                'Variante: Bar',
                '  Dado que eu tenho ~foo~',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

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



    it( 'replaces orphan precondition AND steps with GIVEN', async () => {

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
                'Variante: Foo',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]',
                ' Então eu tenho ~foo~',
                'Constantes:',
                ' - "ipsum" é "ip!"',
                ' - "pi" é 3.14'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        let doc2: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Importe "doc1.feature"',
                'Funcionalidade: Feature 2',
                'Cenário: Bar',
                'Variante: Bar',
                '  Dado que eu tenho ~foo~',
                '    E eu vejo "bar"', // <<<<<<<<<<<<<<<<<<<<<<<<
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"',
                '  Então eu vejo "baz"'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

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

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
                'Variante: Foo',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]',
                ' Então eu tenho ~foo~',
                'Constantes:',
                ' - "ipsum" é "ip!"',
                ' - "pi" é 3.14'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        let doc2: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Importe "doc1.feature"',
                'Funcionalidade: Feature 2',
                'Cenário: Bar',
                'Variante: Bar',
                '  Dado que eu vejo "bar"',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"',
                '    E eu tenho ~foo~',
                '  Então eu vejo "baz"'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

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

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
                'Variante: Foo',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]',
                ' Então eu tenho ~foo~',
                'Constantes:',
                ' - "ipsum" é "ip!"',
                ' - "pi" é 3.14'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        let doc2: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Importe "doc1.feature"',
                'Funcionalidade: Feature 2',
                'Cenário: Bar',
                'Variante: Bar',
                '  Dado que eu tenho ~foo~',
                '    E eu vejo "bar"',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"',
                '  Então eu vejo "baz"',
                '    e eu tenho ~bar~'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        let doc3: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Importe "doc2.feature"',
                'Funcionalidade: Feature 3',
                'Cenário: Zoo',
                'Variante: Zoo',
                '  Dado que eu tenho ~bar~',
                '    E eu vejo "zoo"',
                '  Quando eu preencho <x> com "x"',
                '    E eu preencho <y> com "Y"',
                '  Então eu vejo "zoo"'
            ],
            { path: 'doc3.feature', hash: 'doc3' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

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

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: Feature 1',
                'Cenário: Foo',
				'Variante: Foo',
				'  Dado que eu estou em "https://foo.com"',
                '  Quando eu preencho <a> com [ipsum]',
                '    E eu preencho <b> com [pi]',
                ' Então eu tenho ~foo~',
                'Constantes:',
                ' - "ipsum" é "ip!"',
                ' - "pi" é 3.14'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        let doc2: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Importe "doc1.feature"',
                'Funcionalidade: Feature 2',
                'Cenário: Bar',
                'Variante: Bar',
                '  Dado que eu tenho ~foo~',
                '    E eu vejo "bar"',
                '  Quando eu preencho <c> com "c"',
                '    E eu preencho <d> com "d"',
                '  Então eu vejo "baz"',
                '    e eu tenho ~bar~'
            ],
            { path: 'doc2.feature', hash: 'doc2' } as FileInfo
        );

        let doc3: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Importe "doc2.feature"',
                'Funcionalidade: Feature 3',
                'Cenário: Zoo',
                'Variante: Zoo',
                '  Dado que eu vejo "zoo"',
                '  Quando eu tenho ~bar~', // <<< state call
                '    E eu preencho <x> com "x"',
                '    E eu preencho <y> com "Y"',
                '  Então eu vejo "zoo"'
            ],
			{ path: 'doc3.feature', hash: 'doc3' } as FileInfo
		);


        const expectedSteps: string[] = [
            'Dado que eu vejo "zoo"', // doc3
            'Dado que eu vejo "bar"', // doc2
            'Quando eu preencho <c> com "c"', // doc2
            'E eu preencho <d> com "d"', // doc2
            'Então eu vejo "baz"', // doc2
            'Quando eu preencho <x> com "x"', // doc3
            'E eu preencho <y> com "Y"', // doc3
            'Então eu vejo "zoo"' // doc3
		];



        const specFilter = new SpecFilter( spec );
        const analyzer = new BatchSpecificationAnalyzer();

        const problems = new FileProblemMapper();
        await analyzer.analyze( problems, spec, specFilter.graph() );
        const errors = problems.getAllErrors();
        const warnings = [];

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

        const stepsContent: string[] = ts3[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( expectedSteps );
	} );


	//	TODO:	Criar testes que verifiquem que estado não existente
	//       	é removido do cenário gerado:
	//			Fazer testes para os 3 tipos de estado.

	//	TODO:	Criar testes que verifiquem se após a remoção de passos com
	//			estado inexistente, o passo posterior é ajustado corretamente.
	//			Exemplo:
	//				Dado que eu tenho ~foo~
	//				  e estou em "https//foo.com"
	//			Deve gerar:
	//				Dado que estou em "https//foo.com"
	//
	//			Fazer testes para os 3 tipos de estado.

    it( 'does not include an inexistent precondition', async () => {

        const spec = new AugmentedSpec( '.' );

        const doc1: Document = await cp.addToSpec( spec,
            [
                '#language:pt',
                'Funcionalidade: F1',
                'Cenário: C1',
                'Variante: V1',
                '  Dado que eu tenho ~foo~',
                '  Quando eu preencho <b> com 10',
                '  Então eu vejo "bar"',
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

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
        const ts1 = await gen.generate( ctx1, variant1 );
        expect( errors ).not.toHaveLength( 0 );
        expect( ts1 ).toHaveLength( 1 );

        const stepsContent: string[] = ts1[ 0 ].steps.map( s => s.content );
        expect( stepsContent ).toEqual( [
			'Quando eu preencho <b> com 10',
			'Então eu vejo "bar"',
        ] );
    } );


} );
