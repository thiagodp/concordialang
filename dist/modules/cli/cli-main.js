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
exports.main = void 0;
// console.log( '---> process.argv', process.argv );
const cosmiconfig_1 = require("cosmiconfig");
const damerau_levenshtein_js_1 = require("damerau-levenshtein-js");
const fs = require("fs");
const path = require("path");
const readPkgUp = require("read-pkg-up");
const semverDiff = require("semver-diff");
const updateNotifier = require("update-notifier");
const util_1 = require("util");
const App_1 = require("../app/App");
const options_importer_1 = require("../app/options-importer");
const options_maker_1 = require("../app/options-maker");
const options_exporter_1 = require("../app/options-exporter");
const database_package_manager_1 = require("../db/database-package-manager");
const LanguageManager_1 = require("../language/LanguageManager");
const locale_manager_1 = require("../language/locale-manager");
const plugin_1 = require("../plugin");
const best_match_1 = require("../util/best-match");
const fs_1 = require("../util/fs");
const package_installation_1 = require("../util/package-installation");
const run_command_1 = require("../util/run-command");
const args_1 = require("./args");
const cli_help_1 = require("./cli-help");
const CliOnlyOptions_1 = require("./CliOnlyOptions");
const GuidedConfig_1 = require("./GuidedConfig");
const SimpleUI_1 = require("./SimpleUI");
const VerboseUI_1 = require("./VerboseUI");
// Prevent caching of this module so module.parent is always accurate
// delete require.cache[__filename];
// const parentDir = path.dirname(module.parent.filename);
function main(appPath, processPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let options = options_maker_1.makeAllOptions(appPath, processPath);
        // Parse CLI arguments
        // console.log( process.argv );
        const args = args_1.parseArgs(process.argv.slice(2));
        // console.log( 'ARGS:', args );
        // Show invalid options whether needed
        const unexpectedKeys = args && args.unexpected
            ? Object.keys(args.unexpected)
            : [];
        if (unexpectedKeys.length > 0) {
            const similarity = (a, b) => 1 / damerau_levenshtein_js_1.distance(a, b);
            const putDashes = t => '-'.repeat(1 === t.length ? 1 : 2) + t;
            for (const k of unexpectedKeys) {
                const match = best_match_1.bestMatch(k, args.allFlags, similarity);
                const dK = putDashes(k);
                if (!match) {
                    console.log(`Invalid option: "${dK}"`);
                    continue;
                }
                const dMatch = putDashes(match.value);
                console.log(`Invalid option: "${dK}". Did you mean "${dMatch}"?`);
            }
            return false;
        }
        // Copy parsed arguments to options
        const cliOptions = args.flags; // Object.assign( {}, args.flags ); // copy
        try {
            // Adapt to look like Options
            const input = args.input;
            if (!cliOptions.directory && input && 1 === input.length) {
                cliOptions.directory = input[0];
            }
            const errors = options_importer_1.copyOptions(cliOptions, options);
            for (const e of errors) {
                console.log(e);
            }
            if (errors.length > 0) {
                return false;
            }
        }
        catch (_a) {
            // continue
        }
        // console.log( 'OPTIONS:', options );
        // Start UI
        const ui = options.verbose
            ? new VerboseUI_1.VerboseUI(options.debug)
            : new SimpleUI_1.SimpleUI(options.debug);
        // Show help
        if (options.help) {
            ui.showHelp(cli_help_1.helpContent());
            return true;
        }
        // Retrieve package data
        const parentDir = path.dirname(appPath);
        const pkg = readPkgUp.sync({
            cwd: parentDir,
            normalize: false
        }).packageJson || {};
        // Show about
        if (options.about) {
            ui.showAbout({
                description: pkg.description || 'Concordia',
                version: pkg.version || '?',
                author: pkg.author['name'] || 'Thiago Delgado Pinto',
                homepage: pkg.homepage || 'https://concordialang.org'
            });
            return true;
        }
        // Show version
        if (options.version) {
            ui.showVersion(pkg.version || '?');
            return true;
        }
        // Check for updates
        const notifier = updateNotifier({
            pkg,
            updateCheckInterval: 1000 * 60 * 60 * 12 // 12 hours
        });
        notifier.notify(); // display a message only if an update is available
        if (!!notifier.update) {
            const diff = semverDiff(notifier.update.current, notifier.update.latest);
            const hasBreakingChange = 'major' === diff;
            const url = 'https://github.com/thiagodp/concordialang/releases';
            ui.announceUpdateAvailable(url, hasBreakingChange);
        }
        // Newer option ?
        if (options.newer) {
            if (!notifier.update) {
                ui.announceNoUpdateAvailable();
            }
            return true;
        }
        // DATABASE
        if (options.dbInstall) {
            const databases = options.dbInstall.split(',').map(d => d.trim());
            ui.announceDatabasePackagesInstallationStarted(1 === databases.length);
            let code = 1;
            try {
                code = yield database_package_manager_1.installDatabases(databases);
            }
            catch (_b) {
            }
            ui.announceDatabasePackagesInstallationFinished(code);
            return 0 === code;
        }
        if (options.dbUninstall) {
            const databases = options.dbUninstall.split(',').map(d => d.trim());
            ui.announceDatabasePackagesUninstallationStarted(1 === databases.length);
            let code = 1;
            try {
                code = yield database_package_manager_1.uninstallDatabases(databases);
            }
            catch (_c) {
            }
            ui.announceDatabasePackagesUninstallationFinished(code);
            return 0 === code;
        }
        if (options.dbList) {
            let databases = [];
            try {
                const nodeModulesDir = path.join(processPath, 'node_modules');
                databases = yield database_package_manager_1.allInstalledDatabases(nodeModulesDir, new fs_1.FSDirSearcher(fs, util_1.promisify));
                ui.drawDatabases(databases);
                return true;
            }
            catch (err) {
                ui.showError(err);
                return false;
            }
        }
        // LOCALE
        if (options.localeList) {
            // For now, only date locales are detected
            try {
                const nodeModulesDir = path.join(processPath, 'node_modules');
                const dateLocales = yield locale_manager_1.installedDateLocales(nodeModulesDir, new fs_1.FSDirSearcher(fs, util_1.promisify), path);
                ui.drawLocales(dateLocales, 'date', 'Unavailable locales fallback to the their language. Example: "es-AR" fallbacks to "es".');
                return true;
            }
            catch (err) {
                ui.showError(err);
                return false;
            }
        }
        // LANGUAGE
        if (options.languageList) {
            const fileSearcher = new fs_1.FSFileSearcher(fs);
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
        // LOAD CONFIG FILE OPTIONS
        let fileOptions = null;
        try {
            const startTime = Date.now();
            const MODULE_NAME = 'concordia';
            // @see https://github.com/davidtheclark/cosmiconfig
            const loadOptions = {
                stopDir: options.processPath
            };
            const explorer = cosmiconfig_1.cosmiconfig(MODULE_NAME, loadOptions);
            const cfg = yield explorer.load(options.config);
            fileOptions = cfg.config;
            // ADAPT KEYS
            // wanted, variation1, variation2, ...
            const optionsToConvert = [
                ['dirResult', 'dirResults'],
                ['dirScript', 'dirScripts'],
            ];
            // Adapt
            for (const [wanted, ...variations] of optionsToConvert) {
                for (const v of variations) {
                    if (fileOptions[v]) {
                        fileOptions[wanted] = fileOptions[v];
                        delete fileOptions[v];
                    }
                }
            }
            const durationMS = Date.now() - startTime;
            ui.announceConfigurationFileLoaded(cfg.filepath, durationMS);
        }
        catch (err) {
            // console.log( '>>', options.config, 'ERROR', err.message );
            ui.announceCouldNotLoadConfigurationFile(err.message);
            // continue
        }
        // console.log( 'CLI', cliOptions );
        // console.log( 'FILE', fileOptions );
        // CLI options override file options
        const userOptions = Object.assign({}, fileOptions || {}, cliOptions || {});
        // console.log( 'USER', userOptions );
        // Override default options with user options
        const errors = options_importer_1.copyOptions(userOptions, options);
        // console.log( 'OPTIONS', options );
        for (const e of errors) {
            console.log(e);
        }
        if (errors.length > 0) {
            return false;
        }
        // Init option ?
        if (options.init) {
            if (fileOptions) {
                ui.announceConfigurationFileAlreadyExists();
            }
            else {
                const guidedOptions = yield (new GuidedConfig_1.GuidedConfig()).prompt();
                const errors = options_importer_1.copyOptions(guidedOptions, options);
                for (const e of errors) {
                    console.log(e);
                }
                options.saveConfig = true;
                const packages = guidedOptions.databases || [];
                if (packages.length > 0) {
                    ui.announceDatabasePackagesInstallationStarted();
                    let code;
                    for (const pkg of packages) {
                        ui.announceDatabasePackage(pkg);
                        const cmd = package_installation_1.makePackageInstallCommand(pkg);
                        code = yield run_command_1.runCommand(cmd);
                        if (code !== 0) {
                            break;
                        }
                    }
                    ui.announceDatabasePackagesInstallationFinished(code);
                }
            }
        }
        // Save config option ?
        if (options.saveConfig) {
            const writeF = util_1.promisify(fs.writeFile);
            const defaultOptions = options_maker_1.makeAllOptions(appPath, processPath);
            const obj = options_exporter_1.createPersistableCopy(options, defaultOptions, true);
            const file = options.config;
            try {
                yield writeF(file, JSON.stringify(obj, undefined, "\t"));
                ui.announceConfigurationFileSaved(file);
            }
            catch (err) {
                ui.showException(err);
                // continue!
            }
        }
        if (options.init && !options.pluginInstall) {
            return true;
        }
        const fileHandler = new fs_1.FSFileHandler(fs, util_1.promisify, options.encoding);
        // PLUGIN
        if (CliOnlyOptions_1.hasSomePluginAction(options)) {
            const dirSearcher = new fs_1.FSDirSearcher(fs, util_1.promisify);
            const pluginFinder = new plugin_1.PackageBasedPluginFinder(options.processPath, fileHandler, dirSearcher);
            const pluginManager = new plugin_1.PluginManager(ui, pluginFinder, fileHandler);
            const pluginController = new plugin_1.PluginController();
            try {
                yield pluginController.process(options, pluginManager, ui);
            }
            catch (err) {
                ui.showException(err);
                return false;
            }
            return true;
        }
        const app = new App_1.App(fs, path, util_1.promisify);
        const { spec, success } = yield app.start(options, ui);
        // AST
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
        return success;
    });
}
exports.main = main;
