import { VariantSentenceRecognizer } from "../nlp/VariantSentenceRecognizer";
import { LanguageContentLoader } from "../dict/LanguageContentLoader";
import { Options } from "./Options";
import { PreTestCaseGenerator, GenContext } from "../testscenario/PreTestCaseGenerator";
import { Spec } from "../ast/Spec";
import { Document } from "../ast/Document";
import Graph = require( 'graph.js/dist/graph.full.js' );
import { TSGen } from "../testscenario/TSGen";
import { VariantSelectionStrategy, AllVariantsSelectionStrategy, FirstVariantSelectionStrategy, FirstMostImportantVariantSelectionStrategy, SingleRandomVariantSelectionStrategy } from '../selection/VariantSelectionStrategy';
import { CombinationStrategy, ShuffledOneWiseStrategy, OneWiseStrategy, SingleRandomOfEachStrategy, CartesianProductStrategy } from "../selection/CombinationStrategy";
import { Variant } from "../ast/Variant";
import { TestScenario } from "../testscenario/TestScenario";
import { LocatedException } from "../req/LocatedException";
import { TCGen } from "../testcase/TCGen";
import { TestCase } from "../ast/TestCase";
import { TestPlanMaker } from "../testcase/TestPlanMaker";
import { TCDocGen } from "../testcase/TCDocGen";
import { TestCaseFileGenerator } from "../testcase/TestCaseFileGenerator";
import { promisify } from "util";
import { RuntimeException } from "../req/RuntimeException";
import { writeFile } from 'fs';
import { VariantSelectionOptions, StateCombinationOptions, CombinationOptions, InvalidSpecialOptions } from "./Defaults";
import { ReservedTags } from "../req/ReservedTags";
import { Warning } from "../req/Warning";
import { DataTestCaseMix, OnlyValidMix, JustOneInvalidMix, OnlyInvalidMix, UnfilteredMix } from "../testcase/DataTestCaseMix";
import { CLI } from "./CLI";
import { TCGenListener } from "./TCGenListener";
import { ProcessingInfo } from "./ProcessingInfo";

export class TCGenController {

    constructor( private _listener: TCGenListener ) {
    }

