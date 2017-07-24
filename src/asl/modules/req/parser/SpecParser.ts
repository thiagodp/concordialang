import { Document } from "../ast/Document";
import { Spec } from "../ast/Spec";

export class SpecParser {

    parse( files: Array< string > ): Spec {
        return {
            documents: []
        };
    }
    
}