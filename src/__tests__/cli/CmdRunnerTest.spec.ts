import { CmdRunner } from "../../modules/cli/CmdRunner";

/**
* @author Matheus Eller Fagundes
*/
describe( 'CmdRunnerTest', () => {

    let cmd: CmdRunner = new CmdRunner(); // under test
    
    it( 'can run commands getting no response', () => {
        cmd.run( 'echo "some text"' );
    } );

    it( 'can run commands getting response', () => {
        cmd.run( 'date', ( err: any, data: any ) => {
            expect(typeof data).toBe( 'string' );
        } );
    } );

} );
