import fs = require( 'fs' );
import path = require( 'path' );

/**
 * Utility class to write out files.
 */
export class OutputFileWriter {
    
    /**
     * Writes content to a file.
     * @param content Content to be written.
     * @param outputDirectory Directory to save the file.
     * @param fileName File name.
     * @param fileExtension File extension.
     */
    public write(content: string, outputDirectory: string, fileName: string, fileExtension: string): void {
        fs.writeFileSync( path.join( outputDirectory, fileName + '.' + fileExtension ), content );
    }

}
