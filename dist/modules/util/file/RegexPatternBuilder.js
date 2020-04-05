"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Use them with new RegExp( exp, 'ui' ) */
class RegexPatternBuilder {
    files(files) {
        const exp = '(' + files.map(f => f.replace('/', '\\\\')).join('|') + ')';
        return exp;
    }
    filesToIgnore(files) {
        const exp = '(' + files.map(f => f.replace('\\', '/')).join('|') + ')';
        return exp;
    }
    extensionsWithinDirectory(extensions, directory, onlyCurrentDir = false) {
        throw new Error('not implemented yet');
    }
    extensions(extensions) {
        const exp = '(' + extensions.map(e => e.indexOf('.') >= 0 ? '\\' + e : '\\.' + e).join('|') + ')$';
        return exp;
    }
    prettyExtensions(extensions) {
        return extensions.map(e => e.indexOf('.') >= 0 ? e : '.' + e);
    }
}
exports.RegexPatternBuilder = RegexPatternBuilder;
