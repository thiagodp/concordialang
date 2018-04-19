import { Document } from "../ast/Document";
import { TestCase } from "../ast/TestCase";
import { parse, relative, join, dirname, basename } from "path";
import { FileInfo } from "../ast/FileInfo";
import { TestCaseDocumentGenerator } from "./TestCaseDocumentGenerator";
import { Language } from "../ast/Language";
import * as deepcopy from 'deepcopy';
import { Import } from "../ast/Import";
import { NodeTypes } from "../req/NodeTypes";


/**
 * Document (object) generator for Test Cases.
 *
 * @author Thiago Delgado Pinto
 */
export class TCDocGen {

    constructor(
        private readonly _extensionTestCase: string  // to fullfil fileInfo
    ) {

    }

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

        // # Generate the nedded imports
        newDoc.imports = this.createImports( fromDoc, ++line, outputDir );
        line += newDoc.imports.length;

        // # Update lines then add the test cases
        line = this.updateLinesFromTestCases( testCases, ++line );
        newDoc.testCases = testCases;

        return newDoc;
    }



    createTestCaseFileNameBasedOn( path: string, outputDir?: string ): string {

        const props = parse( path );
        const fileName = props.name + this._extensionTestCase;

        const outDir = outputDir || props.dir;
        const fileDir = relative( props.dir, outDir ); // Relative to where the doc is

        return join( fileDir, fileName );
    }


    createLanguage( doc: Document, startLine: number ): Language | undefined {
        if ( ! doc.language ) {
            return;
        }
        let lang: Language = deepcopy( doc.language ) as Language;
        lang.location.line = startLine;
        return lang;
    }


    createImports( doc: Document, startLine: number, outputDir?: string ): Import[] {
        let imports: Import[] = [];

        // Path relative to where the doc file is
        const docDir = dirname( doc.fileInfo.path );
        const outDir = outputDir || docDir;
        const filePath = join(
            relative( docDir, outDir ),
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

        return imports;
    }


    updateLinesFromTestCases( testCases: TestCase[], startLine: number ): number {
        let line = startLine;
        for ( let tc of testCases ) {
            line = this.updateLinesOfTestCase( tc, line );
        }
        return line;
    }

    updateLinesOfTestCase( tc: TestCase, startLine: number ): number {
        let line = 1 + startLine;

        // Tags
        for ( let tag of tc.tags || [] ) {
            tag.location.line = line++;
        }

        // Header
        tc.location.line = line++;

        // Sentences
        for ( let sentence of tc.sentences || [] ) {
            sentence.location.line = line++;
        }

        return line;
    }

}