
export interface FileCompilationListener {

    fileStarted( path: string ): void;

    fileFinished( path: string, durationMS: number ): void;

}