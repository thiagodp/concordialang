import path = require( 'path' );

/**
 * Utility class to write files.
 * 
 * @author Matheus Eller Fagundes
 */
export class OutputFileWriter {

    constructor( private _fs: any ) {}
    
    /**
     * Writes content to a file. Creates any directory on the path if needed.
     * 
     * @param content Content to be written.
     * @param outputDirectory Directory to save the file.
     * @param fileName File name.
     * @param fileExtension File extension.
     */
    public write( content: string, outputDirectory: string, fileName: string, fileExtension: string ): void {
        let filePath: string = path.join( outputDirectory, fileName + '.' + fileExtension );
        this.ensureDirectoryExistence( filePath );
        this._fs.writeFileSync( filePath, content );
    }

    /**
     * Ensures a directory existence, creating any parent directory if needed.
     * 
     * @param filePath Path of the directory or file.
     */
    private ensureDirectoryExistence( filePath ): void {
        let dirname = path.dirname( filePath );
        if ( this._fs.existsSync( dirname ) ) {
            return;
        }
        this.ensureDirectoryExistence( dirname );
        this._fs.mkdirSync( dirname );
      }

}
