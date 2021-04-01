import { format } from 'date-fns';


export function changeFileExtension(
    file: string,
    extension: string,
    pathLibrary: any
) {
    const { parse, join } = pathLibrary || require( 'path' );
    const r = parse( file );
    return join( r.dir, r.name + extension );
}


export function addTimeStampToFilename(
    file: string,
    extension: string,
    dateTime: Date,
    pathLibrary: any
): string {
    const { parse, join } = pathLibrary || require( 'path' );
    const r = parse( file );
    const timestamp = '-' + format( dateTime, 'yyyy-MM-dd_HH-mm-ss' );
    return join( r.dir, r.name + timestamp + extension );
}
