import { Visitor } from './Visitor';

/**
 * Visitor design pattern.
 */
export interface Visitable {

    accept( visitor: Visitor ): void;

}