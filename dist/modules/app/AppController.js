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
const fs = require("fs");
const meow = require("meow");
const path_1 = require("path");
const semverDiff = require("semver-diff");
const updateNotifier = require("update-notifier");
const CLI_1 = require("../cli/CLI");
const CliHelp_1 = require("../cli/CliHelp");
const GuidedConfig_1 = require("../cli/GuidedConfig");
const OptionsHandler_1 = require("../cli/OptionsHandler");
const SimpleAppUI_1 = require("../cli/SimpleAppUI");
const VerboseAppUI_1 = require("../cli/VerboseAppUI");
const CompilerFacade_1 = require("../compiler/CompilerFacade");
const LanguageManager_1 = require("../language/LanguageManager");
const PackageBasedPluginFinder_1 = require("../plugin/PackageBasedPluginFinder");
const PluginController_1 = require("../plugin/PluginController");
const PluginManager_1 = require("../plugin/PluginManager");
const AbstractTestScriptGenerator_1 = require("../testscript/AbstractTestScriptGenerator");
const TestResultAnalyzer_1 = require("../testscript/TestResultAnalyzer");
const file_1 = require("../util/file");
const util_1 = require("../util");
/**
 * Application controller
 *
 * TO-DO: Refactor!
 *
 * @author Thiago Delgado Pinto
 */
