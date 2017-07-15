import { Feature } from './Feature';
import { Task } from './Task';
import { UI } from "./UI";

export interface Document {

    language?: string;
    tags?: Array< string >;

    feature?: Feature;

    uis?: Array< UI >;

    tasks?: Array< Task >;

}