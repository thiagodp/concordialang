import { Document } from "../ast/Document";
import { Options } from "../app/Options";
import { LanguageContentLoader } from "../dict/LanguageContentLoader";
import { KeywordDictionary } from "../dict/KeywordDictionary";
import { EnglishKeywordDictionary } from "../dict/EnglishKeywordDictionary";
import * as fs from 'fs';
import { promisify } from 'util';
import { EventEmitter } from "events";

/**
 * Generates files for Documents with Variants.
 * 
 * @author Thiago Delgado Pinto 
 */
export class VariantDocumentFileGenerator extends EventEmitter {

    public readonly fileHeader: string[] = [
        '# Generated with ❤ by Concordia',
        '#',
        '# THIS IS A GENERATED FILE - MODIFICATIONS CAN BE OVERWRITTEN !',
        ''       
    ];

    private _dict: KeywordDictionary;

    constructor(
        private _languageContentLoader: LanguageContentLoader,
        private _options: Options,
        private _fs: any = fs
    ) {
        super();

        // Loads/gets the dictionary according to the current language
        let langContent = _languageContentLoader.load( _options.language );
        this._dict = langContent ? langContent.keywords : new EnglishKeywordDictionary();
    }



    async createFileWithDoc( doc: Document, fs: any ): Promise< void > {

        let lines: string[] = [];
        
        // Add header lines
        lines.push.apply( lines, this.fileHeader );

        // Generate language, if declared
        if ( doc.language ) {
            lines.push( this.generateLanguageLine( doc.language.value ) );
        }

        // Imports
        for ( let imp of doc.imports || [] ) {
        }

        
        const path = doc.fileInfo.path;
        const writeFileAsync = promisify( fs.writeFile );
        await writeFileAsync( path, lines.join( "\n" ) );

        this.emit( 'concordia:testCase:fileCreated', path );
    }


    generateLanguageLine( language: string ): string {
        // TO-DO
        return '';
    }






    // /**
    //  * Returns the file path with the generated variants or null if no file was generated.
    //  * 
    //  * @param doc Document to analyze.
    //  * @param outputDir Output directory.
    //  * @param errors Errors found.
    //  * @param spec Specification.
    //  * 
    //  * @returns the generated file path | null.
    //  */
    // async generateVariantFileFromTemplatesOf(
    //     doc: Document,
    //     outputDir: string,
    //     errors: LocatedException[],
    //     spec: Spec
    // ): Promise< string | null > {

    //     // No Variants in the document ? -> exit
    //     if ( ! doc.variants ) {
    //         return null;
    //     }

    //     let templates: Variant[] = this.templateVariantsOf( doc.variants );

    //     // No Template Variants in the document ? -> exit
    //     if ( templates.length < 1 ) {
    //         return null;
    //     }

    //     let lines: string[] = [];
    //     for ( let tpl of templates ) {
    //         // Add all the generated lines
    //         lines.push.apply( await this.generateVariantSentencesFrom( tpl, doc, spec ) );
    //     }

    //     // No lines? -> exit
    //     if ( lines.length < 1 ) {
    //         return null;
    //     }

    //     // Add an import to the document
    //     lines.unshift( this.generateImportFor( doc, outputDir ) );

    //     // Add header comments
    //     lines.unshift.apply( this.generateHeaderComments() );


    //     const filePath = join( outputDir,
    //         basename( doc.fileInfo.path, extname( doc.fileInfo.path ) ) + '.variant'
    //     );
    // }

    // templateVariantsOf( variants: Variant[] ): Variant[] {
    //     let hasTemplateTag = function( v: Variant ) {
    //         return isDefined( v.tags )
    //             && v.tags.filter( tag => tag.name === ReservedTags.TEMPLATE ).length > 0;
    //     };
    //     return variants.filter( v => hasTemplateTag( v ) );
    // }

    // async generateVariantSentencesFrom( tpl: Variant, doc: Document, spec: Spec ): Promise< string[] > {
    //     return [];
    // }

    // generateImportFor( doc: Document, outputDir: string ): string {

    //     const filePath = join(
    //         // Path relative to where the doc file is
    //         relative( dirname( doc.fileInfo.path ), outputDir ),
    //         // File name
    //         basename( doc.fileInfo.path )
    //     );

    //     let importKeywords: string[] = this._dict.import;
    //     // Use the document's language if available and different from the default
    //     if ( doc.language && doc.language.value != this._options.language ) {
    //         const langContent = this._languageContentLoader.load( doc.language.value );
    //         if ( langContent ) {
    //             importKeywords = langContent.keywords.import;
    //         }
    //     }

    //     return ( importKeywords[ 0 ] || 'import' ) + ' ' +
    //         Symbols.IMPORT_SEPARATOR + filePath + Symbols.IMPORT_SEPARATOR;
    // }
    

}