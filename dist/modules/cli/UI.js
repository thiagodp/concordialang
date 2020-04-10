"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UI {
    constructor(_cli, _meow) {
        this._cli = _cli;
        this._meow = _meow;
    }
    showHelp() {
        this._cli.newLine(this._meow.help);
    }
    showAbout() {
        const m = this._meow;
        const desc = m.pkg.description || 'Concordia';
        const version = m.pkg.version || '1.0.0';
        const name = m.pkg.author.name || 'Thiago Delgado Pinto';
        const site = m.pkg.homepage || 'https://concordialang.org';
        this._cli.newLine(desc + ' v' + version);
        this._cli.newLine('Copyright (c) ' + name);
        this._cli.newLine(site);
    }
    showVersion() {
        this._meow.showVersion();
    }
}
exports.UI = UI;
