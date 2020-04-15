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
/**
 * Plugin controller
 *
 * @author Thiago Delgado Pinto
 */
class PluginController {
    constructor() {
        this.process = (options, pluginManager, drawer) => __awaiter(this, void 0, void 0, function* () {
            if (options.pluginList) {
                try {
                    drawer.drawPluginList(yield pluginManager.findAll());
                    return true;
                }
                catch (e) {
                    drawer.showError(e);
                    return false;
                }
            }
            // empty plugin name?
            if (!options.plugin || options.plugin.trim().length < 1) {
                drawer.showError(new Error('Empty plugin name.'));
                return false;
            }
            if (options.pluginInstall) {
                try {
                    yield pluginManager.installByName(options.plugin);
                }
                catch (e) {
                    drawer.showError(e);
                }
                return true;
            }
            if (options.pluginUninstall) {
                try {
                    yield pluginManager.uninstallByName(options.plugin);
                }
                catch (e) {
                    drawer.showError(e);
                }
                return true;
            }
            const pluginData = yield pluginManager.pluginWithName(options.plugin);
            // plugin name not available?
            if (!pluginData) {
                drawer.showMessagePluginNotFound(options.plugin);
                return false;
            }
            if (options.pluginAbout) {
                drawer.drawSinglePlugin(pluginData);
                return true;
            }
            if (options.pluginServe) {
                try {
                    yield pluginManager.serve(pluginData);
                }
                catch (e) {
                    drawer.showError(e);
                }
                return true;
            }
            return true;
        });
    }
}
exports.PluginController = PluginController;