    async execute(
        variantSentenceRec: VariantSentenceRecognizer,
        langLoader: LanguageContentLoader,
        options: Options,
        spec: Spec,
        graph: Graph,
    ): Promise< [ Spec, Graph ] > {

        const startTime = Date.now();

        //
        // setup
        //

        const preTCGen = new PreTestCaseGenerator(
            variantSentenceRec,
            langLoader,
            options.language,
            options.realSeed,
            options.typedCaseUI(),
            options.randomMinStringSize,
            options.randomMaxStringSize,
            options.randomTriesToInvalidValue
        );

        let strategyWarnings: LocatedException[] = [];

        const variantSelectionStrategy: VariantSelectionStrategy =
            this.variantSelectionStrategyFromOptions( options, strategyWarnings );

        const stateCombinationStrategy: CombinationStrategy =
            this.stateCombinationStrategyFromOptions( options, strategyWarnings );

        let variantToTestScenariosMap = new Map< Variant, TestScenario[] >();

        let postconditionNameToVariantsMap = new Map< string, Variant[] >();

        let tsGen = new TSGen(
            preTCGen,
            variantSelectionStrategy,
            stateCombinationStrategy,
            variantToTestScenariosMap,
            postconditionNameToVariantsMap
        );

        const tcGen = new TCGen( preTCGen );

        const testPlanMakers: TestPlanMaker[] = this.testPlanMakersFromOptions( options, strategyWarnings );

        const tcDocGen = new TCDocGen( options.extensionTestCase, options.directory );

        const tcDocFileGen = new TestCaseFileGenerator( langLoader, options.language );

        const writeFileAsync = promisify( writeFile );

        //
        // generation
        //

        this._listener.testCaseGenerationStarted( strategyWarnings );

        let vertices = graph.vertices_topologically();

        let newTestCaseDocuments: Document[] = [];

        for ( let [ key, value ] of vertices ) {

            let doc: Document = value;
            if ( ! doc || ! doc.feature || ! doc.feature.scenarios ) {
                continue;
            }
            // console.log( 'doc is', doc.fileInfo.path);

            let errors: LocatedException[] = [];
            let warnings: LocatedException[] = [];

            let ctx = new GenContext( spec, doc, errors, warnings );

            let testCases: TestCase[] = [];

            let scenarioIndex = 0;
            for ( let scenario of doc.feature.scenarios || [] ) {

                let variantIndex = 0;
                for ( let variant of scenario.variants || [] ) {

                    // Generating Test Scenarios

                    let testScenarios: TestScenario[] = [];
                    try {
                        testScenarios = await tsGen.generate( ctx, variant );
                    } catch ( err ) {
                        errors.push( err );
                        continue;
                    }

                    let tsIndex = 0;
                    for ( let ts of testScenarios ) {

                        // Generating Test Cases

                        let generatedTC: TestCase[] = [];
                        try {
                            generatedTC = await tcGen.generate( ts, ctx, testPlanMakers );
                        } catch ( err ) {
                            errors.push( err );
                            continue;
                        }

                        if ( generatedTC.length < 1 ) {
                            continue;
                        }

                        let tcIndex = 1;
                        for ( let tc of generatedTC ) {

                            tcGen.addReferenceTagsTo( tc, scenarioIndex + 1, variantIndex + 1 );

                            tc.name = ( variant.name || scenario.name ) + ' - ' + ( tcIndex + tsIndex );

                            ++tcIndex;
                        }

                        ++tsIndex;

                        testCases.push.apply( testCases, generatedTC );
                    }

                    ++variantIndex;
                }

                ++scenarioIndex;
            }

            // Generating Documents with the Test Cases
            const newDoc: Document = tcDocGen.generate( doc, testCases, options.dirTestCase );

            newTestCaseDocuments.push( newDoc );

            // Adding the generated documents to the graph
            // > This shall allow the test script generator to include all the needed test cases.
            const from = newDoc.fileInfo.path;
            const to = doc.fileInfo.path;
            graph.addVertex( from, newDoc ); // Overwrites if exist!
            graph.addEdge( to, from ); // order is this way...

            // Generating file content
            const lines = tcDocFileGen.createLinesFromDoc(
                newDoc,
                errors,
                options.tcSuppressHeader,
                options.tcIndenter
            );

            // Announce produced
            this._listener.testCaseProduced( from, errors, warnings );

            // Generating file
            try {
                await writeFileAsync( newDoc.fileInfo.path, lines.join( options.lineBreaker ) )
            } catch ( err ) {
                const msg = 'Error generating the file "' + newDoc.fileInfo.path + '": ' + err.message;
                errors.push( new RuntimeException( msg ) );
            }

        }

        // console.log( 'BEFORE');
        // for ( let d of spec.docs ) {
        //     console.log( ' DOC', d.fileInfo.path );
        // }

        // Adds or replaces generated documents to the specification
        for ( let newDoc of newTestCaseDocuments ) {
            // console.log( 'NEW is', newDoc.fileInfo.path );
            let index = spec.docs.findIndex( doc => doc.fileInfo.path.toLowerCase() === newDoc.fileInfo.path.toLowerCase() );
            if ( index < 0 ) {
                // console.log( ' ADD', newDoc.fileInfo.path );
                spec.docs.push( newDoc );
            } else {
                // console.log( ' REPLACE', newDoc.fileInfo.path );
                spec.docs.splice( index, 1, newDoc ); // Replace
            }
        }

        // Show errors and warnings if they exist
        const durationMs = Date.now() - startTime;
        this._listener.testCaseGenerationFinished( durationMs );

        return [ spec, graph ];
    }



