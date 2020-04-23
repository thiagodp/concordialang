"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function changeFileExtension(file, extension, pathLibrary) {
    const { parse, join } = pathLibrary || require('path');
    const r = parse(file);
    return join(r.dir, r.name + extension);
}
exports.changeFileExtension = changeFileExtension;
