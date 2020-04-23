export function changeFileExtension(
    file: string,
    extension: string,
    pathLibrary?: any
) {
    const { parse, join } = pathLibrary || require( 'path' );
    const r = parse( file );
    return join( r.dir, r.name + extension );
}