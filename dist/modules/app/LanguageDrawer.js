"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageDrawer = void 0;
class LanguageDrawer {
    constructor(_cli) {
        this._cli = _cli;
        this.drawLanguages = (languages) => {
            const highlight = this._cli.colorHighlight;
            this._cli.newLine(this._cli.symbolInfo, 'Available languages:', languages.sort().map(l => highlight(l)).join(', '));
        };
    }
}
exports.LanguageDrawer = LanguageDrawer;
