import * as deepcopy from 'deepcopy';
import { basename, dirname, join, normalize, parse, relative, resolve } from "path";
import { Document, FileInfo, Import, Language, TestCase } from "../ast";
import { NodeTypes } from "../req/NodeTypes";


/**
 * Document (object) generator for Test Cases.
 *
 * @author Thiago Delgado Pinto
 */
export class TCDocGen {

    /**
     * Constructor
     *
     * @param _extensionTestCase Extension to use in the file. It fulfils Document's `fileInfo`.
     */
    constructor(
        private readonly _extensionTestCase: string,
        private readonly _basePath: string
    ) {
    }

    /**
     * Generates a new Document with the given test cases.
     *
     * @param fromDoc Owner document
     * @param testCases Test cases
     * @param outputDir Output directory. If not defined, assumes the same directory as the owner document.
     */
    generate(
        fromDoc: Document,
        testCases: TestCase[],
        outputDir?: string, // to fullfil fileInfo
    ): Document {

        let line = 1;

        // Cada TestCase contém o número que pode ser usado como índice para obter o cenário e a variante
        // Criar anotações que referenciam <- AQUI ?


        // # Create a simulated document object
        let newDoc: Document = {
            fileInfo: {
                hash: null,
                path: this.createTestCaseFileNameBasedOn( fromDoc.fileInfo.path, outputDir )
            } as FileInfo,
            imports: [],
            testCases: []
        } as Document;

        // # Generate language
        newDoc.language = this.createLanguage( fromDoc, ++line );

        // # Generate the needed imports
        newDoc.imports = this.createImports( fromDoc, ++line, outputDir );
        line += newDoc.imports.length;

        // # Update lines then add the test cases
        line = this.updateLinesFromTestCases( testCases, ++line );
        newDoc.testCases = testCases;

        return newDoc;
    }


    /**
     * Creates a file name for the new document.
     *
     * @param docPath Current document path
     * @param outputDir Output directory. Assumes the same directory as the `docPath` if not defined.
     */
    createTestCaseFileNameBasedOn( docPath: string, outputDir?: string ): string {
        const props = parse( docPath );
        const fileName = props.name + this._extensionTestCase;
        const outDir = ! outputDir ? props.dir : relative( props.dir, outputDir );
        const fullPath = normalize( resolve( this._basePath, join( outDir, fileName ) ) );
        return fullPath;
    }

    /**
     * Create a language node.
     *
     * @param fromDoc Owner document
     * @param startLine Start line
     */
    createLanguage( fromDoc: Document, startLine: number ): Language | undefined {
        if ( ! fromDoc.language ) {
            return;
        }
        let lang: Language = deepcopy( fromDoc.language ) as Language;
        lang.location.line = startLine;
        return lang;
    }


    /**
     * Create import nodes.
     *
     * @param fromDoc Owner document
     * @param startLine Start line
     * @param outputDir Output directory. Assumes the same directory as the `docPath` if not defined.
     */
    createImports( fromDoc: Document, startLine: number, outputDir?: string ): Import[] {
        let imports: Import[] = [];

        // Path relative to where the doc file is
        const docDir = dirname( fromDoc.fileInfo.path );
        const outDir = outputDir || docDir;
        const filePath = join(
            relative( docDir, outDir ),
            basename( fromDoc.fileInfo.path )
        );

        // Generate the import to the given document
        let docImport: Import = {
            nodeType: NodeTypes.IMPORT,
            location: {
                column: 1,
                line: startLine
            },
            value: filePath
        } as Import;

        imports.push( docImport );

        return imports;
    }

    /**
     * Update the lines of the given test cases.
     *
     * @param testCases Test cases to be updated
     * @param startLine Start line
     */
    updateLinesFromTestCases( testCases: TestCase[], startLine: number ): number {
        let line = startLine;
        for ( let tc of testCases ) {
            line = this.updateLinesOfTestCase( tc, line );
        }
        return line;
    }

    /**
     * Update the lines of the given test case.
     *
     * @param tc Test case
     * @param startLine Start line
     */
    updateLinesOfTestCase( tc: TestCase, startLine: number ): number {
        let line = 1 + startLine;

        // Tags
        for ( let tag of tc.tags || [] ) {
            tag.location.line = line++;
        }

        // Header
        tc.location.line = line++;

        // Solves the problem of references
        tc.sentences = deepcopy( tc.sentences ); // DEEP COPY

        // Sentences
        for ( let sentence of tc.sentences || [] ) {
            sentence.location.line = line++;
        }

        return line;
    }

}