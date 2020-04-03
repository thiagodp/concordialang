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
const fg = require("fast-glob");
const GlobPatternBuilder_1 = require("./GlobPatternBuilder");
class GlobFileSearcher {
    constructor(_fs) {
        this._fs = _fs;
    }
    searchFrom(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const patternBuilder = new GlobPatternBuilder_1.GlobPatternBuilder();
            const hasFilesToConsider = options.files.length > 0;
            const hasFilesToIgnore = options.ignore.length > 0;
            const pattern = hasFilesToConsider
                ? patternBuilder.filesWithinDirectory(options.files, options.directory, !options.recursive)
                : patternBuilder.extensionsWithinDirectory(options.extensions, options.directory, !options.recursive);
            // console.log( 'Pattern: ', pattern );
            // const target: string[] = hasFilesToConsider
            //     ? options.files
            //     : pattern.prettyExtensions( options.extensions );
            // Fast glob options
            const fgOptions = { fs: this._fs };
            if (hasFilesToIgnore) {
                const pattern = patternBuilder.filesToIgnore(options.ignore);
                fgOptions.ignore = [pattern];
                // fgOptions.ignore = options.ignore;
            }
            if (!options.recursive) {
                fgOptions.deep = 1;
            }
            return yield fg(pattern, fgOptions);
        });
    }
}
exports.GlobFileSearcher = GlobFileSearcher;
