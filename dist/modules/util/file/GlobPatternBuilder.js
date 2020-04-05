"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const path_transformer_1 = require("./path-transformer");
class GlobPatternBuilder {
    directory(directory, onlyCurrentDir) {
        const pattern = onlyCurrentDir ? '**' : '**/*';
        return path_transformer_1.toUnixPath(path_1.join(directory, pattern));
    }
    filesWithinDirectory(files, directory, onlyCurrentDir) {
        const pattern = onlyCurrentDir ? path_1.join(directory, '/') : path_1.join(directory, '**/');
        const dirP = path_transformer_1.toUnixPath(pattern);
        const filesP = this.files(files);
        return `${dirP}${filesP}`;
    }
    /** @inheritdoc */
    files(files) {
        return 1 === files.length
            ? path_transformer_1.toUnixPath(files[0])
            : '{' + files.map(f => path_transformer_1.toUnixPath(f)).join(',') + '}';
    }
    /** @inheritdoc */
    filesToIgnore(files) {
        // return '(' + files.map( f => f.replace( '\\', '/' ) ).join( '|' ) + ')';
        return '**/' + this.files(files);
    }
    /** @inheritdoc */
    extensionsWithinDirectory(extensions, directory, onlyCurrentDir = false) {
        const dir = this.directory(directory, onlyCurrentDir);
        const ext = this.extensions(extensions);
        const exp = 1 == extensions.length ? `${dir}.${ext}` : `${dir}.{${ext}}`;
        return exp;
    }
    /** @inheritdoc */
    extensions(extensions) {
        const removeDot = ext => ext.startsWith('.') ? ext.substr(1) : ext;
        return 1 == extensions.length
            ? removeDot(extensions[0])
            : extensions.map(e => removeDot(e)).join(',');
    }
    /** @inheritdoc */
    prettyExtensions(extensions) {
        return extensions.map(e => e.indexOf('.') >= 0 ? e : '.' + e);
    }
}
exports.GlobPatternBuilder = GlobPatternBuilder;
