import { Spec } from "../ast/Spec";
import { ImportBasedGraphBuilder } from "../selection/ImportBasedGraphBuilder";
import { Document } from "../ast/Document";
import { LocatedException } from "../req/LocatedException";
import { Variant } from "../ast/Variant";
import { isDefined } from "../util/TypeChecking";
import { ReservedTags } from "../req/ReservedTags";
import { Symbols } from "../req/Symbols";
import { Options } from "../app/Options";
import { Node, ContentNode } from "../ast/Node";
import { Location } from "../ast/Location";
import { Import } from "../ast/Import";
import { FileInfo } from "../ast/FileInfo";
import { Language } from "../ast/Language";
import { DocumentUtil } from "../util/DocumentUtil";
import { NodeTypes } from "../req/NodeTypes";
import Graph from 'graph.js';
import { join, basename, extname, dirname, relative } from 'path';
import { EventEmitter } from 'events';
import { deepcopy } from 'deepcopy';


/**
 * Generates a Document with Variants without touching the file system.
 * 
 * @author Thiago Delgado Pinto 
 */
export class VariantDocumentGenerator extends EventEmitter {

    private readonly _docUtil = new DocumentUtil();

    constructor(
        private _options: Options
    ) {
        super();
    }


    generateVariantDocuments(
        graph: Graph,
        spec: Spec,
        variantOutputDirectory: string,
        startLine: number
    ): Graph {

        const outputDir = join( spec.basePath, variantOutputDirectory );

        let documentsMap: Map< Document, Document > = new Map< Document, Document >();
        const docUtil = new DocumentUtil();

        // # Iterates over all vertices of the graph in topological order.
        for ( let [ key, value ] of graph.vertices_topologically() ) {

            const doc: Document = value;
            const newDoc: Document | null = this.newVariantDocumentFrom( doc, spec, outputDir, startLine );
            if ( ! newDoc ) { // Probably because the original doc has no templates
                continue;
            }

            // # Grab the documents' relationship to be added to the graph later.
            documentsMap.set( newDoc, doc );

            // # Add to new document to the spec
            spec.docs.push( newDoc );

            // # Announce the new document
            // This allows the listener to generate the corresponding file, for example.
            this.emit( 'concordia:testCase:newDocument', newDoc );
        }

        // # Add the generated documents to the graph
        // This shall allow the test script generator to include all the needed test cases.
        for ( let [ newDoc, doc ] of documentsMap ) {
            const from = newDoc.fileInfo.path;
            const to = doc.fileInfo.path;
            graph.addVertex( from, newDoc );
            graph.addEdge( from, to );
        }

        return graph;
    }


    newVariantDocumentFrom(
        doc: Document,
        spec: Spec,
        outputDir: string,
        startLine: number
    ): Document | null {

        // # Check whether the document has templates
        const templates: Variant[] = this._docUtil.templateVariantsOf( doc );
        if ( templates.length < 1 ) {
            return null;
        }

        // # Create a simulated document object
        let newDoc: Document = {
            fileInfo: {
                hash: null,
                path: this.createVariantFileNameBasedOn( doc.fileInfo.path, outputDir )
            } as FileInfo,
            imports: [],
            variants: []
        } as Document;

        // # Generate the nedded imports
        newDoc.imports = this.createImports( doc, outputDir, ++startLine );
        startLine += newDoc.imports.length;

        // # Generate language if nedded
        newDoc.language = this.createLanguageIfNeeded( doc, ++startLine );

        // # Generate variant objects from templates.
        let variants: Variant[]  = this.generateVariantsFromTemplates(
            templates, doc, spec, ++startLine );

        if ( variants.length < 1 ) {
            return null; // throw away the content generated until here
        }
        newDoc.variants = variants;
        
        return newDoc;
    }


    createVariantFileNameBasedOn( path: string, outputDir: string ): string {

        // Extract the received file name and add a proper extension
        let fileName = basename( path );
        fileName = fileName.substr( 0, fileName.lastIndexOf( '.' ) ) + this._options.extensionTestCase;

        // Directory relative to where the doc file is
        const fileDir = relative( dirname( path ), outputDir );

        return join( fileDir, fileName );
    }


    createImports( doc: Document, outputDir: string, startLine: number ): Import[] {
        let imports: Import[] = [];

        // Path relative to where the doc file is
        const filePath = join(
            relative( dirname( doc.fileInfo.path ), outputDir ),
            basename( doc.fileInfo.path )
        );

        // Generate the import to the given document
        let docImport: Import = {
            nodeType: NodeTypes.IMPORT,
            location: {
                column: 0,
                line: startLine
            },
            value: filePath
        } as Import;

        imports.push( docImport );

        // Add the imports from the given document
        if ( doc.imports ) {
            for ( let imp of doc.imports ) {
                // Clone the existing import
                let newImport: Import = deepcopy( imp ) as Import;
                // Adjust its line number
                newImport.location.line = ++startLine;
                // Resolve its path
                const relPath = join(
                    relative( dirname( newImport.value ), outputDir ),
                    basename( newImport.value )
                );
                newImport.value = relPath;
                // Add it to the list
                imports.push( newImport );
            }
        }

        return imports;
    }


    createLanguageIfNeeded( doc: Document, startLine: number ): Language | undefined {
        if ( ! doc.language || doc.language.value === this._options.language ) {
            return undefined;
        }
        let lang: Language = deepcopy( doc.language ) as Language;
        lang.location.line = startLine;
        return lang;
    }


    generateVariantsFromTemplates(
        templates: Variant[],
        doc: Document,
        spec: Spec,
        startLine: number
    ): Variant[] {

        // TO-DO: use VariantGenerator

        return [];
    }

}