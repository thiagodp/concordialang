export interface ProcessingObserver {

    onStarted( filePath: string ): void;

    onError( filePath: string, errors: Error[] ): void;

    onFinished( filePath: string, succeeded: boolean ): void;

}