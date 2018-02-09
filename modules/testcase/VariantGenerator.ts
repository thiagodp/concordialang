import {NLPResult} from '../../src/modules/nlp/NLPResult';
import {UIElement} from '../../src/modules/ast/UIElement';
import { Variant, Template } from "../ast/Variant";
import { Spec } from "../ast/Spec";
import { LocatedException } from "../req/LocatedException";
import { KeywordDictionary } from "../dict/KeywordDictionary";
import { DataTestCase } from "../data-gen/DataTestCase";
import { Symbols } from "../req/Symbols";
import { Step } from "../ast/Step";
import { DataTestCaseNames } from "../data-gen/DataTestCaseNames";
import { Document } from "../ast/Document";
import { Entities } from "../nlp/Entities";
import { Constant } from "../ast/Constant";
import { ReferenceReplacer } from "../db/ReferenceReplacer";
import { CaseType } from "../app/CaseType";
import { convertCase } from '../util/CaseConversor';

/**
 * Generates Variants from a Template.
 * 
 * @author Thiago Delgado Pinto
 */
export class VariantGenerator {

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
        caseUi: CaseType | string
    ): Promise< VariantGenerationResult[] > => {

        let all: VariantGenerationResult[] = [];
        let tpl: Template = this.replaceReferences( template, doc, spec, caseUi );

        const variantKeyword: string = keywords.variant[ 0 ] || 'Variant';
        const withKeyword: string = keywords.with[ 0 ] || 'with';

        for ( let tc of testCases ) {

            const testCaseName: string = testCaseNames[ tc ]
                || tc.toString().toLowerCase().replace( '_', ' ' );            
        
            let r = new VariantGenerationResult( [], [], [] );
            this.addTags( r.content, tpl );
            this.addName( r.content, tpl, variantKeyword, testCaseName );
            this.addSentences( r.content, tpl.sentences, spec, tc, withKeyword );

            all.push( r );
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
            '@generated',
            '@template( ' + template.name + ' )'
        ];
        // Adds new tags
        content.push.apply( content, newTags );
        // Adds all the existing tags from the template
        content.push.apply( content, template.tags );
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

    /**
     * Adds sentences replacing all the references and analyzes the action to decide whether a value 
     * must be added to the corresponding sentence.
     * 
     * @param content 
     * @param sentences 
     * @param spec 
     * @param tc 
     */
    public addSentences(
        content: string[],
        sentences: Step[],
        spec: Spec,
        tc: DataTestCase,
        withKeyword: string
    ): void {
        for ( let s of sentences ) {

            let newSentence: string = s.content;

            // Adds any command that does not enter a value
            if ( ! s.command || ! this.isValueFillAction( s.command.action ) ) {
                content.push( newSentence );
                continue;
            }

            // Keep sentences that already have values
            const hasValue: boolean = newSentence.indexOf( Symbols.VALUE_WRAPPER ) >= 0;
            if ( hasValue ) {
                content.push( newSentence );
                continue;
            }

            newSentence += withKeyword + ' ' + this.generateValue( s, spec, tc );
            content.push( newSentence );
        }
    }

    /**
     * Replaces references of a template and returns a new template.
     * 
     * @param template Template to change
     * @param doc Current document
     * @param spec Specification
     * @param caseUi String case to use when not id is defined, e.g. "camel".
     */
    public replaceReferences(
        template: Template,
        doc: Document,
        spec: Spec,
        caseUi: CaseType | string
    ): Template {
        const replacer: ReferenceReplacer = new ReferenceReplacer( true );
        let tpl: Template = Object.assign( {}, template );

        // Map constant names to values
        let constantNameToValueMap = {};
        spec.constants().forEach( v => constantNameToValueMap[ v.name ] = v.value );

        // Retrieve all the ui elements in the doc
        let uiElements: UIElement[] = [];
        if ( !! doc.uiElements ) {
            uiElements.push.apply( uiElements, doc.uiElements );
        }
        if ( !! doc.feature.uiElements ) {
            uiElements.push.apply( uiElements, doc.feature.uiElements );
        }

        // Map UI element names to its ids
        let uiElementNameToIdMap = {};
        uiElements.forEach( ( uie: UIElement ) => {

            // Find a property "id" in the UI element
            const item: NLPResult = uie.items.find( item => 'id' === item.property );

            if ( !! item ) {
                // Find an entity "value" in the NLP result
                const entity = item.nlpResult.entities.find( e => 'value' === e.id );
                uiElementNameToIdMap[ uie.name ] = !! entity ? entity.value : '';
            } else {
                // Use the name as id
                uiElementNameToIdMap[ uie.name ] = convertCase( uiElementNameToIdMap[ uie.name ], caseUi );
            }
        } );
        //console.log( 'map', uiElementNameToIdMap );
        
        for ( let s of tpl.sentences ) {
            s.content = replacer.replace( s.content, {}, {}, uiElementNameToIdMap, constantNameToValueMap );
        }

        return tpl;
    }

    public isValueFillAction( action: string ): boolean {
        if ( ! action ) {
            return false;
        }
        return [
            'fill'
        ].indexOf( action.toLowerCase() ) >= 0;
    }

    public generateValue( s: Step, spec: Spec, tc: DataTestCase ): string {
        // TO-DO
        return '""';
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