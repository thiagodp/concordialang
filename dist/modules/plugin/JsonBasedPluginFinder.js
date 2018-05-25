"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const JsonSchemaValidator_1 = require("../schema/JsonSchemaValidator");
const filewalker = require("filewalker");
const fs = require("fs");
const util = require("util");
/**
 * JSON-based test script plug-in finder.
 *
 * @author Thiago Delgado Pinto
 */
class JsonBasedPluginFinder {
    constructor(_dir, _fs = fs) {
        this._dir = _dir;
        this._fs = _fs;
        this.readConfigFiles = (dir) => {
            return new Promise((resolve, reject) => {
                const options = {
                    maxPending: -1,
                    maxAttempts: 0,
                    attemptTimeout: 1000,
                    matchRegExp: new RegExp('\\.json$')
                };
                let files = [];
                filewalker(dir, options)
                    .on('file', (relPath, stats, absPath) => files.push(absPath))
                    .on('error', (err) => reject(err))
                    .on('done', () => resolve(files))
                    .walk();
            });
        };
    }
    find() {
        return __awaiter(this, void 0, void 0, function* () {
            let files = yield this.readConfigFiles(this._dir);
            let plugins = [];
            for (let file of files) {
                let plugin = yield this.loadConfigFile(file);
                plugins.push(plugin);
            }
            return plugins;
        });
    }
    ;
    loadConfigFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const read = util.promisify(this._fs.readFile);
            const content = yield read(filePath);
            return this.processConfigFileData(content);
        });
    }
    processConfigFileData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = ''; // TO-DO
            if (schema.length > 0) {
                (new JsonSchemaValidator_1.JsonSchemaValidator()).validate(data, schema); // may throw
            }
            return JSON.parse(data); // may throw
        });
    }
}
exports.JsonBasedPluginFinder = JsonBasedPluginFinder;