    private variantSelectionStrategyFromOptions(
        options: Options,
        warnings: LocatedException[]
    ): VariantSelectionStrategy {

        const desired = options.typedVariantSelection();
        switch ( desired ) {

            case VariantSelectionOptions.SINGLE_RANDOM:
                return new SingleRandomVariantSelectionStrategy( options.realSeed );

            case VariantSelectionOptions.FIRST:
                return new FirstVariantSelectionStrategy();

            case VariantSelectionOptions.FIRST_MOST_IMPORTANT:
                return new FirstMostImportantVariantSelectionStrategy(
                    options.importance,
                    [ ReservedTags.IMPORTANCE ]
                );

            case VariantSelectionOptions.ALL:
                return new AllVariantsSelectionStrategy();

            default: {
                const used = VariantSelectionOptions.SINGLE_RANDOM.toString();
                const msg = 'Variant selection strategy not supported: ' + desired +
                    '. It will be used "' + used + '" instead.';
                warnings.push( new Warning( msg ) );

                return new SingleRandomVariantSelectionStrategy( options.realSeed );
            }
        }
    }


    private stateCombinationStrategyFromOptions(
        options: Options,
        warnings: LocatedException[]
    ): CombinationStrategy {
        return this.combinationStrategyFrom(
            options.typedStateCombination(),
            'State',
            options,
            warnings
        );
    }


    private combinationStrategyFrom(
        desired: CombinationOptions,
        name: string,
        options: Options,
        warnings: LocatedException[]
    ): CombinationStrategy {

        switch ( desired ) {

            case CombinationOptions.SHUFFLED_ONE_WISE:
                return new ShuffledOneWiseStrategy( options.realSeed );

            case CombinationOptions.ONE_WISE:
                return new OneWiseStrategy( options.realSeed );

            case CombinationOptions.SINGLE_RANDOM_OF_EACH:
                return new SingleRandomOfEachStrategy( options.realSeed );

            case CombinationOptions.ALL:
                return new CartesianProductStrategy();

            default: {
                const used = CombinationOptions.SHUFFLED_ONE_WISE.toString();
                const msg = name + ' combination strategy not supported: ' + desired +
                    '. It will be used "' + used + '" instead.';
                warnings.push( new Warning( msg ) );

                return new ShuffledOneWiseStrategy( options.realSeed );
            }
        }

    }


    private testPlanMakersFromOptions( options: Options, warnings: LocatedException[] ): TestPlanMaker[] {

        // INVALID DATA TEST CASES AT A TIME

        const none = InvalidSpecialOptions.NONE.toString();
        const all = InvalidSpecialOptions.ALL.toString();
        const random = InvalidSpecialOptions.RANDOM.toString();
        const default_ = InvalidSpecialOptions.DEFAULT.toString();

        let mixStrategy: DataTestCaseMix;

        const desired = String( options.combInvalid );
        switch ( desired ) {

            case '0': ; // next
            case none:
                mixStrategy = new OnlyValidMix();
                break;

            case '1':
                mixStrategy = new JustOneInvalidMix();
                break;

            case all:
                mixStrategy = new OnlyInvalidMix();
                break;

            case random: ; // next
            case default_:
                mixStrategy = new UnfilteredMix();
                break;

            default: {
                const used = random;
                const msg = 'Invalid data test case selection strategy not supported: ' + desired +
                    '. It will be used "' + used + '" instead.';
                warnings.push( new Warning( msg ) );

                mixStrategy = new UnfilteredMix();
            }
        }

        // DATA TEST CASE COMBINATION

        const dataCombinationOption = desired === random
            ? CombinationOptions.SHUFFLED_ONE_WISE
            : options.typedDataCombination();

        // console.log( 'options.invalid', options.invalid, 'desired', desired, 'dataCombinationOption', dataCombinationOption );

        let combinationStrategy = this.combinationStrategyFrom(
            dataCombinationOption,
            'Data',
            options,
            warnings
        );

        return [
            new TestPlanMaker( mixStrategy, combinationStrategy, options.realSeed )
        ];
    }

}