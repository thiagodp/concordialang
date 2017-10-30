import { exec } from 'child_process';
import * as util from 'util';

/**
 * Runs commands on a console terminal.
 * 
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
export class CmdRunner {
    
    public run( command: string ): Promise< any > {
        const execute = util.promisify( exec );
        return execute( command );
    }

}
