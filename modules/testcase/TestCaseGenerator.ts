import { NLPResult, NLPEntity } from '../nlp/NLPResult';
import { UIElement, UIProperty } from '../ast/UIElement';
import { Variant, Template } from "../ast/Variant";
import { Spec } from "../ast/Spec";
import { LocatedException } from "../req/LocatedException";
import { KeywordDictionary } from "../dict/KeywordDictionary";
import { DataTestCase } from "../testdata/DataTestCase";
import { Symbols } from "../req/Symbols";
import { Step } from "../ast/Step";
import { DataTestCaseNames } from "../testdata/DataTestCaseNames";
import { Document } from "../ast/Document";
import { Entities } from "../nlp/Entities";
import { Constant } from "../ast/Constant";
import { ReferenceReplacer } from "../util/ReferenceReplacer";
import { CaseType } from "../app/CaseType";
import { convertCase } from '../util/CaseConversor';
import { ReservedTags } from '../req/ReservedTags';
import { ValueType, ALL_VALUE_TYPES } from '../util/ValueTypeDetector';
import { isDefined } from '../util/TypeChecking';
import * as deepcopy from 'deepcopy';
import { lower } from 'case';
import { UIElementUtil } from '../util/UIElementUtil';


/**
 * Generates Variants from Templates.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestCaseGenerator {

    /**
     * Generates Variants from a Template.
     * 
     * @param template Template
     * @param spec Entire specification
     * @param keywords Keyword dictionary
     */
    public generate = async (
        template: Template,
        doc: Document,
        spec: Spec,
        testCases: DataTestCase[],
        keywords: KeywordDictionary,
        testCaseNames: DataTestCaseNames,
        caseOption: CaseType | string
    ): Promise< VariantGenerationResult[] > => {

        const uiElements: UIElement[] = this.uiElementsOf( doc );

        // Replace references
        let tpl: Template = this.replaceReferences(
            template,
            uiElements,
            spec,
            caseOption
        );

        let all: VariantGenerationResult[] = [];

        const variantKeyword: string = keywords.variant[ 0 ] || 'Variant';
        const withKeyword: string = keywords.with[ 0 ] || 'with';

        for ( let tc of testCases ) {

            const testCaseName: string = testCaseNames[ tc ] || lower( tc );   
            
            let sentences: string[] = [];
            this.addTags( sentences, tpl );
            this.addName( sentences, tpl, variantKeyword, testCaseName );
            this.addSentencesWithGeneratedValues( sentences, tpl.sentences, uiElements, spec, tc, withKeyword );

            all.push( new VariantGenerationResult( sentences, [], [] ) );
        }

        return all;
    };


    /**
     * Add tags to the variant
     * 
     * @param content 
     * @param template 
     */
    public addTags( content: string[], template: Template ): void {

        const newTags: string[] = [
            Symbols.TAG_PREFIX + ReservedTags.GENERATED,
            Symbols.TAG_PREFIX + ReservedTags.TEMPLATE + '(' + template.name + ')'
        ];

        // Adds new tags
        content.push.apply( content, newTags );        

        // Adds tags from the template
        content.push.apply( content, template.tags.map( tag => Symbols.TAG_PREFIX + tag.name ) );
    }

    /**
     * Makes a name to the variant
     * 
     * @param content 
     * @param template 
     * @param variantKeyword 
     * @param testCaseName 
     */
    public addName( content: string[], template: Template, variantKeyword: string, testCaseName: string ): void {
        content.push( 
            variantKeyword + Symbols.TITLE_SEPARATOR + ' ' + template.name + ' - ' + testCaseName
        );
    }

    public replaceReferences(
        template: Template,
        uiElements: UIElement[],
        spec: Spec,
        caseOption: CaseType | string
    ): Template {

        // Generate the literals
        const uiElementNameToLiteralMap: Map< string, string > =
            ( new UIElementUtil() ).generateIds( uiElements, caseOption );

        // Get constant values
        const constantNameToValueMap: Map< string, string | number > =
            spec.constantNameToValueMap();

        // Copy the original template
        let tpl: Template = deepcopy( template );

        // Replace references
        const replacer: ReferenceReplacer = new ReferenceReplacer();
        for ( let s of tpl.sentences ) {
            s.content = replacer.replaceTestCaseSentence(
                s.content,
                s.nlpResult,
                uiElementNameToLiteralMap,
                constantNameToValueMap,
                caseOption
            );
        }

        return tpl;
    }

    /**
     * Adds sentences from template's sentences and generates values to those
     * sentences with "fill" actions.
     * 
     * @param targetSentences Target sentences
     * @param templateSentences Template sentences
     * @param spec Specification
     * @param tc Current test case
     * @param withKeyword Keyword used as a separator between a UI Element and a Value,
     *                    e.g., in "I fill "Name" with "Bob"", "with" is that keyword.
     */
    public addSentencesWithGeneratedValues(
        targetSentences: string[],
        templateSentences: Step[],
        uiElements: UIElement[],
        spec: Spec,
        tc: DataTestCase,
        withKeyword: string
    ): void {
        for ( let s of templateSentences ) {

            let newSentence: string = s.content;

            // Adds any command that does not enter a value
            if ( ! this.hasFillAction( s ) ) {
                targetSentences.push( newSentence );
                continue;
            }

            // Keep sentences that already have values
            const hasValue: boolean = newSentence.indexOf( Symbols.VALUE_WRAPPER ) >= 0;
            if ( hasValue ) {
                targetSentences.push( newSentence );
                continue;
            }

            newSentence += ' ' + withKeyword + ' ' + this.generateValue( s, uiElements, spec, tc );
            targetSentences.push( newSentence );
        }
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
            if ( isDefined( uie ) && isDefined( uie.items ) ) {
                // Find the value type, if defined. Property is "datatype" and entity is "ui_data_type".
                const item = uie.items.find( item => 'datatype' === item.property );
                if ( isDefined( item ) ) {
                    const entity = item.nlpResult.entities.find( ( e: NLPEntity ) => 'ui_data_type' === e.entity );
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
 * Variant generation result
 * 
 * @author Thiago Delgado Pinto
 */
export class VariantGenerationResult {

    constructor(
        public content: string[],
        public errors: LocatedException[],
        public warnings: LocatedException[]
    ) {
    }
}