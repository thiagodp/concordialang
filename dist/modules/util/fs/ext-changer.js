"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTimeStampToFilename = exports.changeFileExtension = void 0;
const date_fns_1 = require("date-fns");
function changeFileExtension(file, extension, pathLibrary) {
    const { parse, join } = pathLibrary || require('path');
    const r = parse(file);
    return join(r.dir, r.name + extension);
}
exports.changeFileExtension = changeFileExtension;
function addTimeStampToFilename(file, extension, dateTime, pathLibrary) {
    const { parse, join } = pathLibrary || require('path');
    const r = parse(file);
    const timestamp = '-' + date_fns_1.format(dateTime, 'yyyy-MM-dd_HH-mm-ss');
    return join(r.dir, r.name + timestamp + extension);
}
exports.addTimeStampToFilename = addTimeStampToFilename;
