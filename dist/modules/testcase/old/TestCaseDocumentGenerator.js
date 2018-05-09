"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DocumentUtil_1 = require("../../util/DocumentUtil");
const NodeTypes_1 = require("../../req/NodeTypes");
const path_1 = require("path");
const events_1 = require("events");
const deepcopy_1 = require("deepcopy");
/**
 * Events related to the generation of Documents with Variants.
 *
 * @author Thiago Delgado Pinto
 */
var DocumentGenerationEvents;
(function (DocumentGenerationEvents) {
    DocumentGenerationEvents["NEW_DOCUMENT"] = "concordia:testCase:newDocument";
})(DocumentGenerationEvents = exports.DocumentGenerationEvents || (exports.DocumentGenerationEvents = {}));
/**
 * Generates a Document with Test Cases without touching the file system.
 *
 * @author Thiago Delgado Pinto
 */
class TestCaseDocumentGenerator extends events_1.EventEmitter {
    constructor(_options) {
        super();
        this._options = _options;
        this._docUtil = new DocumentUtil_1.DocumentUtil();
    }
    generateDocuments(graph, spec, outputDirectory, startLine) {
        const outputDir = path_1.join(spec.basePath, outputDirectory);
        let documentsMap = new Map();
        const docUtil = new DocumentUtil_1.DocumentUtil();
        // # Iterates over all vertices of the graph in topological order.
        for (let [key, value] of graph.vertices_topologically()) {
            const doc = value;
            const newDoc = this.newVariantDocumentFrom(doc, spec, outputDir, startLine);
            if (!newDoc) {
                continue;
            }
            // # Grab the documents' relationship to be added to the graph later.
            documentsMap.set(newDoc, doc);
            // # Add to new document to the spec
            spec.docs.push(newDoc);
            // # Announce the new document
            // This allows the listener to generate the corresponding file, for example.
            this.emit(DocumentGenerationEvents.NEW_DOCUMENT, newDoc);
        }
        // # Add the generated documents to the graph
        // This shall allow the test script generator to include all the needed test cases.
        for (let [newDoc, doc] of documentsMap) {
            const from = newDoc.fileInfo.path;
            const to = doc.fileInfo.path;
            graph.addVertex(from, newDoc);
            graph.addEdge(from, to);
        }
        return graph;
    }
    newVariantDocumentFrom(doc, spec, outputDir, startLine) {
        // # Check whether the document has variants
        const variantsMap = this._docUtil.mapVariantsOf(doc);
        if (variantsMap.size < 1) {
            return null;
        }
        // # Create a simulated document object
        let newDoc = {
            fileInfo: {
                hash: null,
                path: this.createTestCaseFileNameBasedOn(doc.fileInfo.path, outputDir)
            },
            imports: [],
            testCases: []
        };
        // # Generate language if nedded
        newDoc.language = this.createLanguageIfNeeded(doc, ++startLine);
        // # Generate the nedded imports
        newDoc.imports = this.createImports(doc, outputDir, ++startLine);
        startLine += newDoc.imports.length;
        // # Generate test objects from variants
        let testCases = this.generateTestCasesFromVariants(variantsMap, doc, spec, ++startLine);
        if (testCases.length < 1) {
            return null; // throw away the content generated until here
        }
        newDoc.testCases = testCases;
        return newDoc;
    }
    createTestCaseFileNameBasedOn(path, outputDir) {
        const props = path_1.parse(path);
        const fileName = props.name + this._options.extensionTestCase;
        const fileDir = path_1.relative(props.dir, outputDir); // Relative to where the doc is
        return path_1.join(fileDir, fileName);
    }
    createLanguageIfNeeded(doc, startLine) {
        if (!doc.language || doc.language.value === this._options.language) {
            return undefined;
        }
        let lang = deepcopy_1.deepcopy(doc.language);
        lang.location.line = startLine;
        return lang;
    }
    createImports(doc, outputDir, startLine) {
        let imports = [];
        // Path relative to where the doc file is
        const filePath = path_1.join(path_1.relative(path_1.dirname(doc.fileInfo.path), outputDir), path_1.basename(doc.fileInfo.path));
        // Generate the import to the given document
        let docImport = {
            nodeType: NodeTypes_1.NodeTypes.IMPORT,
            location: {
                column: 0,
                line: startLine
            },
            value: filePath
        };
        imports.push(docImport);
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
    generateTestCasesFromVariants(variantsMap, doc, spec, startLine) {
        // TO-DO: use VariantGenerator
        return [];
    }
}
exports.TestCaseDocumentGenerator = TestCaseDocumentGenerator;
//# sourceMappingURL=TestCaseDocumentGenerator.js.map