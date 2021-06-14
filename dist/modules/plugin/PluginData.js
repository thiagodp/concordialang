/**
 * Package file
 */
export const PACKAGE_FILE = 'package.json';
/**
 * Property that must be declared in a package file of a plugin.
 */
export const PLUGIN_PROPERTY = 'concordiaPlugin';
/**
 * Prefix for plug-ins.
 */
export const PLUGIN_PREFIX = 'concordialang-';
/**
 * Returns a string array from the property `author` or `authors` of `package.json`.
 * Input value can be string, Author, array of string or array of Author.
 *
 * @param author Author or authors
 * @returns
 */
export function authorsAsStringArray(author) {
    switch (typeof author) {
        case 'string': return [author];
        case 'object': {
            const authorObjectToString = (obj) => {
                if (!obj || typeof obj != 'object') {
                    return; // undefined
                }
                const emailOrSite = (obj.email || obj.url || obj.site) ? ` <${obj.email || obj.url || obj.site}>` : '';
                return obj.name + emailOrSite;
            };
            if (Array.isArray(author)) {
                if (author.length < 1) {
                    return [];
                }
                if (typeof author[0] === 'string') {
                    return author;
                }
                return author.map(authorObjectToString).filter(a => !!a);
            }
            return [authorObjectToString(author)];
        }
        default: return [];
    }
}
/**
 * Returns `true` if the given object is a Concordia Compiler plugin.
 *
 * @param pkg Package object
 * @returns
 */
export function isPlugin(pkg) {
    return !!pkg && pkg?.name?.startsWith(PLUGIN_PREFIX) && !!pkg[PLUGIN_PROPERTY];
}
/**
 * Extracts plug-in data from a package object.
 *
 * @param pkg Package object
 * @returns
 */
export function pluginDataFromPackage(pkg) {
    if (!pkg) {
        return;
    }
    const data = {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        authors: authorsAsStringArray(pkg.author || pkg.authors),
        main: pkg.main,
    };
    if (!isOldPluginForVersion2(pkg)) {
        return data;
    }
    const obj = concordiaPluginPropertyValue(pkg);
    return { ...data, ...obj };
}
/**
 * Returns `true` if the given object is an old plugin structure for version 2.
 * @param pkg Package object
 * @returns
 */
export function isOldPluginForVersion2(pkg) {
    if (!isPlugin(pkg)) {
        return false;
    }
    const prop = concordiaPluginPropertyValue(pkg);
    return typeof prop === 'object';
}
/**
 * Returns the value for the property `concordiaPlugin`.
 *
 * @param pkg Package object
 * @returns
 */
function concordiaPluginPropertyValue(pkg) {
    return (pkg && pkg[PLUGIN_PROPERTY]) ? pkg[PLUGIN_PROPERTY] : undefined;
}
