import { Document, FileInfo, Variant } from '../../modules/ast';
import { FileProblemMapper } from '../../modules/error/FileProblemMapper';
import languageMap from '../../modules/language/data/map';
import { AugmentedSpec } from '../../modules/req/AugmentedSpec';
import { IndexOfEachStrategy, SingleRandomOfEachStrategy } from '../../modules/selection/CombinationStrategy';
import { SpecFilter } from '../../modules/selection/SpecFilter';
import { BatchSpecificationAnalyzer } from '../../modules/semantic/BatchSpecificationAnalyzer';
import { JustOneInvalidMix, OnlyValidMix } from '../../modules/testcase/DataTestCaseMix';
import { TestPlanner } from '../../modules/testcase/TestPlanner';
import { LongLimits } from '../../modules/testdata/limits/LongLimits';
import { Random } from '../../modules/testdata/random/Random';
import { RandomString } from '../../modules/testdata/random/RandomString';
import { GenContext, PreTestCaseGenerator } from '../../modules/testscenario/PreTestCaseGenerator';
import { SimpleCompiler } from '../SimpleCompiler';

describe( 'PreTestCaseGenerator', () => {

	let gen: PreTestCaseGenerator; // under test
	let cp: SimpleCompiler;
	const SEED = 'concordia';

	describe( 'pt', () => {

		const LANGUAGE = 'pt';

		beforeEach( () => {
			cp = new SimpleCompiler( LANGUAGE );

			gen = new PreTestCaseGenerator(
				cp.nlpRec.variantSentenceRec,
				languageMap,
				cp.language,
				SEED
			);
		} );

		afterEach( () => {
			cp = null;
			gen = null;
		} );

		it( 'replaces Constants by their values', async () => {

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
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

			const testPlanMakers: TestPlanner[] = [
				new TestPlanner( new OnlyValidMix(), new SingleRandomOfEachStrategy( SEED ), SEED )
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

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
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
			const analyzer = new BatchSpecificationAnalyzer();

			const problems = new FileProblemMapper();
			await analyzer.analyze( problems, spec, specFilter.graph() );
			const errors = problems.getAllErrors();
			const warnings = [];

			// expect( doc1.fileErrors ).toEqual( [] );
			// expect( doc2.fileErrors ).toEqual( [] );

			const testPlanMakers: TestPlanner[] = [
				new TestPlanner( new OnlyValidMix(), new SingleRandomOfEachStrategy( SEED ), SEED )
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

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
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
			const analyzer = new BatchSpecificationAnalyzer();

			const problems = new FileProblemMapper();
			await analyzer.analyze( problems, spec, specFilter.graph() );
			const errors = problems.getAllErrors();
			const warnings = [];

			// expect( doc1.fileErrors ).toEqual( [] );
			// expect( doc2.fileErrors ).toEqual( [] );

			const testPlanMakers: TestPlanner[] = [
				new TestPlanner( new OnlyValidMix(), new SingleRandomOfEachStrategy( SEED ), SEED )
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

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
					'  Quando eu preencho <a>',
					'    E eu preencho <b> com "foo"',
					'    E eu preencho <c>',
					' Então eu tenho ~foo~',
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
				new TestPlanner( new OnlyValidMix(), new SingleRandomOfEachStrategy( SEED ), SEED )
			];

			const ctx1 = new GenContext( spec, doc1, errors, warnings );
			const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
			const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
			// expect( errors ).toHaveLength( 0 );
			expect( preTestCases ).toHaveLength( 1 );

			const preTC = preTestCases[ 0 ];

			// Content + Comment
			const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );

			const rand = new RandomString( new Random( SEED ), gen.randomStringOptions );
			const value1 = rand.between( gen.minRandomStringSize, gen.maxRandomStringSize );
			const value2 = rand.between( gen.minRandomStringSize, gen.maxRandomStringSize );
			const comment1 = '# válido: aleatório';
			const comment2 = '# válido: aleatório';

			expect( lines ).toEqual(
				[
					'Quando eu preencho <a> com "' + value1 + '" ' + comment1,
					'E eu preencho <b> com "foo"',
					'E eu preencho <c> com "' + value2 + '" ' + comment2,
					'Então eu tenho ~foo~'
				]
			);

		} );



		it( 'fills UI Elements without value with generated value', async () => {

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
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
			const analyzer = new BatchSpecificationAnalyzer();

			const problems = new FileProblemMapper();
			await analyzer.analyze( problems, spec, specFilter.graph() );
			const errors = problems.getAllErrors();
			const warnings = [];

			// expect( doc1.fileErrors ).toEqual( [] );
			// expect( doc2.fileErrors ).toEqual( [] );

			const testPlanMakers: TestPlanner[] = [
				// new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
				new TestPlanner( new OnlyValidMix(), new IndexOfEachStrategy( 1 ), SEED )
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
			const comment1 = '# {A}, válido: não preenchido';
			const comment2 = '# {C}, válido: não preenchido';

			expect( lines ).toEqual(
				[
					'Quando eu preencho <a> com "' + value1 + '" ' + comment1,
					'E eu preencho <b> com "foo"',
					'E eu preencho <c> com "' + value2 + '" ' + comment2,
					'Então eu tenho ~foo~'
				]
			);

		} );



		it( 'generates UI Elements values with escaped quotes', async () => {

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
					'  Quando eu preencho {A}',
					'Elemento de IU: A',
					'  - formato é "^\\"$"'
				],
				{ path: 'doc1.feature', hash: 'doc1' } as FileInfo
			);

			const specFilter = new SpecFilter( spec );
			const analyzer = new BatchSpecificationAnalyzer();

			const problems = new FileProblemMapper();
			await analyzer.analyze( problems, spec, specFilter.graph() );
			const errors = problems.getAllErrors();
			const warnings = [];

			const testPlanMakers: TestPlanner[] = [
				// new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
				new TestPlanner( new OnlyValidMix(), new IndexOfEachStrategy( 0 ), SEED )
			];

			const ctx1 = new GenContext( spec, doc1, errors, warnings );
			const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
			const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
			expect( errors ).toHaveLength( 0 );
			expect( preTestCases ).toHaveLength( 1 );

			const preTC = preTestCases[ 0 ];

			// Content + Comment
			const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
			const comment1 = '# {A}, válido: formato válido';

			expect( lines ).toEqual(
				[
					'Quando eu preencho <a> com "\\"" ' + comment1,
				]
			);

		} );



		it( 'separates UI literals and UI Elements', async () => {

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
					'  Quando eu preencho {A}, <b>, {C} e <d>',
					'  Então eu tenho ~foo~',
					'Elemento de IU: A',
					'Elemento de IU: C'
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
				new TestPlanner( new OnlyValidMix(), new IndexOfEachStrategy( 1 ), SEED )
			];

			const ctx1 = new GenContext( spec, doc1, errors, warnings );
			const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
			const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
			// expect( errors ).toHaveLength( 0 );
			expect( preTestCases ).toHaveLength( 1 );

			const preTC = preTestCases[ 0 ];

			// Content + Comment
			const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
			const value1 = '';
			const value2 = '';
			const comment1Value = '# {A}, válido: não preenchido';
			const comment2Value = '# {C}, válido: não preenchido';
			const randStr = new RandomString( new Random( SEED ), gen.randomStringOptions );
			const random1 = randStr.between( gen.minRandomStringSize, gen.maxRandomStringSize );
			const random2 = randStr.between( gen.minRandomStringSize, gen.maxRandomStringSize );
			const commentRandom = '# válido: aleatório';

			expect( lines ).toEqual(
				[
					'Quando eu preencho <a> com "' + value1 + '" ' + comment1Value,
					'E eu preencho <b> com "' + random1 + '" ' + commentRandom,
					'E eu preencho <c> com "' + value2 + '" ' + comment2Value,
					'E eu preencho <d> com "' + random2 + '" ' + commentRandom,
					'Então eu tenho ~foo~'
				]
			);

		} );


		it( 'separates all UI Elements', async () => {

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
					'  Quando eu preencho {A}, {B}, {C} e {D}',
					'  Então eu tenho ~foo~',
					'Elemento de IU: A',
					'Elemento de IU: B',
					'Elemento de IU: C',
					'Elemento de IU: D'
				],
				{ path: 'doc1.feature', hash: 'doc1' } as FileInfo
			);

			const specFilter = new SpecFilter( spec );
			const analyzer = new BatchSpecificationAnalyzer();

			const problems = new FileProblemMapper();
			await analyzer.analyze( problems, spec, specFilter.graph() );
			const errors = problems.getAllErrors();
			const warnings = [];

			const testPlanMakers: TestPlanner[] = [
				// new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
				new TestPlanner( new OnlyValidMix(), new IndexOfEachStrategy( 1 ), SEED )
			];

			const ctx1 = new GenContext( spec, doc1, errors, warnings );
			const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
			const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
			expect( preTestCases ).toHaveLength( 1 );

			const preTC = preTestCases[ 0 ];

			// Content + Comment
			const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
			const [ value1, value2, value3, value4 ] = [ '', '', '', '' ];
			const [ comment1, comment2, comment3, comment4 ] = [
				'# {A}, válido: não preenchido',
				'# {B}, válido: não preenchido',
				'# {C}, válido: não preenchido',
				'# {D}, válido: não preenchido',
			];

			expect( lines ).toEqual(
				[
					'Quando eu preencho <a> com "' + value1 + '" ' + comment1,
					'E eu preencho <b> com "' + value2 + '" ' + comment2,
					'E eu preencho <c> com "' + value3 + '" ' + comment3,
					'E eu preencho <d> com "' + value4 + '" ' + comment4,
					'Então eu tenho ~foo~'
				]
			);

		} );



		it( 'generates invalid values and oracles based on UI Element properties', async () => {

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
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
			const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
			expect( errors ).toHaveLength( 0 );
			expect( preTestCases ).toHaveLength( 1 );

			const preTC = preTestCases[ 0 ];

			// Content + Comment
			const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
			const value1 = LongLimits.MIN;
			const comment = '# {A}, inválido: menor valor aplicável';

			expect( lines ).toEqual(
				[
					'Quando eu preencho <a> com ' + value1 + ' ' + comment,
					'E eu preencho <b> com "foo"',
					'Então eu devo ver "x"'
				]
			);

			// Content + Comment
			const oracleLines = preTC.oracles.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
			expect( oracleLines ).toEqual( [
				'Então eu devo ver a mensagem "bar" # de <a>' // << Otherwise is replaced by Then
			] );

		} );



		it( 'replaces UIE Property references by their generated value', async () => {

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Funcionalidade: F1',
					'Cenário: C1',
					'Variante: V1',
					'  Quando eu preencho {A}',
					'    E eu preencho <b> com {A|value}',
					' Então eu devo ver "x"',
					'    E vejo {A|value}',
					'Elemento de IU: A',
					' - valor é 5'
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
				new TestPlanner( new OnlyValidMix(), new IndexOfEachStrategy( 0 ), SEED )
			];

			const ctx1 = new GenContext( spec, doc1, errors, warnings );
			const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
			const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
			expect( errors ).toHaveLength( 0 );
			expect( preTestCases ).toHaveLength( 1 );

			const preTC = preTestCases[ 0 ];

			// Content + Comment
			const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
			const value1 = 5;
			const comment = '# {A}, válido: preenchido';

			expect( lines ).toEqual(
				[
					`Quando eu preencho <a> com ${value1} ${comment}`,
					`E eu preencho <b> com ${value1}`,
					'Então eu devo ver "x"',
					`E vejo ${value1}`
				]
			);
		} );

	} );



	describe( 'en', () => {

		const LANGUAGE = 'en';

		beforeEach( () => {
			cp = new SimpleCompiler( LANGUAGE );

			gen = new PreTestCaseGenerator(
				cp.nlpRec.variantSentenceRec,
				languageMap,
				cp.language,
				SEED
			);
		} );

		afterEach( () => {
			cp = null;
			gen = null;
		} );


		it( 'separates UI literals and UI Elements', async () => {

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Feature: F1',
					'Scenario: C1',
					'Variant: V1',
					'  When I fill {A}, <b>, {C}, and <d>',
					'  Then I have ~foo~',
					'UI Element: A',
					'UI Element: C'
				],
				{ path: 'doc1.feature', hash: 'doc1' } as FileInfo
			);

			const specFilter = new SpecFilter( spec );
			const analyzer = new BatchSpecificationAnalyzer();

			const problems = new FileProblemMapper();
			await analyzer.analyze( problems, spec, specFilter.graph() );
			const errors = problems.getAllErrors();
			const warnings = [];

			const testPlanMakers: TestPlanner[] = [
				// new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
				new TestPlanner( new OnlyValidMix(), new IndexOfEachStrategy( 1 ), SEED )
			];

			const ctx1 = new GenContext( spec, doc1, errors, warnings );
			const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
			const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
			expect( preTestCases ).toHaveLength( 1 );

			const preTC = preTestCases[ 0 ];

			// Content + Comment
			const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
			const value1 = '';
			const value2 = '';
			const comment1Value = '# {A}, valid: not filled';
			const comment2Value = '# {C}, valid: not filled';
			const randStr = new RandomString( new Random( SEED ), gen.randomStringOptions );
			const random1 = randStr.between( gen.minRandomStringSize, gen.maxRandomStringSize );
			const random2 = randStr.between( gen.minRandomStringSize, gen.maxRandomStringSize );
			const commentRandom = '# valid: random';

			expect( lines ).toEqual(
				[
					'When I fill <a> with "' + value1 + '" ' + comment1Value,
					'And I fill <b> with "' + random1 + '" ' + commentRandom,
					'And I fill <c> with "' + value2 + '" ' + comment2Value,
					'And I fill <d> with "' + random2 + '" ' + commentRandom,
					'Then I have ~foo~'
				]
			);

		} );


		it( 'separates all UI Elements', async () => {

			let spec = new AugmentedSpec( '.' );

			let doc1: Document = await cp.addToSpec( spec,
				[
					'Feature: F1',
					'Scenario: C1',
					'Variant: V1',
					'  When I fill {A}, {B}, {C} and {D}',
					'  Then I have ~foo~',
					'UI Element: A',
					'UI Element: B',
					'UI Element: C',
					'UI Element: D'
				],
				{ path: 'doc1.feature', hash: 'doc1' } as FileInfo
			);

			const specFilter = new SpecFilter( spec );
			const analyzer = new BatchSpecificationAnalyzer();

			const problems = new FileProblemMapper();
			await analyzer.analyze( problems, spec, specFilter.graph() );
			const errors = problems.getAllErrors();
			const warnings = [];


			const testPlanMakers: TestPlanner[] = [
				// new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
				new TestPlanner( new OnlyValidMix(), new IndexOfEachStrategy( 1 ), SEED )
			];

			const ctx1 = new GenContext( spec, doc1, errors, warnings );
			const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];
			const preTestCases = await gen.generate( variant1.sentences, ctx1, testPlanMakers );
			expect( preTestCases ).toHaveLength( 1 );

			const preTC = preTestCases[ 0 ];

			// Content + Comment
			const lines = preTC.steps.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
			const [ value1, value2, value3, value4 ] = [ '', '', '', '' ];
			const [ comment1, comment2, comment3, comment4 ] = [
				'# {A}, valid: not filled',
				'# {B}, valid: not filled',
				'# {C}, valid: not filled',
				'# {D}, valid: not filled',
			];

			expect( lines ).toEqual(
				[
					'When I fill <a> with "' + value1 + '" ' + comment1,
					'And I fill <b> with "' + value2 + '" ' + comment2,
					'And I fill <c> with "' + value3 + '" ' + comment3,
					'And I fill <d> with "' + value4 + '" ' + comment4,
					'Then I have ~foo~'
				]
			);

		} );


	} );

} );
