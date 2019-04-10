import { EventEmitter } from 'events';
import { basename, dirname, join, parse, relative } from 'path';
import { deepcopy } from 'deepcopy';
import Graph = require('graph.js/dist/graph.full.js');
import { Document, FileInfo, Import, Language, Scenario, TestCase, Variant } from 'concordialang-types';
import { Options } from '../../app/Options';
import { AugmentedSpec } from '../../ast/AugmentedSpec';
import { NodeTypes } from '../../req/NodeTypes';
import { DocumentUtil } from '../../util/DocumentUtil';

/**
 * Events related to the generation of Documents with Variants.
 *
 * @author Thiago Delgado Pinto
 */
export enum DocumentGenerationEvents {
    NEW_DOCUMENT = 'concordia:testCase:newDocument'
}


/**
 * Generates a Document with Test Cases without touching the file system.
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseDocumentGenerator extends EventEmitter {

    private readonly _docUtil = new DocumentUtil();

    constructor(
        private _options: Options
    ) {
        super();
    }


    generateDocuments(
        graph: Graph,
        spec: AugmentedSpec,
        outputDirectory: string,
        startLine: number
    ): Graph {

        const outputDir = join( spec.basePath, outputDirectory );

        let documentsMap: Map< Document, Document > = new Map< Document, Document >();
        const docUtil = new DocumentUtil();

        // # Iterates over all vertices of the graph in topological order.
        for ( let [ key, value ] of graph.vertices_topologically() ) {

            const doc: Document = value;
            const newDoc: Document | null = this.newVariantDocumentFrom( doc, spec, outputDir, startLine );
            if ( ! newDoc ) { // Probably because the original doc has no variants
                continue;
            }

            // # Grab the documents' relationship to be added to the graph later.
            documentsMap.set( newDoc, doc );

            // # Add to new document to the spec
            spec.docs.push( newDoc );

            // # Announce the new document
            // This allows the listener to generate the corresponding file, for example.
            this.emit( DocumentGenerationEvents.NEW_DOCUMENT, newDoc );
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
        spec: AugmentedSpec,
        outputDir: string,
        startLine: number
    ): Document | null {

        // # Check whether the document has variants
        const variantsMap: Map< Variant, Scenario > = this._docUtil.mapVariantsOf( doc );
        if ( variantsMap.size < 1 ) {
            return null;
        }

        // # Create a simulated document object
        let newDoc: Document = {
            fileInfo: {
                hash: null,
                path: this.createTestCaseFileNameBasedOn( doc.fileInfo.path, outputDir )
            } as FileInfo,
            imports: [],
            testCases: []
        } as Document;

        // # Generate language if nedded
        newDoc.language = this.createLanguageIfNeeded( doc, ++startLine );

        // # Generate the nedded imports
        newDoc.imports = this.createImports( doc, outputDir, ++startLine );
        startLine += newDoc.imports.length;

        // # Generate test objects from variants
        let testCases: TestCase[]  = this.generateTestCasesFromVariants(
            variantsMap, doc, spec, ++startLine );

        if ( testCases.length < 1 ) {
            return null; // throw away the content generated until here
        }
        newDoc.testCases = testCases;

        return newDoc;
    }


    createTestCaseFileNameBasedOn( path: string, outputDir: string ): string {
        const props = parse( path );
        const fileName = props.name + this._options.extensionTestCase;
        const fileDir = relative( props.dir, outputDir ); // Relative to where the doc is
        return join( fileDir, fileName );
    }


    createLanguageIfNeeded( doc: Document, startLine: number ): Language | undefined {
        if ( ! doc.language || doc.language.value === this._options.language ) {
            return undefined;
        }
        let lang: Language = deepcopy( doc.language ) as Language;
        lang.location.line = startLine;
        return lang;
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

        // NOT NEEDED: the VariantSSA will add the Variants to their Feature! ------
        // Add the imports from the given document
        // if ( doc.imports ) {
        //     for ( let imp of doc.imports ) {
        //         // Clone the existing import
        //         let newImport: Import = deepcopy( imp ) as Import;
        //         // Adjust its line number
        //         newImport.location.line = ++startLine;
        //         // Resolve its path
        //         const relPath = join(
        //             relative( dirname( newImport.value ), outputDir ),
        //             basename( newImport.value )
        //         );
        //         newImport.value = relPath;
        //         // Add it to the list
        //         imports.push( newImport );
        //     }
        // }
        // -------------------------------------------------------------------------

        return imports;
    }


    generateTestCasesFromVariants(
        variantsMap: Map< Variant, Scenario >,
        doc: Document,
        spec: AugmentedSpec,
        startLine: number
    ): TestCase[] {

        // TO-DO: use VariantGenerator

        return [];
    }

}