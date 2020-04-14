import { CLI } from '../../cli/CLI';
import { Warning } from '../../error/Warning';
import { AppUI } from './AppUI';
import { SimpleAppUI } from './SimpleAppUI';

export class VerboseAppUI extends SimpleAppUI implements AppUI {

    constructor(
        cli: CLI,
        debug: boolean = false
    ) {
        super( cli, debug );
    }

    //
    // FileCompilationListener
    //

    /** @inheritDoc */
    fileStarted( path: string ): void {
        this._cli.newLine( this._cli.symbolInfo, 'Compiling',
            this._cli.colorHighlight( path ), '...' );
    }

    //
    // CompilerListener
    //

    //
    // TCGenListener
    //

    /** @inheritDoc */
    testCaseGenerationStarted( warnings: Warning[] ) {
        this._cli.newLine(
            this._cli.symbolInfo,
            'Test case generation started'
        );
        this.showErrors( warnings, true );
    }

    /** @inheritDoc */
    testCaseGenerationFinished( durationMs: number ) {
        this._cli.newLine(
            this._cli.symbolInfo,
            'Test case generation finished',
            this.formatDuration( durationMs )
        );
    }

}