import * as logUpdate from 'log-update';
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';
import * as figures from 'figures';

export class CLI {

    colors = chalk as any;

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

    readonly colorSuccess = this.colors.rgb(0, 255, 0);
    readonly colorError = this.colors.rgb(255, 0, 0);
    readonly colorWarning = this.colors.yellow;    
    readonly colorInfo = this.colors.gray;
    readonly colorHighlight = this.colors.rgb(255, 242, 0);
    readonly colorText = this.colors.white;

}