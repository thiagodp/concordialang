// import { makePackageInstallCommand, makePackageUninstallCommand } from "../util/package-installation";
// import { runCommand } from "../util/run-command";
/**
 * Return the intersection between date and number locales.
 *
 * @param baseDirectory Directory to search. Usually `node_modules`.
 * @param dirSearcher Directory searcher to use.
 * @param path NodeJS `path` library instance.
 */
async function allInstalledLocales(baseDirectory, dirSearcher, path) {
    const dateLocales = await installedDateLocales(baseDirectory, dirSearcher, path);
    const numberLocales = await installedNumberLocales(baseDirectory, dirSearcher);
    const intersection = dateLocales.filter(l => numberLocales.includes(l));
    return intersection;
}
/**
 * Return installed date locales.
 *
 * @param baseDirectory Directory to search. Usually `node_modules`.
 * @param dirSearcher Directory searcher to use.
 * @param path NodeJS `path` library instance.
 */
export async function installedDateLocales(baseDirectory, dirSearcher, path) {
    const options = {
        directory: path.join(baseDirectory, 'date-fns', 'locale'),
        recursive: false,
        regexp: /^[A-Za-z-]+$/
    };
    const directories = await dirSearcher.search(options);
    if (directories.length < 1) {
        return [];
    }
    const extractName = dir => /([A-Za-z-]+)$/.exec(dir)[1];
    return directories.map(extractName);
}
/**
 * Return installed number locales.
 *
 * TODO: implement it (load values from the real library).
 *
 * @param baseDirectory Directory to search. Usually `node_modules`.
 * @param dirSearcher Directory searcher to use.
 */
async function installedNumberLocales(baseDirectory, dirSearcher) {
    return ['en', 'en-US', 'pt', 'pt-BR']; // FIXME: fake values
}
// TODO: To implement when number locales are available
/*
export async function installLocales( localesOrPackageNames: string[] ): Promise< number > {
    const packages = localesOrPackageNames.map( localePackageNameFor );
    const cmd = makePackageInstallCommand( packages.join( ' ' ) );
    return await runCommand( cmd );
}

export async function uninstallLocales( localesOrPackageNames: string[]  ): Promise< number > {
    const packages = localesOrPackageNames.map( localePackageNameFor );
    const cmd = makePackageUninstallCommand( packages.join( ' ' ) );
    return await runCommand( cmd );
}

export function localePackageNameFor( localesOrPackageName: string ): string {
    const prefix = 'database-js-';
    return localesOrPackageName.startsWith( prefix )
        ? localesOrPackageName
        : prefix + localesOrPackageName;
}
*/
