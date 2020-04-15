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
const core_1 = require("@js-joda/core");
const cosmiconfig = require("cosmiconfig");
const crypto = require("crypto");
const fs = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const Options_1 = require("../app/Options");
const TypeChecking_1 = require("../util/TypeChecking");
class OptionsHandler {
    constructor(appPath, processPath, _optionsListener, _fs = fs) {
        this.appPath = appPath;
        this.processPath = processPath;
        this._optionsListener = _optionsListener;
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
    load(cliOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let optionsInfo = yield this.loadOptionsInfo(cliOptions);
            let options = new Options_1.Options(this.appPath, this.processPath);
            options.import(optionsInfo.config);
            // Update seed
            this.updateSeed(options);
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
            this._optionsListener.announceConfigurationFileSaved(this._cfgFilePath);
            return obj;
        });
    }
    updateSeed(options) {
        if (!options.seed) {
            options.isGeneratedSeed = true;
            options.seed =
                core_1.LocalDateTime.now().format(core_1.DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm:ss')).toString();
        }
        const shouldShow = !this.hasOptionAffectedByConfigurationFile(options)
            && !options.newer
            && !options.init
            && !options.ast
            && !options.somePluginOption();
        if (shouldShow) {
            this._optionsListener.announceSeed(options.seed, options.isGeneratedSeed);
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
        this._optionsListener.announceRealSeed(options.realSeed);
    }
    hasOptionAffectedByConfigurationFile(options) {
        return !options.help
            && !options.about
            && !options.version
            && !options.newer
            && !options.languageList
            && !options.pluginList;
    }
    loadOptionsInfo(cliOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            // CLI options are read firstly in order to eventually consider
            // some parameter before loading a configuration file, i.e., pass
            // some argument to `optionsFromConfigFile`.
            let cfg = null;
            if (this.hasOptionAffectedByConfigurationFile(cliOptions)) {
                cfg = yield this.optionsFromConfigFile();
                if (!!cfg) {
                    this._wasLoaded = true;
                }
            }
            const cfgFileOptions = !cfg ? {} : cfg.config;
            const finalObj = Object.assign(cfgFileOptions, cliOptions);
            return { config: finalObj, filepath: !cfg ? null : cfg.filepath };
        });
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
                this._optionsListener.announceCouldNotLoadConfigurationFile(err.message);
            }
            if (TypeChecking_1.isDefined(fileConfig)) {
                const cfgFilePath = path_1.relative(process.cwd(), fileConfig.filepath);
                this._optionsListener.announceConfigurationFileLoaded(cfgFilePath);
            }
            return fileConfig;
        });
    }
}
exports.OptionsHandler = OptionsHandler;
