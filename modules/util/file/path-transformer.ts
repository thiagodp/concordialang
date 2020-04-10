
export function toUnixPath( path: string ): string {
    return path ? path.replace( /\\/g, '/' ) : '';
}

export function toWindowsPath( path: string ): string {
    return path ? path.replace( /\//g, '\\\\' ) : '';
}