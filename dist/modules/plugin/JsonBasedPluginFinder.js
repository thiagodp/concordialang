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
const path_1 = require("path");
const util_1 = require("util");
const fs = require("fs");
const fwalker = require("fwalker");
const JsonSchemaValidator_1 = require("../schema/JsonSchemaValidator");
/**
 * JSON-based test script plug-in finder.
 *
 * @author Thiago Delgado Pinto
 */
class JsonBasedPluginFinder {
    constructor(_pluginDir, _fs = fs) {
        this._pluginDir = _pluginDir;
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
                fwalker(dir, options)
                    .on('file', (relPath, stats, absPath) => files.push(absPath))
                    .on('error', (err) => reject(err))
                    .on('done', () => resolve(files))
                    .walk();
            });
        };
    }
    /** @inheritdoc */
    find() {
        return __awaiter(this, void 0, void 0, function* () {
            let files = yield this.readConfigFiles(this._pluginDir);
            let plugins = [];
            for (let file of files) {
                let plugin = yield this.loadConfigFile(file);
                plugins.push(plugin);
            }
            return plugins;
        });
    }
    ;
    /** @inheritdoc */
    classFileFor(pluginData) {
        return __awaiter(this, void 0, void 0, function* () {
            return path_1.resolve(this._pluginDir, pluginData.file);
        });
    }
    loadConfigFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const read = util_1.promisify(this._fs.readFile);
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
