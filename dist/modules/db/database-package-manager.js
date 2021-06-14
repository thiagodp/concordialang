import { makeDatabasePackageNameFor, makePackageInstallCommand, makePackageUninstallCommand } from "../util/package-installation";
import { runCommand } from "../util/run-command";
export async function allInstalledDatabases(baseDirectory, dirSearcher) {
    const options = {
        directory: baseDirectory,
        recursive: false,
        regexp: /database\-js\-(.+)$/
    };
    const directories = await dirSearcher.search(options);
    if (directories.length < 1) {
        return [];
    }
    const extractName = dir => options.regexp.exec(dir)[1];
    return directories.map(extractName);
}
export async function installDatabases(databasesOrPackageNames, tool) {
    const packages = databasesOrPackageNames.map(makeDatabasePackageNameFor);
    const cmd = makePackageInstallCommand(packages.join(' '), tool);
    return await runCommand(cmd);
}
export async function uninstallDatabases(databasesOrPackageNames, tool) {
    const packages = databasesOrPackageNames.map(makeDatabasePackageNameFor);
    const cmd = makePackageUninstallCommand(packages.join(' '), tool);
    return await runCommand(cmd);
}
