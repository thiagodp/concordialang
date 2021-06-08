"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinDatabasePackageNames = exports.makeDatabasePackageNameFor = exports.makeLockFileName = exports.makePackageInitCommand = exports.makePackageUninstallCommand = exports.makePackageInstallCommand = exports.packageManagers = void 0;
function packageManagers() {
    return ['npm', 'yarn', 'pnpm'];
}
exports.packageManagers = packageManagers;
function makePackageInstallCommand(pkgName, tool = 'npm') {
    switch (tool) {
        case 'yarn': return 'yarn add -D --silent ' + pkgName;
        case 'pnpm': return 'pnpm add -D ' + pkgName;
        default: return 'npm i -D ' + pkgName + ' --no-fund --no-audit --loglevel error --color=always';
    }
}
exports.makePackageInstallCommand = makePackageInstallCommand;
function makePackageUninstallCommand(pkgName, tool = 'npm') {
    switch (tool) {
        case 'yarn': return 'yarn remove --silent ' + pkgName;
        case 'pnpm': return 'pnpm remove ' + pkgName;
        default: return 'npm uninstall ' + pkgName + ' --no-fund --no-audit --loglevel error --color=always';
    }
}
exports.makePackageUninstallCommand = makePackageUninstallCommand;
function makePackageInitCommand(tool = 'npm') {
    switch (tool) {
        case 'yarn': return 'yarn init --yes';
        case 'pnpm': return 'npm init --yes'; // it uses npm
        default: return 'npm init --yes';
    }
}
exports.makePackageInitCommand = makePackageInitCommand;
function makeLockFileName(tool = 'npm') {
    switch (tool) {
        case 'yarn': return 'yarn.lock';
        case 'pnpm': return 'pnpm-lock.yaml';
        default: return 'package-lock.json';
    }
}
exports.makeLockFileName = makeLockFileName;
function makeDatabasePackageNameFor(databaseOrPackageName) {
    const prefix = 'database-js-';
    return databaseOrPackageName.startsWith(prefix)
        ? databaseOrPackageName
        : prefix + databaseOrPackageName;
}
exports.makeDatabasePackageNameFor = makeDatabasePackageNameFor;
function joinDatabasePackageNames(databasesOrPackageNames) {
    return databasesOrPackageNames.map(makeDatabasePackageNameFor).join(' ');
}
exports.joinDatabasePackageNames = joinDatabasePackageNames;
