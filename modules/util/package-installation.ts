
export function makePackageInstallCommand( pkgName: string ) {
    return 'npm install --save-dev ' + pkgName + ' --no-fund --no-audit --loglevel error --color=always';
}

export function makePackageUninstallCommand( pkgName: string ) {
    return 'npm uninstall --save-dev ' + pkgName + ' --no-fund --no-audit --color=always';
}
