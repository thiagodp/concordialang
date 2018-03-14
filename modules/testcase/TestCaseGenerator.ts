import { NLPResult, NLPEntity, NLPUtil } from '../nlp/NLPResult';
import { UIElement, UIProperty } from '../ast/UIElement';
import { Variant, TestCase } from "../ast/Variant";
import { Spec } from "../ast/Spec";
import { LocatedException } from "../req/LocatedException";
import { DataTestCase } from "../testdata/DataTestCase";
import { Symbols } from "../req/Symbols";
import { Step } from "../ast/Step";
import { Document } from "../ast/Document";
import { Entities } from "../nlp/Entities";
import { Constant } from "../ast/Constant";
import { ReferenceReplacer } from "../util/ReferenceReplacer";
import { CaseType } from "../app/CaseType";
import { convertCase } from '../util/CaseConversor';
import { ReservedTags } from '../req/ReservedTags';
import { ValueType, ALL_VALUE_TYPES } from '../util/ValueTypeDetector';
import { isDefined, areDefined } from '../util/TypeChecking';
import { UIElementUtil } from '../util/UIElementUtil';
import { LanguageContent } from '../dict/LanguageContent';
import { Warning } from '../req/Warning';
import { VariantSentenceRecognizer } from '../nlp/VariantSentenceRecognizer';
import { NLP } from '../nlp/NLP';
import { NodeTypes } from '../req/NodeTypes';
import { Tag } from '../ast/Tag';
import { KeywordDictionary } from '../dict/KeywordDictionary';
import * as deepcopy from 'deepcopy';
import { lower } from 'case';

/**
 * Generates Test Cases from Variants.
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseGenerator {

    private readonly _variantSentenceRec: VariantSentenceRecognizer;
    private readonly _nlpUtil = new NLPUtil();

    constructor(
        private _language: string = 'en',
        useFuzzyProcessor?: boolean
    ) {
        this._variantSentenceRec = new VariantSentenceRecognizer( new NLP( useFuzzyProcessor ) );
    }


    public async generate(

        variant: Variant,
        doc: Document,
        spec: Spec,
        startLine: number,
        uiLiteralCaseOption: CaseType | string,

        dataTestCases: DataTestCase[],
        languageContent: LanguageContent

    ): Promise< TestCaseGenerationResult > {

        const keywords: KeywordDictionary = languageContent.keywords;

        let errors: Error[] = [];
        let warnings: Warning[] = [];

        const uiElements: UIElement[] = this.uiElementsOf( doc );

        // Copy the original variant and replaces its references
        const newVariant: Variant = this.replaceReferences(
            variant,
            uiElements,
            spec,
            uiLiteralCaseOption,
            errors,
            warnings
        );

        const testCaseKeyword: string = keywords.testCase[ 0 ] || 'Test Case';
        const withKeyword: string = keywords.with[ 0 ] || 'with';

        // Generate TestCases for each data test case (?)
        let all: TestCase[] = [];
        for ( let dataTestCase of dataTestCases ) {

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

            testCase.tags = this.createTags( newVariant, startLine, keywords.tagVariant, keywords.tagGenerated );
            startLine += testCase.tags.length;

            testCase.sentences = this.createSentences(
                newVariant, startLine, uiElements, spec, dataTestCase, withKeyword );
            startLine += testCase.sentences.length;

            all.push( testCase );
        }

        return new TestCaseGenerationResult( all, errors, warnings );
    }


    public createTags(
        newVariant: Variant,
        startLine: number,
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

        return tags;
    }


    public createSentences(
        variant,
        startLine,
        uiElements,
        spec,
        dataTestCase,
        withKeyword
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
            step.content += ' ' + withKeyword + ' ' + this.generateValue( s, uiElements, spec, dataTestCase );
        }
        return steps;
    }


    public replaceReferences(
        variant: Variant,
        uiElements: UIElement[],
        spec: Spec,
        caseOption: CaseType | string,
        errors: LocatedException[],
        warnings: Warning[]
    ): Variant {

        // Generate the literals
        const uiElementNameToLiteralMap: Map< string, string > =
            ( new UIElementUtil() ).generateIds( uiElements, caseOption );

        // Get constant values
        const constantNameToValueMap: Map< string, string | number > =
            spec.constantNameToValueMap();

        // Copy the original variant
        let newVariant: Variant = deepcopy( variant ); // <<< must be here in this function

        // Replace references in the sentences
        const replacer: ReferenceReplacer = new ReferenceReplacer();
        for ( let s of newVariant.sentences ) {
            s.content = replacer.replaceTestCaseSentence(
                s.content,
                s.nlpResult,
                uiElementNameToLiteralMap,
                constantNameToValueMap,
                caseOption
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


    public generateValue( s: Step, uiElements: UIElement[], spec: Spec, tc: DataTestCase ): string {

        // Retrieve the value type of the referenced element (default string), in order
        // to generate the test value with the right type
        let dataType: ValueType = ValueType.STRING;
        if ( s.targets && s.targets.length > 0 ) {
            // Find the element by name
            const uie = uiElements.find( uie => uie.name === s.targets[ 0 ] );
            if ( areDefined( uie, uie.items ) ) {
                // Find the value type, if defined. Property is "datatype" and entity is "ui_data_type".
                const item = uie.items.find( item => 'datatype' === item.property );
                if ( isDefined( item ) ) {
                    const entity = this._nlpUtil.find( Entities.UI_DATA_TYPE, item.nlpResult );
                    if ( isDefined( entity ) ) {
                        // Only accepts one of the available data types
                        const dataTypeIndex = ALL_VALUE_TYPES.indexOf( entity.value.trim().toLowerCase() );
                        if ( dataTypeIndex >= 0 ) {
                            dataType = ALL_VALUE_TYPES[ dataTypeIndex ];
                        }
                    }
                }
            }
        }
        //console.log( 'Data type is', dataType );

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


    private uiElementsOf( doc: Document ): UIElement[] {
        let uiElements: UIElement[] = [];
        if ( isDefined( doc.uiElements ) ) {
            uiElements.push.apply( uiElements, doc.uiElements );
        }
        if ( isDefined( doc.feature.uiElements ) ) {
            uiElements.push.apply( uiElements, doc.feature.uiElements );
        }
        return uiElements;
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