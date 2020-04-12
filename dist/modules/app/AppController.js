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
const terminalLink = require("terminal-link");
const updateNotifier = require("update-notifier");
const CLI_1 = require("../cli/CLI");
const CliHelp_1 = require("../cli/CliHelp");
const GuidedConfig_1 = require("../cli/GuidedConfig");
const LanguageDrawer_1 = require("../cli/LanguageDrawer");
const OptionsHandler_1 = require("../cli/OptionsHandler");
const UI_1 = require("../cli/UI");
const CompilerFacade_1 = require("../compiler/CompilerFacade");
const LanguageManager_1 = require("../language/LanguageManager");
const PackageBasedPluginFinder_1 = require("../plugin/PackageBasedPluginFinder");
const PluginController_1 = require("../plugin/PluginController");
const PluginDrawer_1 = require("../plugin/PluginDrawer");
const PluginManager_1 = require("../plugin/PluginManager");
const TestResultAnalyzer_1 = require("../testscript/TestResultAnalyzer");
const file_1 = require("../util/file");
const ATSGenController_1 = require("./ATSGenController");
const SimpleAppUI_1 = require("./listeners/SimpleAppUI");
const VerboseAppUI_1 = require("./listeners/VerboseAppUI");
/**
 * Application controller
 *
 * TO-DO: Refactor!
 *
 * @author Thiago Delgado Pinto
 */
