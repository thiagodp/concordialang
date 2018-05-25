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
const PluginDrawer_1 = require("./PluginDrawer");
const PluginManager_1 = require("./PluginManager");
/**
 * Plugin controller
 *
 * @author Thiago Delgado Pinto
 */
class PluginController {
    constructor(cli) {
        this.process = (options) => __awaiter(this, void 0, void 0, function* () {
            const pm = new PluginManager_1.PluginManager(options.pluginDir);
            if (options.pluginList) {
                try {
                    this._drawer.drawPluginList(yield pm.findAll());
                    return true;
                }
                catch (e) {
                    this._drawer.showError(e);
                    return false;
                }
            }
            // empty plugin name?
            if (!options.plugin || options.plugin.trim().length < 1) {
                this._drawer.showError(new Error('Empty plugin name.'));
                return false;
            }
            const pluginData = yield pm.pluginWithName(options.plugin);
            // plugin name not available?
            if (!pluginData) {
                this._drawer.showMessageOnNoPluginFound(options.plugin);
                return false;
            }
            if (options.pluginAbout) {
                this._drawer.drawSinglePlugin(pluginData);
                return true;
            }
            if (options.pluginInstall) {
                try {
                    yield pm.install(pluginData, this._drawer);
                }
                catch (e) {
                    this._drawer.showError(e);
                }
                return true;
            }
            if (options.pluginUninstall) {
                try {
                    yield pm.uninstall(pluginData, this._drawer);
                }
                catch (e) {
                    this._drawer.showError(e);
                }
                return true;
            }
            if (options.pluginServe) {
                try {
                    yield pm.serve(pluginData, this._drawer);
                }
                catch (e) {
                    this._drawer.showError(e);
                }
                return true;
            }
            return true;
        });
        this._drawer = new PluginDrawer_1.PluginDrawer(cli);
    }
}
exports.PluginController = PluginController;