class AppController {
    adaptMeowObject(meowObj) {
        let obj = Object.assign({}, meowObj.flags);
        const input = meowObj.input;
        if (!obj.directory && (util_1.isDefined(input) && 1 === input.length)) {
            obj.directory = input[0];
        }
        return obj;
    }
    start(appPath, processPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const cli = new CLI_1.CLI();
            const cliHelp = new CliHelp_1.CliHelp();
            const meowInstance = meow(cliHelp.content(), cliHelp.meowOptions());
            const cliOptions = this.adaptMeowObject(meowInstance);
            let appUI = new SimpleAppUI_1.SimpleAppUI(cli, meowInstance);
            const optionsHandler = new OptionsHandler_1.OptionsHandler(appPath, processPath, appUI);
            let options;
            // Load options
            try {
                options = yield optionsHandler.load(cliOptions);
                appUI.setDebugMode(options.debug);
            }
            catch (err) {
                appUI.exception(err);
                return false; // exit
            }
            if (options.verbose) {
                appUI = new VerboseAppUI_1.VerboseAppUI(cli, meowInstance, options.debug);
            }
            if (options.init) {
                if (optionsHandler.wasLoaded()) {
                    appUI.announceConfigurationFileAlreadyExists();
                }
                else {
                    options = yield (new GuidedConfig_1.GuidedConfig()).prompt(options);
                    options.saveConfig = true;
                }
            }
            // Save config ?
            if (options.saveConfig) {
                try {
                    yield optionsHandler.save();
                }
                catch (err) {
                    appUI.exception(err);
                    // continue!
                }
            }
            //console.log( options );
            if (options.help) {
                appUI.showHelp();
                return true;
            }
            if (options.about) {
                appUI.showAbout();
                return true;
            }
            if (options.version) {
                appUI.showVersion();
                return true;
            }
            if (options.init && !options.pluginInstall) {
                return true;
            }
            const pkg = meowInstance.pkg; // require( './package.json' );
            const notifier = updateNotifier({
                pkg,
                updateCheckInterval: 1000 * 60 * 60 * 12 // 12 hours
            });
            notifier.notify(); // display a message only if an update is available
            if (!!notifier.update) {
                const diff = semverDiff(notifier.update.current, notifier.update.latest);
                const hasBreakingChange = 'major' === diff;
                const url = 'https://github.com/thiagodp/concordialang/releases';
                appUI.announceUpdateAvailable(url, hasBreakingChange);
            }
            if (options.newer) {
                if (!notifier.update) {
                    appUI.announceNoUpdateAvailable();
                }
                return true;
            }
            let pluginData = null;
            const dirSearcher = new file_1.FSDirSearcher(fs);
            const fileSearcher = new file_1.FSFileSearcher(fs);
            const fileHandler = new file_1.FSFileHandler(fs, options.encoding);
            const pluginManager = new PluginManager_1.PluginManager(appUI, new PackageBasedPluginFinder_1.PackageBasedPluginFinder(options.processPath, fileHandler, dirSearcher), fileHandler);
            let plugin = null;
            if (options.somePluginOption()) {
                const pluginController = new PluginController_1.PluginController();
                try {
                    yield pluginController.process(options, pluginManager, appUI);
                }
                catch (err) {
                    appUI.exception(err);
                    return false;
                }
                return true;
            }
            else if (options.someOptionThatRequiresAPlugin() && options.hasPluginName()) {
                try {
                    pluginData = yield pluginManager.pluginWithName(options.plugin);
                    if (!pluginData) {
                        appUI.announcePluginNotFound(options.pluginDir, options.plugin);
                        return false;
                    }
                    plugin = yield pluginManager.load(pluginData);
                }
                catch (err) {
                    appUI.exception(err);
                    return false;
                }
                if (!plugin) { // needed?
                    appUI.announcePluginCouldNotBeLoaded(options.plugin);
                    return false;
                }
                // can continue
            }
            if (options.languageList) {
                const lm = new LanguageManager_1.LanguageManager(fileSearcher, options.languageDir);
                try {
                    const languages = yield lm.availableLanguages();
                    appUI.drawLanguages(languages);
                }
                catch (err) {
                    appUI.exception(err);
                    return false;
                }
                return true;
            }
            let hasErrors = false;
            let spec = null;
            appUI.announceOptions(options);
            if (options.compileSpecification) {
                const compiler = new CompilerFacade_1.CompilerFacade(fs, appUI, appUI);
                try {
                    [spec,] = yield compiler.compile(options);
                }
                catch (err) {
                    hasErrors = true;
                    appUI.exception(err);
                }
            }
            if (options.ast) {
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
                    appUI.showErrorSavingAST(options.ast, e.message);
                    return false;
                }
                appUI.announceASTIsSaved(options.ast);
                return true;
            }
            if (!plugin && (options.generateScript || options.executeScript || options.analyzeResult)) {
                appUI.announceNoPluginWasDefined();
                return true;
            }
            let abstractTestScripts = [];
            let generatedTestScriptFiles = [];
            if (spec && options.generateScript) { // Requires a plugin
                let docs = spec.docs;
                if (options.files && options.files.length > 0) {
                    const testCaseFilesToFilter = options.files.map(f => file_1.toUnixPath(f.replace(/\.feature$/u, '.testcase')));
                    // console.log( '>> FILTER >>', testCaseFilesToFilter );
                    // console.log( '>> docs before filter >>', spec.docs.map( d => d.fileInfo.path ) );
                    const docHasPath = (doc, path) => {
                        // console.log( 'DOC', toUnixPath( doc.fileInfo.path ), 'PATH', toUnixPath( path ) );
                        return file_1.toUnixPath(doc.fileInfo.path).endsWith(file_1.toUnixPath(path));
                    };
                    docs = spec.docs.filter(doc => testCaseFilesToFilter.findIndex(file => docHasPath(doc, file)) >= 0);
                }
                const atsGenerator = new AbstractTestScriptGenerator_1.AbstractTestScriptGenerator();
                abstractTestScripts = atsGenerator.generate(docs, spec);
                if (abstractTestScripts.length > 0) {
                    // cli.newLine( cli.symbolInfo, 'Generated', abstractTestScripts.length, 'abstract test scripts' );
                    let errors = [];
                    try {
                        generatedTestScriptFiles = yield plugin.generateCode(abstractTestScripts, new concordialang_plugin_1.TestScriptGenerationOptions(options.plugin, options.dirScript, options.directory), errors);
                    }
                    catch (err) {
                        hasErrors = true;
                        appUI.exception(err);
                    }
                    appUI.showGeneratedTestScriptFiles(options.dirScript, generatedTestScriptFiles);
                    appUI.showTestScriptGenerationErrors(errors);
                }
            }
            let executionResult = null;
            if (options.executeScript) { // Requires a plugin
                const tseo = new concordialang_plugin_1.TestScriptExecutionOptions(options.dirScript, options.dirResult);
                appUI.testScriptExecutionStarted();
                try {
                    executionResult = yield plugin.executeCode(tseo);
                }
                catch (err) {
                    hasErrors = true;
                    appUI.testScriptExecutionError(err);
                }
            }
            else {
                // appListener.testScriptExecutionDisabled();
            }
            if (options.analyzeResult) { // Requires a plugin
                let reportFile;
                if (!executionResult) {
                    const defaultReportFile = path_1.join(options.dirResult, yield plugin.defaultReportFile());
                    if (!fs.existsSync(defaultReportFile)) {
                        appUI.announceReportFileNotFound(defaultReportFile);
                        return false;
                    }
                    reportFile = defaultReportFile;
                }
                else {
                    reportFile = executionResult.sourceFile;
                }
                try {
                    let reportedResult = yield plugin.convertReportFile(reportFile);
                    (new TestResultAnalyzer_1.TestResultAnalyzer()).adjustResult(reportedResult, abstractTestScripts);
                    appUI.testScriptExecutionFinished(reportedResult);
                }
                catch (err) {
                    hasErrors = true;
                    appUI.exception(err);
                }
            }
            return !hasErrors;
        });
    }
}
exports.AppController = AppController;
