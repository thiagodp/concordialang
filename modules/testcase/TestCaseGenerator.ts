import { NLPResult, NLPEntity, NLPUtil } from '../nlp/NLPResult';
import { UIElement, UIProperty } from '../ast/UIElement';
import { Variant } from "../ast/Variant";
import { TestCase } from "../ast/TestCase";
import { Spec } from "../ast/Spec";
import { Document } from "../ast/Document";
import { LocatedException } from "../req/LocatedException";
import { DataTestCase } from "../testdata/DataTestCase";
import { Symbols } from "../req/Symbols";
import { Step } from "../ast/Step";
import { Entities } from "../nlp/Entities";
import { Constant } from "../ast/Constant";
import { ReferenceReplacer } from "../util/ReferenceReplacer";
import { CaseType } from "../app/CaseType";
import { convertCase } from '../util/CaseConversor';
import { ReservedTags } from '../req/ReservedTags';
import { ValueType, ALL_VALUE_TYPES } from '../util/ValueTypeDetector';
import { isDefined } from '../util/TypeChecking';
import { LanguageContent } from '../dict/LanguageContent';
import { Warning } from '../req/Warning';
import { VariantSentenceRecognizer } from '../nlp/VariantSentenceRecognizer';
import { NLP } from '../nlp/NLP';
import { NodeTypes } from '../req/NodeTypes';
import { Tag } from '../ast/Tag';
import { KeywordDictionary } from '../dict/KeywordDictionary';
import { DataTestCaseAnalyzer } from '../testdata/DataTestCaseAnalyzer';
import * as deepcopy from 'deepcopy';
import { lower } from 'case';
import { RuntimeException } from '../req/RuntimeException';

