import * as logUpdate from 'log-update';
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';
import * as figures from 'figures';

export class CLI {

    public colors = chalk;
    public figures = figures;

    log( ...args ): void {
        console.log( ...args );
    }

    newLine( ... args ) {
        console.log( ... args );
    }

    sameLine( ...args ) {
        logUpdate( ...args );
    }

    properColor( hasErrors: boolean, hasWarnings: boolean ): any {
        if ( hasErrors ) {
            return this.colorError;
        }
        if ( hasWarnings ) {
            return this.colorWarning;
        }
        return this.colorSuccess;
    }

    properBg( hasErrors: boolean, hasWarnings: boolean ): any {
        if ( hasErrors ) {
            return this.bgError;
        }
        if ( hasWarnings ) {
            return this.bgWarning;
        }
        return this.bgSuccess;
    }

    properSymbol( hasErrors: boolean, hasWarnings: boolean ): any {
        if ( hasErrors ) {
            return this.symbolError;
        }
        if ( hasWarnings ) {
            return this.symbolWarning;
        }
        return this.symbolSuccess;
    }

    readonly symbolPointer = figures.pointerSmall;
    readonly symbolItem = figures.line;
    readonly symbolSuccess = logSymbols.success;
    readonly symbolError = logSymbols.error;
    readonly symbolWarning = logSymbols.warning;
    readonly symbolInfo = logSymbols.info;

    readonly colorSuccess = this.colors.greenBright; // this.colors.rgb(0, 255, 0);
    readonly colorError = this.colors.redBright; // this.colors.rgb(255, 0, 0);
    readonly colorWarning = this.colors.yellow;
    readonly colorInfo = this.colors.gray;
    readonly colorHighlight = this.colors.yellowBright; // this.colors.rgb(255, 242, 0);
    readonly colorText = this.colors.white;

    readonly bgSuccess = this.colors.bgGreenBright;
    readonly bgError = this.colors.bgRedBright;
    readonly bgWarning = this.colors.bgYellow;
    readonly bgInfo = this.colors.bgBlackBright; // bgGray does not exist in chalk
    readonly bgHighlight = this.colors.bgYellowBright;
    readonly bgText = this.colors.bgWhiteBright;

}