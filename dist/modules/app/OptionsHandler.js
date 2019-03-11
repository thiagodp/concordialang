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
const Options_1 = require("./Options");
const TypeChecking_1 = require("../util/TypeChecking");
const path_1 = require("path");
const fs = require("fs");
const cosmiconfig = require("cosmiconfig");
const util_1 = require("util");
const crypto = require("crypto");
const js_joda_1 = require("js-joda");
class OptionsHandler {
    constructor(appPath, processPath, _cli, _meow, _fs = fs) {
        this.appPath = appPath;
        this.processPath = processPath;
        this._cli = _cli;
        this._meow = _meow;
        this._fs = _fs;
        this._wasLoaded = false;
        this._options = null;
        this._cfgFilePath = null;
        this._options = new Options_1.Options(appPath, processPath);
    }
    /** Returns the current options. */
    get() {
        return this._options;
    }
    /** Sets the current options */
    set(options) {
        this._options = options;
    }
    /** Returns true whether the options were already loaded. */
    wasLoaded() {
        return this._wasLoaded;
    }
    /**
     * Load the configuration from the CLI and the configuration file (if
     * it exists). Returns a promise to the loaded options.
     */
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let optionsInfo = yield this.loadOptionsInfo();
            let options = new Options_1.Options(this.appPath, this.processPath);
            options.import(optionsInfo.config);
            // Update seed
            this.updateSeed(options, this._cli);
            // Save loaded parameters
            this._cfgFilePath = optionsInfo.filepath; // may be null
            this._options = options;
            return options;
        });
    }
    /**
     * Save the configuration. Returns a promise to the saved object.
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = this._options.export();
            if (!this._cfgFilePath) {
                this._cfgFilePath = path_1.join(this.processPath, this._options.defaults.CFG_FILE_NAME);
            }
            const write = util_1.promisify(this._fs.writeFile);
            yield write(this._cfgFilePath, JSON.stringify(obj, undefined, "\t"));
            this._cli.newLine(this._cli.symbolInfo, 'Saved', this._cli.colorHighlight(this._cfgFilePath));
            return obj;
        });
    }
    updateSeed(options, cli) {
        if (!options.seed) {
            options.isGeneratedSeed = true;
            options.seed =
                js_joda_1.LocalDateTime.now().format(js_joda_1.DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm:ss')).toString();
        }
        const shouldShow = !options.help
            && !options.about
            && !options.version
            && !options.newer
            && !options.init
            && !options.ast
            && !options.somePluginOption();
        if (shouldShow) {
            cli.newLine(cli.symbolInfo, options.isGeneratedSeed ? 'Generated seed' : 'Seed', cli.colorHighlight(options.seed));
        }
        // Real seed
        const BYTES_OF_SHA_512 = 64; // 512 divided by 8
        if (options.seed.length < BYTES_OF_SHA_512) {
            options.realSeed = crypto
                .createHash('sha512')
                .update(options.seed)
                .digest('hex');
        }
        else {
            options.realSeed = options.seed;
        }
        if (options.debug || options.verbose) {
            cli.newLine(cli.symbolInfo, 'Real seed', cli.colorHighlight(options.realSeed));
        }
    }
    loadOptionsInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            // CLI options are read firstly in order to eventually consider
            // some parameter before loading a configuration file, i.e., pass
            // some argument to `optionsFromConfigFile`.
            const cliOptions = this.optionsFromCLI();
            const cfg = yield this.optionsFromConfigFile();
            if (!!cfg) {
                this._wasLoaded = true;
            }
            const cfgFileOptions = !cfg ? {} : cfg.config;
            const finalObj = Object.assign(cfgFileOptions, cliOptions);
            return { config: finalObj, filepath: !cfg ? null : cfg.filepath };
        });
    }
    optionsFromCLI() {
        return this.adaptMeowObject(this._meow);
    }
    adaptMeowObject(meowObj) {
        let obj = Object.assign({}, meowObj.flags);
        const input = meowObj.input;
        if (!obj.directory && (TypeChecking_1.isDefined(input) && 1 === input.length)) {
            obj.directory = input[0];
        }
        return obj;
    }
    optionsFromConfigFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const MODULE_NAME = 'concordia';
            // @see https://github.com/davidtheclark/cosmiconfig
            // const loadOptions = {
            //     stopDir: process.cwd()
            // };
            const explorer = cosmiconfig(MODULE_NAME);
            let fileConfig = null;
            try {
                fileConfig = yield explorer.load();
            }
            catch (err) {
                this._cli.newLine(this._cli.symbolWarning, 'Could not load the configuration file.', err.message);
            }
            if (TypeChecking_1.isDefined(fileConfig)) {
                const cfgFilePath = path_1.relative(process.cwd(), fileConfig.filepath);
                this._cli.newLine(this._cli.symbolInfo, 'Configuration file loaded:', this._cli.colorHighlight(cfgFilePath));
            }
            return fileConfig;
        });
    }
}
exports.OptionsHandler = OptionsHandler;
