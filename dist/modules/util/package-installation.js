export function packageManagers() {
    return ['npm', 'yarn', 'pnpm'];
}
export function makePackageInstallCommand(pkgName, tool = 'npm') {
    switch (tool) {
        case 'yarn': return 'yarn add -D --silent ' + pkgName;
        case 'pnpm': return 'pnpm add -D ' + pkgName;
        default: return 'npm i -D ' + pkgName + ' --no-fund --no-audit --loglevel error --color=always';
    }
}
export function makePackageUninstallCommand(pkgName, tool = 'npm') {
    switch (tool) {
        case 'yarn': return 'yarn remove --silent ' + pkgName;
        case 'pnpm': return 'pnpm remove ' + pkgName;
        default: return 'npm uninstall ' + pkgName + ' --no-fund --no-audit --loglevel error --color=always';
    }
}
export function makePackageInitCommand(tool = 'npm') {
    switch (tool) {
        case 'yarn': return 'yarn init --yes';
        case 'pnpm': return 'npm init --yes'; // it uses npm
        default: return 'npm init --yes';
    }
}
export function makeLockFileName(tool = 'npm') {
    switch (tool) {
        case 'yarn': return 'yarn.lock';
        case 'pnpm': return 'pnpm-lock.yaml';
        default: return 'package-lock.json';
    }
}
export function makeDatabasePackageNameFor(databaseOrPackageName) {
    const prefix = 'database-js-';
    return databaseOrPackageName.startsWith(prefix)
        ? databaseOrPackageName
        : prefix + databaseOrPackageName;
}
export function joinDatabasePackageNames(databasesOrPackageNames) {
    return databasesOrPackageNames.map(makeDatabasePackageNameFor).join(' ');
}
