
export function toUnixPath( path: string ): string {
    return path.replace( /\\/g, '/' );
}

export function toWindowsPath( path: string ): string {
    return path.replace( /\//g, '\\\\' );
}