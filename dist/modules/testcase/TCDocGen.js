"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const deepcopy = require("deepcopy");
const NodeTypes_1 = require("../req/NodeTypes");
const url_1 = require("url");
/**
 * Document (object) generator for Test Cases.
 *
 * @author Thiago Delgado Pinto
 */
class TCDocGen {
    /**
     * Constructor
     *
     * @param _extensionTestCase Extension to use in the file. Fullfils Document's `fileInfo`.
     */
    constructor(_extensionTestCase, _basePath) {
        this._extensionTestCase = _extensionTestCase;
        this._basePath = _basePath;
    }
    /**
     * Generates a new Document with the given test cases.
     *
     * @param fromDoc Owner document
     * @param testCases Test cases
     * @param outputDir Output directory. If not defined, assumes the same directory as the owner document.
     */
    generate(fromDoc, testCases, outputDir) {
        let line = 1;
        // Cada TestCase contém o número que pode ser usado como índice para obter o cenário e a variante
        // Criar anotações que referenciam <- AQUI ?
        // # Create a simulated document object
        let newDoc = {
            fileInfo: {
                hash: null,
                path: this.createTestCaseFileNameBasedOn(fromDoc.fileInfo.path, outputDir)
            },
            imports: [],
            testCases: []
        };
        // # Generate language
        newDoc.language = this.createLanguage(fromDoc, ++line);
        // # Generate the nedded imports
        newDoc.imports = this.createImports(fromDoc, ++line, outputDir);
        line += newDoc.imports.length;
        // # Update lines then add the test cases
        line = this.updateLinesFromTestCases(testCases, ++line);
        newDoc.testCases = testCases;
        return newDoc;
    }
    /**
     * Creates a file name for the new document.
     *
     * @param docPath Current document path
     * @param outputDir Output directory. Assumes the same directory as the `docPath` if not defined.
     */
    createTestCaseFileNameBasedOn(docPath, outputDir) {
        const props = path_1.parse(docPath);
        const fileName = props.name + this._extensionTestCase;
        const outDir = !outputDir ? props.dir : path_1.relative(props.dir, outputDir);
        // const fullPath = normalize( resolve( this._basePath, join( outDir, fileName ) ) );
        const resolvedPath = url_1.resolve(this._basePath, path_1.join(outDir, fileName))
            .replace(/%20/g, ' '); // #23 and https://github.com/nodejs/node/issues/21444
        const fullPath = path_1.normalize(resolvedPath);
        return fullPath;
    }
    /**
     * Create a language node.
     *
     * @param fromDoc Owner document
     * @param startLine Start line
     */
    createLanguage(fromDoc, startLine) {
        if (!fromDoc.language) {
            return;
        }
        let lang = deepcopy(fromDoc.language);
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
    createImports(fromDoc, startLine, outputDir) {
        let imports = [];
        // Path relative to where the doc file is
        const docDir = path_1.dirname(fromDoc.fileInfo.path);
        const outDir = outputDir || docDir;
        const filePath = path_1.join(path_1.relative(docDir, outDir), path_1.basename(fromDoc.fileInfo.path));
        // Generate the import to the given document
        let docImport = {
            nodeType: NodeTypes_1.NodeTypes.IMPORT,
            location: {
                column: 1,
                line: startLine
            },
            value: filePath
        };
        imports.push(docImport);
        return imports;
    }
    /**
     * Update the lines of the given test cases.
     *
     * @param testCases Test cases to be updated
     * @param startLine Start line
     */
    updateLinesFromTestCases(testCases, startLine) {
        let line = startLine;
        for (let tc of testCases) {
            line = this.updateLinesOfTestCase(tc, line);
        }
        return line;
    }
    /**
     * Update the lines of the given test case.
     *
     * @param tc Test case
     * @param startLine Start line
     */
    updateLinesOfTestCase(tc, startLine) {
        let line = 1 + startLine;
        // Tags
        for (let tag of tc.tags || []) {
            tag.location.line = line++;
        }
        // Header
        tc.location.line = line++;
        // Solves the problem of references
        tc.sentences = deepcopy(tc.sentences); // DEEP COPY
        // Sentences
        for (let sentence of tc.sentences || []) {
            sentence.location.line = line++;
        }
        return line;
    }
}
exports.TCDocGen = TCDocGen;
