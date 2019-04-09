"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("util");
const meow = require("meow");
const updateNotifier = require("update-notifier");
const testscript_1 = require("concordialang-types/testscript");
const UI_1 = require("./UI");
const PluginController_1 = require("../plugin/PluginController");
const CLI_1 = require("./CLI");
const CompilerController_1 = require("./CompilerController");
const LanguageController_1 = require("./LanguageController");
const PluginManager_1 = require("../plugin/PluginManager");
const CliScriptExecutionReporter_1 = require("./CliScriptExecutionReporter");
const ATSGenController_1 = require("./ATSGenController");
const CliHelp_1 = require("./CliHelp");
const OptionsHandler_1 = require("./OptionsHandler");
const TestResultAnalyzer_1 = require("../testscript/TestResultAnalyzer");
const GuidedConfig_1 = require("./GuidedConfig");
const PackageBasedPluginFinder_1 = require("../plugin/PackageBasedPluginFinder");
/**
 * Application controller
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
            // Load options
            try {
                options = yield optionsHandler.load();
            }
            catch (err) {
                this.showException(err, options, cli);
                return false; // exit
            }
            if (options.init) {
                if (optionsHandler.wasLoaded()) {
                    cli.newLine(cli.symbolWarning, 'You already have a configuration file.');
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
                    this.showException(err, options, cli);
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
            if (options.init) {
                return true;
            }
            const pkg = meowInstance.pkg; // require( './package.json' );
            const notifier = updateNotifier({
                pkg,
                updateCheckInterval: 1000 * 60 * 60 * 12 // 12 hours
            });
            notifier.notify();
            if (options.newer) {
                if (!notifier.update) {
                    cli.newLine(cli.symbolInfo, 'No update available');
                }
                return true;
            }
            let pluginData = null;
            // let pluginManager: PluginManager = new PluginManager( options.pluginDir );
            let pluginManager = new PluginManager_1.PluginManager(options.pluginDir, new PackageBasedPluginFinder_1.PackageBasedPluginFinder(options.processPath));
            let plugin = null;
            if (options.somePluginOption()) {
                let pluginController = new PluginController_1.PluginController(cli);
                try {
                    yield pluginController.process(options);
                }
                catch (err) {
                    this.showException(err, options, cli);
                    return false;
                }
                return true;
            }
            else if (options.someOptionThatRequiresAPlugin() && options.hasPluginName()) {
                try {
                    pluginData = yield pluginManager.pluginWithName(options.plugin);
                    if (!pluginData) {
                        cli.newLine(cli.symbolError, 'Plugin "' + options.plugin + '" not found at "' + options.pluginDir + '".');
                        return true;
                    }
                    plugin = yield pluginManager.load(pluginData);
                }
                catch (err) {
                    this.showException(err, options, cli);
                    return false;
                }
                if (!pluginData) { // needed?
                    cli.newLine(cli.symbolError, 'Plugin not found:', options.plugin);
                    return false;
                }
                if (!plugin) { // needed?
                    cli.newLine(cli.symbolError, 'Could not load the plugin:', options.plugin);
                    return false;
                }
                // can continue
            }
            if (options.languageList) {
                let langController = new LanguageController_1.LanguageController(cli);
                try {
                    yield langController.process(options);
                }
                catch (err) {
                    this.showException(err, options, cli);
                    return false;
                }
                return true;
            }
            let hasErrors = false;
            let spec = null;
            let graph = null;
            if (options.compileSpecification) {
                if (!options.generateTestCase) {
                    cli.newLine(cli.symbolInfo, 'Test Case generation disabled.');
                }
                let compilerController = new CompilerController_1.CompilerController();
                try {
                    [spec, graph] = yield compilerController.compile(options, cli);
                }
                catch (err) {
                    hasErrors = true;
                    this.showException(err, options, cli);
                }
            }
            else {
                cli.newLine(cli.symbolInfo, 'Specification compilation disabled.');
            }
            //cli.newLine( '-=[ SPEC ]=-', "\n\n" );
            //cli.newLine( spec );
            if (options.ast) {
                const getCircularReplacer = () => {
                    const seen = new WeakSet();
                    return (key, value) => {
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
                    const write = util_1.promisify(fs_1.writeFile);
                    yield write(options.ast, JSON.stringify(spec, getCircularReplacer(), "  "));
                }
                catch (e) {
                    cli.newLine(cli.symbolError, 'Error saving', cli.colorHighlight(options.ast), ': ' + e.message);
                    return false;
                }
                cli.newLine(cli.symbolInfo, 'Saved', cli.colorHighlight(options.ast));
                return true;
            }
            if (!plugin && (options.generateScript || options.executeScript || options.analyzeResult)) {
                cli.newLine(cli.symbolWarning, 'A plugin was not defined.');
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
                            files = yield plugin.generateCode(abstractTestScripts, new testscript_1.TestScriptGenerationOptions(options.plugin, options.dirScript), errors);
                        }
                        catch (err) {
                            hasErrors = true;
                            this.showException(err, options, cli);
                        }
                        for (let file of files) {
                            cli.newLine(cli.symbolSuccess, 'Generated script', cli.colorHighlight(file));
                        }
                        for (let err of errors) {
                            // cli.newLine( cli.symbolError, err.message );
                            this.showException(err, options, cli);
                        }
                    }
                    else {
                        cli.newLine(cli.symbolInfo, 'No generated abstract test scripts.');
                    }
                }
                else {
                    cli.newLine(cli.symbolInfo, 'Script generation disabled.');
                }
            }
            let executionResult = null;
            if (options.executeScript) { // Requires a plugin
                let tseo = new testscript_1.TestScriptExecutionOptions(options.dirScript, options.dirResult);
                cli.newLine(cli.symbolInfo, 'Executing test scripts...');
                const LINE_SIZE = 80;
                const SEPARATION_LINE = '_'.repeat(LINE_SIZE);
                cli.newLine(SEPARATION_LINE);
                try {
                    executionResult = yield plugin.executeCode(tseo);
                }
                catch (err) {
                    hasErrors = true;
                    this.showException(err, options, cli);
                }
            }
            else {
                cli.newLine(cli.symbolInfo, 'Script execution disabled.');
            }
            if (options.analyzeResult) { // Requires a plugin
                if (!executionResult) {
                    cli.newLine(cli.symbolError, 'Could not retrieve execution results.');
                    return false;
                }
                try {
                    let reportedResult = yield plugin.convertReportFile(executionResult.sourceFile);
                    (new TestResultAnalyzer_1.TestResultAnalyzer()).adjustResult(reportedResult, abstractTestScripts);
                    (new CliScriptExecutionReporter_1.CliScriptExecutionReporter(cli)).scriptExecuted(reportedResult);
                }
                catch (err) {
                    hasErrors = true;
                    this.showException(err, options, cli);
                }
            }
            else {
                cli.newLine(cli.symbolInfo, 'Results\' analysis disabled.');
            }
            if (!options.compileSpecification
                && !options.generateTestCase
                && !options.generateScript
                && !options.executeScript
                && !options.analyzeResult) {
                cli.newLine(cli.symbolWarning, 'Well, you have disabled all the interesting behavior. :)');
            }
            return !hasErrors;
        });
    }
    showException(err, options, cli) {
        (!options ? true : options.debug)
            ? cli.newLine(cli.symbolError, err.message, this.formattedStackOf(err))
            : cli.newLine(cli.symbolError, err.message);
    }
    formattedStackOf(err) {
        return "\n  DETAILS: " + err.stack.substring(err.stack.indexOf("\n"));
    }
}
exports.AppController = AppController;
