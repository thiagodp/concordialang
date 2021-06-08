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
exports.uninstallDatabases = exports.installDatabases = exports.allInstalledDatabases = void 0;
const package_installation_1 = require("../util/package-installation");
const run_command_1 = require("../util/run-command");
function allInstalledDatabases(baseDirectory, dirSearcher) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            directory: baseDirectory,
            recursive: false,
            regexp: /database\-js\-(.+)$/
        };
        const directories = yield dirSearcher.search(options);
        if (directories.length < 1) {
            return [];
        }
        const extractName = dir => options.regexp.exec(dir)[1];
        return directories.map(extractName);
    });
}
exports.allInstalledDatabases = allInstalledDatabases;
function installDatabases(databasesOrPackageNames, tool) {
    return __awaiter(this, void 0, void 0, function* () {
        const packages = databasesOrPackageNames.map(package_installation_1.makeDatabasePackageNameFor);
        const cmd = package_installation_1.makePackageInstallCommand(packages.join(' '), tool);
        return yield run_command_1.runCommand(cmd);
    });
}
exports.installDatabases = installDatabases;
function uninstallDatabases(databasesOrPackageNames, tool) {
    return __awaiter(this, void 0, void 0, function* () {
        const packages = databasesOrPackageNames.map(package_installation_1.makeDatabasePackageNameFor);
        const cmd = package_installation_1.makePackageUninstallCommand(packages.join(' '), tool);
        return yield run_command_1.runCommand(cmd);
    });
}
exports.uninstallDatabases = uninstallDatabases;
