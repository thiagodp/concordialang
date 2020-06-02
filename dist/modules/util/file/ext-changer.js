"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeFileExtension = void 0;
function changeFileExtension(file, extension, pathLibrary) {
    const { parse, join } = pathLibrary || require('path');
    const r = parse(file);
    return join(r.dir, r.name + extension);
}
exports.changeFileExtension = changeFileExtension;
