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
const cosmiconfig_1 = require("cosmiconfig");
const fs = require("fs");
const meow = require("meow");
const path = require("path");
const semverDiff = require("semver-diff");
const updateNotifier = require("update-notifier");
const util_1 = require("util");
const app_1 = require("../app");
const database_package_manager_1 = require("../db/database-package-manager");
const locale_manager_1 = require("../language/locale-manager");
const file_1 = require("../util/file");
const package_installation_1 = require("../util/package-installation");
const run_command_1 = require("../util/run-command");
const CliHelp_1 = require("./CliHelp");
const GuidedConfig_1 = require("./GuidedConfig");
const SimpleUI_1 = require("./SimpleUI");
const VerboseUI_1 = require("./VerboseUI");
function main(appPath, processPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = new app_1.Options(appPath, processPath);
        // Load CLI options
        const cliHelp = new CliHelp_1.CliHelp();
        const meowResult = meow(cliHelp.content(), cliHelp.meowOptions());
        let cliOptions = {};
        try {
            // Adapt to look like Options
            const obj = Object.assign({}, meowResult.flags); // copy
            const input = meowResult.input;
            if (!obj.directory && input && 1 === input.length) {
                obj.directory = input[0];
            }
            cliOptions = obj;
            options.import(cliOptions);
        }
        catch (_a) {
            // continue
        }
        // Start UI
        const ui = options.verbose
            ? new VerboseUI_1.VerboseUI(meowResult, options.debug)
            : new SimpleUI_1.SimpleUI(meowResult, options.debug);
        // Show help ?
        if (options.help) {
            ui.showHelp();
            return true;
        }
        // Show about ?
        if (options.about) {
            ui.showAbout();
            return true;
        }
        // Show version ?
        if (options.version) {
            ui.showVersion();
            return true;
        }
        // Check for updates
        const pkg = meowResult.pkg; // require( './package.json' );
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
                databases = yield database_package_manager_1.allInstalledDatabases(nodeModulesDir, new file_1.FSDirSearcher(fs));
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
                const dateLocales = yield locale_manager_1.installedDateLocales(nodeModulesDir, new file_1.FSDirSearcher(fs), path);
                ui.drawLocales(dateLocales, 'date', 'Unavailable locales fallback to the their language. Example: "es-AR" fallbacks to "es".');
                return true;
            }
            catch (err) {
                ui.showError(err);
                return false;
            }
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
            const durationMS = Date.now() - startTime;
            ui.announceConfigurationFileLoaded(cfg.filepath, durationMS);
        }
        catch (err) {
            // console.log( '>>', options.config, 'ERROR', err.message );
            ui.announceCouldNotLoadConfigurationFile(err.message);
            // continue
        }
        // CLI options override file options
        const userOptions = Object.assign(fileOptions || {}, cliOptions || {});
        options.import(userOptions);
        // Init option ?
        if (options.init) {
            if (fileOptions) {
                ui.announceConfigurationFileAlreadyExists();
            }
            else {
                const guidedOptions = yield (new GuidedConfig_1.GuidedConfig()).prompt();
                options.import(guidedOptions);
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
            const obj = options.export(true);
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
        const app = new app_1.App(fs, path);
        return yield app.start(options, ui);
    });
}
exports.main = main;
