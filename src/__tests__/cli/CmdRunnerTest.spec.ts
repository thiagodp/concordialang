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
        return expect( cmd.run( 'date' ) ).resolves.toHaveProperty( 'stdout' );
    } );

    it( 'show command errors',() => {
        return expect( cmd.run( 'cd somefile.txt' ) ).rejects.toHaveProperty( 'message' );
    } );

    it( 'show error when commands does not exist',() => {
        return expect( cmd.run( 'this_is_a_inexistente_command' ) ).rejects.toHaveProperty( 'message' );
    } );

} );
