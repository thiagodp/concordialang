import { format } from 'date-fns';
import { parse, join } from 'path';
export function changeFileExtension(file, extension) {
    const { dir, name } = parse(file);
    return join(dir, name + extension);
}
export function addTimeStampToFilename(file, dateTime) {
    const { dir, name, ext } = parse(file);
    return join(dir, name + '-' + format(dateTime, 'yyyy-MM-dd_HH-mm-ss') + ext);
}
