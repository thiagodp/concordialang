import { AppUI } from '../app/AppUI';
import { Warning } from '../error/Warning';
import { CLI } from './CLI';
import { SimpleAppUI } from './SimpleAppUI';

export class VerboseAppUI extends SimpleAppUI implements AppUI {

    //
    // FileCompilationListener
    //

    /** @inheritDoc */
    fileStarted( path: string ): void {
        this._cli.newLine( this._cli.symbolInfo, 'Compiling',
            this._cli.colorHighlight( path ), '...' );
    }

    //
    // OptionsListener
    //

    /** @inheritDoc */
    announceRealSeed( realSeed: string ): void {
        this.info( 'Real seed', this._cli.colorHighlight( realSeed ) );
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