class AppController {
    start(appPath, processPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const cli = new CLI_1.CLI();
            const cliHelp = new CliHelp_1.CliHelp();
            const meowInstance = meow(cliHelp.content(), cliHelp.meowOptions());
            const optionsHandler = new OptionsHandler_1.OptionsHandler(appPath, processPath, cli, meowInstance);
            let options;
            let appListener = new SimpleAppUI_1.SimpleAppUI(cli);
            // Load options
            try {
                options = yield optionsHandler.load();
                appListener.setDebugMode(options.debug);
            }
            catch (err) {
                appListener.exception(err);
                return false; // exit
            }
            if (options.verbose) {
                appListener = new VerboseAppUI_1.VerboseAppUI(cli, options.debug);
            }
            if (options.init) {
                if (optionsHandler.wasLoaded()) {
                    appListener.warn('You already have a configuration file.');
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
                    appListener.exception(err);
                    // continue!
                }
            }
            let ui = new UI_1.UI(cli, meowInstance);
            //console.log( options );
            if (options.help) {
                ui.showHelp();
                return true;
            }
            if (options.about) {
                ui.showAbout();
                return true;
            }
            if (options.version) {
                ui.showVersion();
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
                // When the terminal does not support links
                const fallback = (text, url) => {
                    return url;
                };
                const url = 'https://github.com/thiagodp/concordialang/releases';
                const link = terminalLink(url, url, { fallback: fallback }); // clickable URL
                const diff = semverDiff(notifier.update.current, notifier.update.latest);
                const hasBreakingChange = 'major' === diff;
                appListener.announceUpdateAvailable(link, hasBreakingChange);
            }
            if (options.newer) {
                if (!notifier.update) {
                    appListener.announceNoUpdateAvailable();
                }
                return true;
            }
            let pluginData = null;
            const dirSearcher = new file_1.FSDirSearcher(fs);
            const fileSearcher = new file_1.FSFileSearcher(fs);
            const fileHandler = new file_1.FSFileHandler(fs, options.encoding);
            const pluginManager = new PluginManager_1.PluginManager(cli, new PackageBasedPluginFinder_1.PackageBasedPluginFinder(options.processPath, fileHandler, dirSearcher), fileHandler);
            let plugin = null;
            if (options.somePluginOption()) {
                const pluginController = new PluginController_1.PluginController();
                const pluginDrawer = new PluginDrawer_1.PluginDrawer(cli);
                try {
                    yield pluginController.process(options, pluginManager, pluginDrawer);
                }
                catch (err) {
                    appListener.exception(err);
                    return false;
                }
                return true;
            }
            else if (options.someOptionThatRequiresAPlugin() && options.hasPluginName()) {
                try {
                    pluginData = yield pluginManager.pluginWithName(options.plugin);
                    if (!pluginData) {
                        const msg = 'Plugin "' + options.plugin + '" not found at "' + options.pluginDir + '".';
                        appListener.error(msg);
                        return true;
                    }
                    plugin = yield pluginManager.load(pluginData);
                }
                catch (err) {
                    appListener.exception(err);
                    return false;
                }
                if (!pluginData) { // needed?
                    appListener.error('Plugin not found:', options.plugin);
                    return false;
                }
                if (!plugin) { // needed?
                    appListener.error('Could not load the plugin:', options.plugin);
                    return false;
                }
                // can continue
            }
            if (options.languageList) {
                try {
                    yield this.listLanguages(options, cli, fileSearcher);
                }
                catch (err) {
                    appListener.exception(err);
                    return false;
                }
                return true;
            }
            let hasErrors = false;
            let spec = null;
            appListener.announceOptions(options);
            if (options.compileSpecification) {
                const compiler = new CompilerFacade_1.CompilerFacade(fs, appListener, appListener);
                try {
                    [spec,] = yield compiler.compile(options);
                }
                catch (err) {
                    hasErrors = true;
                    appListener.exception(err);
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
                    appListener.error('Error saving', cli.colorHighlight(options.ast), ': ' + e.message);
                    return false;
                }
                appListener.info('Saved', cli.colorHighlight(options.ast));
                return true;
            }
            if (!plugin && (options.generateScript || options.executeScript || options.analyzeResult)) {
                appListener.warn('A plugin was not defined.');
                return true;
            }
            let abstractTestScripts = [];
            if (spec !== null) {
                const atsCtrl = new ATSGenController_1.ATSGenController();
                abstractTestScripts = atsCtrl.generate(spec);
                if (options.generateScript) { // Requires a plugin
                    if (abstractTestScripts.length > 0) {
                        // cli.newLine( cli.symbolInfo, 'Generated', abstractTestScripts.length, 'abstract test scripts' );
                        let errors = [];
                        let files = [];
                        try {
                            files = yield plugin.generateCode(abstractTestScripts, new concordialang_plugin_1.TestScriptGenerationOptions(options.plugin, options.dirScript, options.directory), errors);
                        }
                        catch (err) {
                            hasErrors = true;
                            appListener.exception(err);
                        }
                        // When the terminal does not support links
                        const fallback = (text, url) => {
                            return text;
                        };
                        for (const file of files) {
                            const relPath = path_1.relative(options.dirScript, file);
                            const link = terminalLink(relPath, file, { fallback: fallback }); // clickable URL
                            appListener.success('Generated script', cli.colorHighlight(link));
                        }
                        for (const err of errors) {
                            // cli.newLine( cli.symbolError, err.message );
                            appListener.exception(err);
                        }
                    }
                }
            }
            let executionResult = null;
            if (options.executeScript) { // Requires a plugin
                const tseo = new concordialang_plugin_1.TestScriptExecutionOptions(options.dirScript, options.dirResult);
                appListener.testScriptExecutionStarted();
                try {
                    executionResult = yield plugin.executeCode(tseo);
                }
                catch (err) {
                    hasErrors = true;
                    appListener.testScriptExecutionError(err);
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
                        appListener.warn('Could not retrieve execution results.');
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
                    appListener.testScriptExecutionFinished(reportedResult);
                }
                catch (err) {
                    hasErrors = true;
                    appListener.exception(err);
                }
            }
            return !hasErrors;
        });
    }
    listLanguages(options, cli, fileSearcher) {
        return __awaiter(this, void 0, void 0, function* () {
            const lm = new LanguageManager_1.LanguageManager(fileSearcher, options.languageDir);
            const languages = yield lm.availableLanguages();
            const ld = new LanguageDrawer_1.LanguageDrawer(cli);
            ld.drawLanguages(languages);
        });
    }
}
exports.AppController = AppController;
