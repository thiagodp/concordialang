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
// import { makePackageInstallCommand, makePackageUninstallCommand } from "../util/package-installation";
// import { runCommand } from "../util/run-command";
/**
 * Return the intersection between date and number locales.
 *
 * @param baseDirectory Directory to search. Usually `node_modules`.
 * @param dirSearcher Directory searcher to use.
 * @param path NodeJS `path` library instance.
 */
function allInstalledLocales(baseDirectory, dirSearcher, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const dateLocales = yield installedDateLocales(baseDirectory, dirSearcher, path);
        const numberLocales = yield installedNumberLocales(baseDirectory, dirSearcher);
        const intersection = dateLocales.filter(l => numberLocales.includes(l));
        return intersection;
    });
}
/**
 * Return installed date locales.
 *
 * @param baseDirectory Directory to search. Usually `node_modules`.
 * @param dirSearcher Directory searcher to use.
 * @param path NodeJS `path` library instance.
 */
function installedDateLocales(baseDirectory, dirSearcher, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            directory: path.join(baseDirectory, 'date-fns', 'locale'),
            recursive: false,
            regexp: /^[A-Za-z-]+$/
        };
        const directories = yield dirSearcher.search(options);
        if (directories.length < 1) {
            return [];
        }
        const extractName = dir => /([A-Za-z-]+)$/.exec(dir)[1];
        return directories.map(extractName);
    });
}
exports.installedDateLocales = installedDateLocales;
/**
 * Return installed number locales.
 *
 * TODO: implement it (load values from the real library).
 *
 * @param baseDirectory Directory to search. Usually `node_modules`.
 * @param dirSearcher Directory searcher to use.
 */
function installedNumberLocales(baseDirectory, dirSearcher) {
    return __awaiter(this, void 0, void 0, function* () {
        return ['en', 'en-US', 'pt', 'pt-BR']; // FIXME: fake values
    });
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
