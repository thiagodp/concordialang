export function toUnixPath(path) {
    return path ? path.replace(/\\\\?/g, '/') : '';
}
export function toWindowsPath(path) {
    return path ? path.replace(/\//g, '\\\\') : '';
}
