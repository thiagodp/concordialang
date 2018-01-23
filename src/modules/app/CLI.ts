import * as logUpdate from 'log-update';
import * as logSymbols from 'log-symbols';
import * as chalk from 'chalk';
import * as figures from 'figures';

export class CLI {

    colors = chalk;

    log = ( ...args ): void => {
        console.log( ...args );
    };
    
    newLine = ( ... args ) => {
        console.log( ... args );
    };

    sameLine = ( ...args ) => {
        logUpdate( ...args );
    };

    properColor = ( hasErrors: boolean, hasWarnings: boolean ): any => {
        if ( hasErrors ) {
            return this.colorError;
        }
        if ( hasWarnings ) {
            this.colorWarning;
        }
        return this.colorSuccess;
    };

    properSymbol = ( hasErrors: boolean, hasWarnings: boolean ): any => {
        if ( hasErrors ) {
            return this.symbolError;
        }
        if ( hasWarnings ) {
            this.symbolWarning;
        }
        return this.symbolSuccess;
    };

    readonly symbolPointer = figures.pointerSmall;
    readonly symbolItem = figures.line;
    readonly symbolSuccess = logSymbols.success;
    readonly symbolError = logSymbols.error;
    readonly symbolWarning = logSymbols.warning;
    readonly symbolInfo = logSymbols.info;

    readonly colorSuccess = chalk.rgb(0, 255, 0);
    readonly colorError = chalk.rgb(255, 0, 0);
    readonly colorWarning = chalk.yellow;    
    readonly colorInfo = chalk.gray;
    readonly colorHighlight = chalk.rgb(255, 242, 0);
    readonly colorText = chalk.white;

}