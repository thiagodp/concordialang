const cmd = require( 'node-cmd' );

/**
 * Runs commands on terminal.
 * @author Matheus Eller Fagundes
 */
export class CmdRunner {
    
    public run( command: string, callback ?: ( err: any, data: any ) => void ): void {
        if( callback ) {
            cmd.get( command, callback );
        } else {
            cmd.run( command );
        }
    }

}
