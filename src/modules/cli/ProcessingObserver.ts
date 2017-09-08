import { FileInfo } from '../ast/FileInfo';

/**
 * Processing observer.
 * 
 * @author Thiago Delgado Pinto
 */
export interface ProcessingObserver {

    onStarted( fileInfo: FileInfo ): void;

    onError( fileInfo: FileInfo, errors: Error[] ): void;

    onFinished( fileInfo: FileInfo, succeeded: boolean ): void;

}