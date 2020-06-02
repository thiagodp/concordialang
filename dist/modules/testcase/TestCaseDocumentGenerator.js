"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseDocumentGenerator = void 0;
const deepcopy = require("deepcopy");
const path_1 = require("path");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Generate Test Case Documents, i.e. documents to save as `.testcase` files.
 *
 * @author Thiago Delgado Pinto
 */
class TestCaseDocumentGenerator {
    constructor(_extensionFeature, _extensionTestCase, _basePath) {
        this._extensionFeature = _extensionFeature;
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
    generate(fromDoc, testCases) {
        var _a;
        let line = 1;
        // Cada TestCase contém o número que pode ser usado como índice para obter o cenário e a variante
        // Criar anotações que referenciam <- AQUI ?
        const fromDocPath = (_a = fromDoc === null || fromDoc === void 0 ? void 0 : fromDoc.fileInfo) === null || _a === void 0 ? void 0 : _a.path;
        // # Create a simulated document object
        let newDoc = {
            fileInfo: {
                hash: null,
                path: this.createTestCaseFilePath(fromDocPath)
            },
            imports: [],
            testCases: []
        };
        // # Generate language
        newDoc.language = this.createLanguage(fromDoc, ++line);
        // # Generate the needed imports
        newDoc.imports = this.createImports(fromDocPath, ++line);
        line += newDoc.imports.length;
        // # Update lines then add the test cases
        line = this.updateLinesFromTestCases(testCases, ++line);
        newDoc.testCases = testCases;
        return newDoc;
    }
    /**
     * Creates a test case file path based on a feature path.
     *
     * @param featurePath Feature path
     */
    createTestCaseFilePath(featurePath) {
        const testCaseFile = path_1.basename(featurePath, this._extensionFeature) + this._extensionTestCase;
        const testCasePath = path_1.join(path_1.dirname(featurePath), testCaseFile);
        return testCasePath;
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
     */
    createImports(fromDocPath, startLine) {
        let imports = [];
        // Path relative to where the doc file is
        const dir = path_1.dirname(fromDocPath);
        const filePath = path_1.relative(dir, path_1.join(dir, path_1.basename(fromDocPath)));
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
exports.TestCaseDocumentGenerator = TestCaseDocumentGenerator;
