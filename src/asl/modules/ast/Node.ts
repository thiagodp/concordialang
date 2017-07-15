export interface Location {
    line: number;
    column: number;
}

export interface Node {
    location: Location;
}