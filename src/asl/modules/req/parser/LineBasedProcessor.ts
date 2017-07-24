export interface LineBasedProcessor {

    onRead( line: string, lineNumber: number ): void;

    onError( message: string ): void;

    onFinish(): void;

    errors(): Array< Error >;

    result(): Document;

}