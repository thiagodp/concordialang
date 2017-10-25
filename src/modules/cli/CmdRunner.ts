const cmd = require( 'node-cmd' );

/**
 * Runs commands on a console terminal.
 * @author Matheus Eller Fagundes
 */
export class CmdRunner {
    
    public run( command: string ): Promise< any > {
        return new Promise( ( resolve, reject ) => {
            cmd.get( command, ( err, data ) => {
                if( err != null )
                    return reject( err );
                resolve( data );
            } );            
        } );
    }

}
