import * as deepcopy from 'deepcopy';
import { basename, dirname, join, relative } from 'path';

import { Document, FileInfo, Import, Language, TestCase } from '../ast';
import { NodeTypes } from '../req/NodeTypes';

/**
 * Generate Test Case Documents, i.e. documents to save as `.testcase` files.
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseDocumentGenerator {

    constructor(
        private readonly _extensionFeature: string,
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
        testCases: TestCase[]
    ): Document {

        let line = 1;

        // Cada TestCase contém o número que pode ser usado como índice para obter o cenário e a variante
        // Criar anotações que referenciam <- AQUI ?

        const fromDocPath: string = fromDoc?.fileInfo?.path;

        // # Create a simulated document object
        let newDoc: Document = {
            fileInfo: {
                hash: null,
                path: this.createTestCaseFilePath( fromDocPath )
            } as FileInfo,
            imports: [],
            testCases: []
        } as Document;

        // # Generate language
        newDoc.language = this.createLanguage( fromDoc, ++line );

        // # Generate the needed imports
        newDoc.imports = this.createImports( fromDocPath, ++line );
        line += newDoc.imports.length;

        // # Update lines then add the test cases
        line = this.updateLinesFromTestCases( testCases, ++line );
        newDoc.testCases = testCases;

        return newDoc;
    }


    /**
     * Creates a test case file path based on a feature path.
     *
     * @param featurePath Feature path
     */
    createTestCaseFilePath( featurePath: string ): string {
        const testCaseFile = basename( featurePath, this._extensionFeature ) + this._extensionTestCase;
        const testCasePath = join( dirname( featurePath ), testCaseFile );
        return testCasePath;
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
     */
    createImports( fromDocPath: string, startLine: number ): Import[] {
        let imports: Import[] = [];

        // Path relative to where the doc file is
        const dir = dirname( fromDocPath );
        const filePath = relative( dir, join( dir, basename( fromDocPath ) ) );

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
