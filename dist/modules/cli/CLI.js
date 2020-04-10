"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const figures = require("figures");
const logSymbols = require("log-symbols");
const logUpdate = require("log-update");
class CLI {
    constructor() {
        this.colors = chalk_1.default;
        this.figures = figures;
        this.symbolPointer = figures.pointerSmall;
        this.symbolItem = figures.line;
        this.symbolSuccess = logSymbols.success;
        this.symbolError = logSymbols.error;
        this.symbolWarning = logSymbols.warning;
        this.symbolInfo = logSymbols.info;
        this.colorSuccess = this.colors.greenBright; // this.colors.rgb(0, 255, 0);
        this.colorError = this.colors.redBright; // this.colors.rgb(255, 0, 0);
        this.colorWarning = this.colors.yellow;
        this.colorInfo = this.colors.gray;
        this.colorHighlight = this.colors.yellowBright; // this.colors.rgb(255, 242, 0);
        this.colorText = this.colors.white;
        this.bgSuccess = this.colors.bgGreenBright;
        this.bgError = this.colors.bgRedBright;
        this.bgWarning = this.colors.bgYellow;
        this.bgInfo = this.colors.bgBlackBright; // bgGray does not exist in chalk
        this.bgHighlight = this.colors.bgYellowBright;
        this.bgText = this.colors.bgWhiteBright;
    }
    log(...args) {
        console.log(...args);
    }
    newLine(...args) {
        console.log(...args);
    }
    sameLine(...args) {
        logUpdate(...args);
    }
    properColor(hasErrors, hasWarnings) {
        if (hasErrors) {
            return this.colorError;
        }
        if (hasWarnings) {
            return this.colorWarning;
        }
        return this.colorSuccess;
    }
    properBg(hasErrors, hasWarnings) {
        if (hasErrors) {
            return this.bgError;
        }
        if (hasWarnings) {
            return this.bgWarning;
        }
        return this.bgSuccess;
    }
    properSymbol(hasErrors, hasWarnings) {
        if (hasErrors) {
            return this.symbolError;
        }
        if (hasWarnings) {
            return this.symbolWarning;
        }
        return this.symbolSuccess;
    }
}
exports.CLI = CLI;
