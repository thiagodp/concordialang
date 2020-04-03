export interface PatternBuilder {

    files( files: string[] ): string;

    filesToIgnore( files: string[] ): string;

    extensionsWithinDirectory( extensions: string[], directory: string, onlyCurrentDir: boolean ): string;

    extensions( extensions: string[] ): string;

    prettyExtensions( extensions: string[] ): string[];
}
