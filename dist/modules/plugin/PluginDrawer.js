"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sprintf_js_1 = require("sprintf-js");
class PluginDrawer {
    constructor(_cli) {
        this._cli = _cli;
    }
    drawPluginList(plugins) {
        if (plugins.length < 1) {
            this.write(this._cli.symbolInfo, 'No plugins found. Try to install a plugin with NPM.');
            return;
        }
        // const highlight = this._cli.colorHighlight;
        // const format = "%-20s %-8s %-22s"; // util.format does not support padding :(
        // this.write( highlight( sprintf( format, 'Name', 'Version', 'Description' ) ) );
        // for ( let p of plugins ) {
        //     this.write( sprintf( format, p.name, p.version, p.description ) );
        // }
        const highlight = this._cli.colorHighlight;
        const format = "%-15s";
        this.write(this._cli.symbolInfo, highlight('Available Plugins:'));
        for (let p of plugins) {
            this.write(' ');
            this.write(highlight(sprintf_js_1.sprintf(format, '  Name')), p.name);
            this.write(highlight(sprintf_js_1.sprintf(format, '  Version')), p.version);
            this.write(highlight(sprintf_js_1.sprintf(format, '  Description')), p.description);
        }
    }
    drawSinglePlugin(p) {
        const highlight = this._cli.colorHighlight;
        const format = "  - %-12s: %s"; // util.format does not support padding :(
        const authors = p.authors.map((a, idx) => 0 === idx ? a : sprintf_js_1.sprintf('%-17s %s', '', a));
        this.write('Plugin ' + highlight(p.name));
        this.write(sprintf_js_1.sprintf(format, 'version', p.version));
        this.write(sprintf_js_1.sprintf(format, 'description', p.description));
        this.write(sprintf_js_1.sprintf(format, 'targets', p.targets.join(', ')));
        this.write(sprintf_js_1.sprintf(format, 'authors', authors.join('\n')));
        this.write(sprintf_js_1.sprintf(format, 'fake', p.isFake ? 'yes' : 'no'));
        this.write(sprintf_js_1.sprintf(format, 'file', p.file));
        this.write(sprintf_js_1.sprintf(format, 'class', p.class));
    }
    showMessageOnNoPluginFound(name) {
        const highlight = this._cli.colorHighlight;
        this.write(this._cli.symbolError, 'No plugins found with the name "' + highlight(name) + '".'
            + '\nTry ' + highlight('--plugin-list') + ' to see the available plugins.');
    }
    showPluginInstallStart(name) {
        const highlight = this._cli.colorHighlight;
        this.write(this._cli.symbolInfo, 'Installing the plugin ' + highlight(name) + '...');
    }
    showPluginUninstallStart(name) {
        const highlight = this._cli.colorHighlight;
        this.write(this._cli.symbolInfo, 'Uninstalling the plugin ' + highlight(name) + '...');
    }
    showPluginServeStart(name) {
        const highlight = this._cli.colorHighlight;
        this.write(this._cli.symbolInfo, 'Serving ' + highlight(name) + '...');
    }
    showCommand(command) {
        this.write('  Running', this._cli.colorHighlight(command));
    }
    showCommandCode(code) {
        if (0 === code) {
            this.write(this._cli.symbolSuccess, 'Success');
        }
        else {
            this.write(this._cli.symbolError, 'Error during command execution.');
        }
    }
    showError(e) {
        this.write(this._cli.symbolError, e.message);
    }
    write(...args) {
        //this._write( ... args );
        this._cli.newLine(...args);
    }
}
exports.PluginDrawer = PluginDrawer;
