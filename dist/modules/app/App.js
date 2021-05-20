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
exports.App = void 0;
const concordialang_plugin_1 = require("concordialang-plugin");
const CompilerFacade_1 = require("../compiler/CompilerFacade");
const PackageBasedPluginFinder_1 = require("../plugin/PackageBasedPluginFinder");
const PluginManager_1 = require("../plugin/PluginManager");
const JSONTestReporter_1 = require("../report/JSONTestReporter");
const AbstractTestScriptGenerator_1 = require("../testscript/AbstractTestScriptGenerator");
const TestResultAnalyzer_1 = require("../testscript/TestResultAnalyzer");
const fs_1 = require("../util/fs");
const AppOptions_1 = require("./AppOptions");
/**
 * Application facade
 *
 * @author Thiago Delgado Pinto
 */
class App {
    constructor(_fs, _path, _promisify) {
        this._fs = _fs;
        this._path = _path;
        this._promisify = _promisify;
    }
    start(options, ui) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const fs = this._fs;
            const path = this._path;
            const promisify = this._promisify;
            const fileHandler = new fs_1.FSFileHandler(fs, promisify, options.encoding);
            // Load plug-in
            let plugin = null;
            if (AppOptions_1.hasSomeOptionThatRequiresAPlugin(options) && options.plugin) {
                const dirSearcher = new fs_1.FSDirSearcher(fs, promisify);
                const pluginManager = new PluginManager_1.PluginManager(ui, new PackageBasedPluginFinder_1.PackageBasedPluginFinder(options.processPath, fileHandler, dirSearcher), fileHandler);
                let pluginData = null;
                try {
                    pluginData = yield pluginManager.pluginWithName(options.plugin);
                    if (!pluginData) {
                        ui.announcePluginNotFound(options.plugin);
                        return { success: false };
                        ;
                    }
                    plugin = yield pluginManager.load(pluginData);
                }
                catch (err) {
                    ui.showException(err);
                    return { success: false };
                }
                if (!plugin) { // needed?
                    ui.announcePluginCouldNotBeLoaded(options.plugin);
                    return { success: false };
                    ;
                }
                // can continue
            }
            if (!plugin &&
                (options.script || options.run || options.result)) {
                ui.announceNoPluginWasDefined();
                return { success: false };
                ;
            }
            // Compile
            let hasErrors = false;
            let spec = null;
            ui.announceOptions(options);
            if (options.spec) {
                const compiler = new CompilerFacade_1.CompilerFacade(fs, path, promisify, ui, ui);
                try {
                    [spec,] = yield compiler.compile(options);
                }
                catch (err) {
                    hasErrors = true;
                    ui.showException(err);
                }
                if (null === spec && options.file.length > 0) {
                    return { success: !hasErrors };
                }
            }
            // Abstract test scripts
            let abstractTestScripts = [];
            let generatedTestScriptFiles = [];
            if (spec && options.script) { // Requires spec and a plugin
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
                if (abstractTestScripts && abstractTestScripts.length > 0) {
                    const startTime = Date.now();
                    // cli.newLine( cli.symbolInfo, 'Generated', abstractTestScripts.length, 'abstract test scripts' );
                    let errors = [];
                    try {
                        const r = yield plugin.generateCode(abstractTestScripts, new concordialang_plugin_1.TestScriptGenerationOptions(options.plugin, options.dirScript, options.directory));
                        generatedTestScriptFiles = (r === null || r === void 0 ? void 0 : r.generatedFiles) || [];
                        errors = (r === null || r === void 0 ? void 0 : r.errors) || [];
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
                (options.run &&
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
                    file: scriptFiles || undefined,
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
            if (options.result) { // Requires a plugin
                let reportFile;
                if (!executionResult) {
                    const defaultReportFile = path.join(options.dirResult, yield plugin.defaultReportFile());
                    if (!fs.existsSync(defaultReportFile)) {
                        ui.announceReportFileNotFound(defaultReportFile);
                        return { success: false, spec };
                    }
                    reportFile = defaultReportFile;
                }
                else {
                    reportFile = executionResult.sourceFile;
                }
                if (reportFile) {
                    ui.announceReportFile(reportFile);
                    try {
                        executionResult = yield plugin.convertReportFile(reportFile);
                    }
                    catch (err) {
                        hasErrors = true;
                        ui.showException(err);
                    }
                }
            }
            if (executionResult) {
                try {
                    const reportedResult = (new TestResultAnalyzer_1.TestResultAnalyzer()).adjustResult(executionResult, abstractTestScripts);
                    ui.showTestScriptAnalysis(reportedResult);
                    // TODO: save report to file
                    const reporter = new JSONTestReporter_1.JSONTestReporter(fileHandler, path);
                    yield reporter.report(reportedResult, { directory: options.dirResult, useTimestamp: false });
                    // ---
                    if (!hasErrors && (((_e = reportedResult === null || reportedResult === void 0 ? void 0 : reportedResult.total) === null || _e === void 0 ? void 0 : _e.failed) > 0 || ((_f = reportedResult === null || reportedResult === void 0 ? void 0 : reportedResult.total) === null || _f === void 0 ? void 0 : _f.error) > 0)) {
                        hasErrors = true;
                    }
                }
                catch (err) {
                    hasErrors = true;
                    ui.showException(err);
                }
            }
            return { success: !hasErrors, spec };
        });
    }
}
exports.App = App;
