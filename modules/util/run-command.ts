import * as childProcess from 'child_process';

/**
 * Run a command in the terminal/console. Returns the exit code.
 *
 * @param command Command to run.
 * @return Exit code.
 */
export async function runCommand( command: string ): Promise< number > {

    const options = {
        // detached: true, // main process can terminate
        // stdio: 'ignore', // ignore stdio since detach is active
        shell: true, // allow parameters in the command
        // stdio: 'inherit', // <<< not working on windows
    };

    const matchArray = command.match( /[^"\s]+|"(?:\\"|[^"])+"/g );
    if ( ! matchArray ) {
        throw new Error( 'Invalid command syntax: ' + command );
    }

    // Splits the command into pieces to pass to the process;
    //  mapping function simply removes quotes from each piece
    let cmds = matchArray.map( expr => {
            return expr.charAt( 0 ) === '"'
                && expr.charAt( expr.length - 1 ) === '"' ? expr.slice( 1, -1 ) : expr;
        } );
    const runCMD = cmds[ 0 ];
    cmds.shift();

    return new Promise< any >( ( resolve, reject ) => {

		const child = childProcess.spawn( runCMD, cmds, options );

		child.stdout.setEncoding( 'utf8' );

        child.stdout.on( 'data', ( chunk ) => {
            console.log( chunk.toString() );
        } );

        child.stderr.on( 'data', ( chunk ) => {
            console.warn( chunk.toString() );
        } );

        child.on( 'exit', ( code ) => {
            resolve( code );
        } );

    } );

}

/**
 * Run the given commands in batch.
 *
 * Aborts when a command fails. Returns the result code.
 *
 * @param commands Commands to run.
 */
export async function runInBatch( commands: string[] ): Promise< number > {
    for ( const cmd of commands ) {
        const code = await runCommand( cmd );
        if ( code != 0 ) {
            return code;
        }
    }
    return 0;
}
