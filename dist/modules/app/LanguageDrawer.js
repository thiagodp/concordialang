"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=LanguageDrawer.js.map