/**
 * Generates Test Cases from Variants.
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseGenerator {

    /// Used to recognize test case sentences after creating them.
    /// This recognition is important to generate test scripts later.
    private readonly _variantSentenceRec: VariantSentenceRecognizer;

    private readonly _nlpUtil = new NLPUtil();

    private readonly _dtcAnalyzer: DataTestCaseAnalyzer;

    constructor(
        private _language: string = 'en',
        seed: string,
        useFuzzyProcessor?: boolean
    ) {
        this._dtcAnalyzer = new DataTestCaseAnalyzer( seed );
        this._variantSentenceRec = new VariantSentenceRecognizer( new NLP( useFuzzyProcessor ) );
    }


    public async generate(

        variant: Variant,
        doc: Document,
        spec: Spec,
        startLine: number,
        uiLiteralCaseOption: CaseType,
        languageContent: LanguageContent

    ): Promise< TestCaseGenerationResult > {

        let errors: Error[] = [];

        // Let's start extracting the UI Elements referenced by the Variant.
        // We'll generate Test Cases according to the DataTestCases supported by every referenced UI Element.
        // If no UI Elements are referenced, at least one Test Case with random values should be generated.

        // This maps a UI Variable to a DataTestCase and its indication whether it is considered valid or not.
        let uieVariableToDataTestCaseMap = new Map< string, Map< DataTestCase, boolean > >();
        let testCaseCount: number = 0;
        for ( let s of variant.sentences || [] ) {
            // Extracts referenced UI Element variable
            const variables: string[] = this._nlpUtil.valuesOfEntitiesNamed( Entities.UI_ELEMENT, s.nlpResult );
            // Maps compatible data test cases
            for ( let v of variables ) {

                let uie = spec.uiElementByVariable( v, doc );
                if ( ! uie ) {
                    const msg = 'Could not find UI Element by the variable "' + v + '"';
                    const err = new RuntimeException( msg, variant.location );
                    errors.push( err );
                }

                const dataTestCasesMap = this._dtcAnalyzer.analyzeUIElement( uie, errors );
                testCaseCount += dataTestCasesMap.size;
                uieVariableToDataTestCaseMap.set( v, dataTestCasesMap );
            }
        }

        // No tests? Let's add a fake (null) variable with random tests.
        if ( testCaseCount < 1 ) {

            uieVariableToDataTestCaseMap.set(
                null,
                new Map< DataTestCase, boolean >(
                    [ [ DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX, true ] ]
                )
            );
        }


        // ---



        const keywords: KeywordDictionary = languageContent.keywords;
        let warnings: Warning[] = [];

        // Copy the original variant and replaces its references
        const newVariant: Variant = this.replaceReferences(
            variant,
            spec,
            doc,
            uiLiteralCaseOption,
            errors,
            warnings
        );

        const testCaseKeyword: string = keywords.testCase[ 0 ] || 'Test Case';
        const withKeyword: string = keywords.with[ 0 ] || 'with';

        // Generate TestCases for each data test case (?)
        let all: TestCase[] = [];
        for ( let [ uiVariableName, dataTestCaseMap ] of uieVariableToDataTestCaseMap ) {

            const isUIVariableDefined = isDefined( uiVariableName );

            for ( let [ dataTestCase, isValid ] of dataTestCaseMap ) {

                // Uses the test name from the translation document if available.
                // Otherwise, it uses the original test case name in lower case, e.g., 'SOME_TEST' -> 'some test'.
                // This is not the case of using a CaseType, because CaseType is intended to produce method-line
                // names and the TestCase name should be more natural language-like.
                const testName: string = languageContent.testCaseNames[ dataTestCase ] || lower( dataTestCase );
                const testCaseName: string = newVariant.name + ' - ' + testName;

                let testCase: TestCase = {
                    nodeType: NodeTypes.TEST_CASE,
                    name: testCaseName,
                    location: {
                        column: 1,
                        line: ++startLine
                    },
                    tags: [],
                    sentences: []
                } as TestCase;

                //
                // TODO:    add tag about the explored ui element and data test case
                //          it could be necessary evaluate if the test will fail or not!
                //

                testCase.tags = this.createTags( newVariant, startLine, isValid, keywords.tagVariant, keywords.tagGenerated );
                startLine += testCase.tags.length;

                testCase.sentences = this.createSentences(
                    newVariant, startLine, isValid, spec, dataTestCase, withKeyword );
                startLine += testCase.sentences.length;

                all.push( testCase );
            }
        }

        return new TestCaseGenerationResult( all, errors, warnings );
    }


    public createTags(
        newVariant: Variant,
        startLine: number,
        isValid: boolean,
        tagGeneratedKeywords: string[],
        tagVariantKeywords: string[]
    ): Tag[] {
        let tags: Tag[] = [];

        // Add a tag @generated
        let genTag: Tag = {
            nodeType: NodeTypes.TAG,
            name: tagGeneratedKeywords[ 0 ] || ReservedTags.GENERATED,
            location: {
                column: 0,
                line: startLine++
            }
        } as Tag;
        tags.push( genTag );

        // Copy tags from the Variant
        for ( let vTag of newVariant.tags || [] ) {
            let tag: Tag = deepcopy( vTag );
            tag.location.line = startLine++;
            tags.push( tag );
        }

        // Add a tag that @variant
        let refTag: Tag = {
            nodeType: NodeTypes.TAG,
            name: tagVariantKeywords[ 0 ] || ReservedTags.VARIANT,
            content: newVariant.name,
            location: {
                column: 0,
                line: startLine++
            }
        } as Tag;
        tags.push( refTag );

        // Add a tag @invalid

        return tags;
    }


    public createSentences(
        variant: Variant,
        startLine: number,
        isValid: boolean,
        spec: Spec,
        dataTestCase: DataTestCase,
        withKeyword: string
    ): Step[] {
        let steps: Step[] = [];
        for ( let s of variant.sentences || [] ) {

            let step: Step = {
                nodeType: s.nodeType,
                location: {
                    column: s.location.column,
                    line: startLine++
                },
                content: s.content
            } as Step;

            steps.push( step );

            // Keep the sentence as is if it does not have a "fill" action
            if ( ! this.hasFillAction( s ) ) {
                continue;
            }

            // Keep the sentence as is if it already has values
            if ( isDefined( s.nlpResult ) && this._nlpUtil.hasEntityNamed( Entities.VALUE, s.nlpResult ) ) {
                continue;
            }

            // Adds the value
            step.content += ' ' + withKeyword + ' ' + this.generateValue( s, spec, dataTestCase );
        }
        return steps;
    }


    public replaceReferences(
        variant: Variant,
        spec: Spec,
        doc: Document,
        uiLiteralCaseOption: CaseType,
        errors: LocatedException[],
        warnings: Warning[]
    ): Variant {

        // Copy the original variant
        let newVariant: Variant = deepcopy( variant ); // <<< must be here in this function

        // Replace references in the sentences
        const replacer: ReferenceReplacer = new ReferenceReplacer();
        for ( let s of newVariant.sentences ) {
            s.content = replacer.replaceTestCaseSentence(
                s.content,
                s.nlpResult,
                spec,
                doc,
                uiLiteralCaseOption
            );
        }

        // Perform a NLP in the new sentences - IMPORTANT to the test script generation later
        this._variantSentenceRec.recognizeSentences( this._language, newVariant.sentences, errors, warnings );

        return newVariant;
    }


    public hasFillAction( step: Step ): boolean {
        if ( ! step ) {
            return false;
        }
        return 'fill' === step.action;
    }


    public generateValue( s: Step, spec: Spec, tc: DataTestCase ): string {


        let dataType: string = 'string'; // ...
        let value = '';

        // TO-DO
        /*
        let value = await testCaseGenerator.generate( tc, dataType ) || '';
        */

        // Add quotes if the value is empty or not numeric
        if ( value.length < 1  || ! ( ValueType.INTEGER === dataType || ValueType.DOUBLE === dataType ) ) {
            value = '"' + value + '"';
        }

        return value;
    }

}

/**
 * TestCase generation result
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseGenerationResult {

    constructor(
        public testCases: TestCase[],
        public errors: LocatedException[],
        public warnings: LocatedException[]
    ) {
    }
}