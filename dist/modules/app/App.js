"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const concordialang_plugin_1 = require("concordialang-plugin");
const CompilerFacade_1 = require("../compiler/CompilerFacade");
const LanguageManager_1 = require("../language/LanguageManager");
const PackageBasedPluginFinder_1 = require("../plugin/PackageBasedPluginFinder");
const PluginController_1 = require("../plugin/PluginController");
const PluginManager_1 = require("../plugin/PluginManager");
const AbstractTestScriptGenerator_1 = require("../testscript/AbstractTestScriptGenerator");
const TestResultAnalyzer_1 = require("../testscript/TestResultAnalyzer");
const file_1 = require("../util/file");
/**
 * Application facade
 *
 * @author Thiago Delgado Pinto
 */
class App {
    constructor(_fs, _path) {
        this._fs = _fs;
        this._path = _path;
    }
    start(options, ui) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const fs = this._fs;
            const path = this._path;
            let pluginData = null;
            const dirSearcher = new file_1.FSDirSearcher(fs);
            const fileSearcher = new file_1.FSFileSearcher(fs);
            const fileHandler = new file_1.FSFileHandler(fs, options.encoding);
            const pluginManager = new PluginManager_1.PluginManager(ui, new PackageBasedPluginFinder_1.PackageBasedPluginFinder(options.processPath, fileHandler, dirSearcher), fileHandler);
            let plugin = null;
            if (options.somePluginOption()) {
                const pluginController = new PluginController_1.PluginController();
                try {
                    yield pluginController.process(options, pluginManager, ui);
                }
                catch (err) {
                    ui.showException(err);
                    return false;
                }
                return true;
            }
            else if (options.someOptionThatRequiresAPlugin() && options.hasPluginName()) {
                try {
                    pluginData = yield pluginManager.pluginWithName(options.plugin);
                    if (!pluginData) {
                        ui.announcePluginNotFound(options.pluginDir, options.plugin);
                        return false;
                    }
                    plugin = yield pluginManager.load(pluginData);
                }
                catch (err) {
                    ui.showException(err);
                    return false;
                }
                if (!plugin) { // needed?
                    ui.announcePluginCouldNotBeLoaded(options.plugin);
                    return false;
                }
                // can continue
            }
            if (options.languageList) {
                const lm = new LanguageManager_1.LanguageManager(fileSearcher, options.languageDir);
                try {
                    const languages = yield lm.availableLanguages();
                    ui.drawLanguages(languages);
                }
                catch (err) {
                    ui.showException(err);
                    return false;
                }
                return true;
            }
            let hasErrors = false;
            let spec = null;
            ui.announceOptions(options);
            if (options.compileSpecification) {
                const compiler = new CompilerFacade_1.CompilerFacade(fs, path, ui, ui);
                try {
                    [spec,] = yield compiler.compile(options);
                }
                catch (err) {
                    hasErrors = true;
                    ui.showException(err);
                }
            }
            if (spec && options.ast) {
                const getCircularReplacer = () => {
                    const seen = new WeakSet();
                    return (/* key , */ value) => {
                        if ('object' === typeof value && value !== null) {
                            if (seen.has(value)) {
                                return;
                            }
                            seen.add(value);
                        }
                        return value;
                    };
                };
                try {
                    yield fileHandler.write(options.ast, JSON.stringify(spec, getCircularReplacer(), "  "));
                }
                catch (e) {
                    ui.showErrorSavingAbstractSyntaxTree(options.ast, e.message);
                    return false;
                }
                ui.announceAbstractSyntaxTreeIsSaved(options.ast);
                return true;
            }
            if (!plugin && (options.generateScript || options.executeScript || options.analyzeResult)) {
                ui.announceNoPluginWasDefined();
                return true;
            }
            // Abstract test scripts
            let abstractTestScripts = [];
            let generatedTestScriptFiles = [];
            if (spec && options.generateScript) { // Requires spec and a plugin
                let docs = spec.docs;
                // console.log( '>> spec docs', spec.docs.map( d => d.fileInfo.path ) );
                // if ( options.files && options.files.length > 0 ) {
                //     const endsWithFeatureExtension = new RegExp( `/\\${options.extensionFeature}$/`, 'u' );
                //     const transformFeaturesFilesIntoTestCaseFiles = Array.from( new Set(
                //         options.files.map( f => toUnixPath( f.replace( endsWithFeatureExtension, options.extensionTestCase ) ) )
                //         ) );
                //     console.log( '>> FILTER >>', transformFeaturesFilesIntoTestCaseFiles );
                //     const docContainsPath = ( doc: Document, path: string ): boolean => {
                //         // console.log( 'DOC', toUnixPath( doc.fileInfo.path ), 'PATH', toUnixPath( path ) );
                //         return toUnixPath( doc.fileInfo.path ).endsWith( toUnixPath( path ) );
                //     };
                //     docs = spec.docs.filter( doc => transformFeaturesFilesIntoTestCaseFiles.findIndex( file => docContainsPath( doc, file ) ) >= 0 );
                //     console.log( '>> docs after filter >>', spec.docs.map( d => d.fileInfo.path ) );
                // }
                const atsGenerator = new AbstractTestScriptGenerator_1.AbstractTestScriptGenerator();
                abstractTestScripts = atsGenerator.generate(docs, spec);
                if (abstractTestScripts.length > 0) {
                    const startTime = Date.now();
                    // cli.newLine( cli.symbolInfo, 'Generated', abstractTestScripts.length, 'abstract test scripts' );
                    let errors = [];
                    try {
                        const r = yield plugin.generateCode(abstractTestScripts, new concordialang_plugin_1.TestScriptGenerationOptions(options.plugin, options.dirScript, options.directory));
                        generatedTestScriptFiles = r.generatedFiles || [];
                        errors = r.errors;
                    }
                    catch (err) {
                        hasErrors = true;
                        ui.showException(err);
                    }
                    const durationMS = Date.now() - startTime;
                    ui.showGeneratedTestScriptFiles(options.dirScript, generatedTestScriptFiles, durationMS);
                    ui.showTestScriptGenerationErrors(errors);
                }
            }
            let executionResult = null;
            const shouldExecuteScripts = !!plugin &&
                (options.executeScript &&
                    (((_a = options.scriptFile) === null || _a === void 0 ? void 0 : _a.length) > 0 ||
                        generatedTestScriptFiles.length > 0 ||
                        ('string' === typeof options.dirResult && options.dirResult != '')));
            if (shouldExecuteScripts) { // Execution requires a plugin, but NOT a spec
                // console.log( '>>>', 'generatedTestScriptFiles', generatedTestScriptFiles );
                const scriptFiles = ((_b = options.scriptFile) === null || _b === void 0 ? void 0 : _b.length) > 0
                    ? options.scriptFile.join(',')
                    : generatedTestScriptFiles.length > 0
                        ? generatedTestScriptFiles.join(',')
                        : undefined;
                const tseo = {
                    dirScript: options.dirScript,
                    dirResult: options.dirResult,
                    file: scriptFiles,
                    grep: options.scriptGrep || undefined,
                    target: options.target || undefined,
                    headless: options.headless || undefined,
                    instances: options.instances || undefined,
                };
                ui.announceTestScriptExecutionStarted();
                try {
                    executionResult = yield plugin.executeCode(tseo);
                }
                catch (err) {
                    hasErrors = true;
                    ui.announceTestScriptExecutionError(err);
                }
                ui.announceTestScriptExecutionFinished();
            }
            if (!hasErrors && (((_c = executionResult === null || executionResult === void 0 ? void 0 : executionResult.total) === null || _c === void 0 ? void 0 : _c.failed) > 0 || ((_d = executionResult === null || executionResult === void 0 ? void 0 : executionResult.total) === null || _d === void 0 ? void 0 : _d.error) > 0)) {
                hasErrors = true;
            }
            if (options.analyzeResult) { // Requires a plugin
                let reportFile;
                if (!executionResult) {
                    const defaultReportFile = path.join(options.dirResult, yield plugin.defaultReportFile());
                    if (!fs.existsSync(defaultReportFile)) {
                        ui.announceReportFileNotFound(defaultReportFile);
                        return false;
                    }
                    reportFile = defaultReportFile;
                }
                else {
                    reportFile = executionResult.sourceFile;
                }
                try {
                    let reportedResult = yield plugin.convertReportFile(reportFile);
                    reportedResult = (new TestResultAnalyzer_1.TestResultAnalyzer()).adjustResult(reportedResult, abstractTestScripts);
                    ui.showTestScriptAnalysis(reportedResult);
                    if (!hasErrors && (((_e = reportedResult === null || reportedResult === void 0 ? void 0 : reportedResult.total) === null || _e === void 0 ? void 0 : _e.failed) > 0 || ((_f = reportedResult === null || reportedResult === void 0 ? void 0 : reportedResult.total) === null || _f === void 0 ? void 0 : _f.error) > 0)) {
                        hasErrors = true;
                    }
                }
                catch (err) {
                    hasErrors = true;
                    ui.showException(err);
                }
            }
            return !hasErrors;
        });
    }
}
exports.App = App;