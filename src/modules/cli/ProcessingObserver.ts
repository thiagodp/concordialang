import { FileInfo } from '../ast/FileInfo';

/**
 * Processing observer.
 * 
 * @author Thiago Delgado Pinto
 */
export interface ProcessingObserver {

    onFileStarted( fileInfo: FileInfo ): void;

    onFileError( fileInfo: FileInfo, errors: Error[] ): void;

    onFileFinished( fileInfo: FileInfo, succeeded: boolean ): void;

    onError( errors: Error[] ): void;

}