import { Feature } from './Feature';
import { Task } from './Task';
import { UI } from "./UI";
import { Tag } from "./Tag";
import { Import } from "./Import";

export interface Document {

    language?: string;
    tags?: Array< Tag >;
    imports?: Array< Import >;

    features?: Array< Feature >;

    uis?: Array< UI >;

    tasks?: Array< Task >;

}