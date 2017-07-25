import { Location } from './Location';

export interface ASTNode {
    keyword: string;
    location: Location;
}

export interface NamedASTNode extends ASTNode {
    name: string;
}

export interface ContentASTNode extends ASTNode {
    content: string;
}