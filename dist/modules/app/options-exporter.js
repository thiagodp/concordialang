"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPersistableCopy = void 0;
const path_1 = require("path");
/**
 * Returns an object that can be saved.
 */
function createPersistableCopy(source, defaultObject, useRelativePaths = false) {
    const unwantedProperties = [
        // INTERNAL
        'debug',
        'languageDir',
        'appPath',
        'processPath',
        'isGeneratedSeed',
        'realSeed',
        // LANGUAGE
        'languageList',
        // PLUGIN
        'pluginList',
        'pluginAbout',
        'pluginInstall',
        'pluginUninstall',
        'pluginServe',
        // DATABASE
        `dbList`,
        'dbInstall',
        'dbUninstall',
        'databases',
        // LOCALE
        'localeList',
        // PROCESSING
        'init',
        'saveConfig',
        'ast',
        // INFO
        'help',
        'about',
        'version',
        'newer',
    ];
    const obj = Object.assign({}, source);
    if (obj.isGeneratedSeed) {
        unwantedProperties.push('seed');
    }
    if (useRelativePaths) {
        obj.directory = path_1.relative(obj.processPath, obj.directory);
        obj.dirResult = path_1.relative(obj.processPath, obj.dirResult);
        obj.dirScript = path_1.relative(obj.processPath, obj.dirScript);
    }
    // Remove properties with the same values as the default configuration
    for (const [k, d] of Object.entries(defaultObject)) {
        const o = obj[k];
        // console.log( `'${k}' = '${o}'`);
        // Same value or empty
        if (o === d || '' === o || '' === d) {
            delete obj[k];
            // Both arrays and same values
        }
        else if (Array.isArray(o) && Array.isArray(d) &&
            JSON.stringify(o) === JSON.stringify(d)) {
            delete obj[k];
        }
    }
    // Remove unwanted properties
    for (const p of unwantedProperties) {
        delete obj[p];
    }
    return obj;
}
exports.createPersistableCopy = createPersistableCopy;
