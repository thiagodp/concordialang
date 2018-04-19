import { Random } from '../testdata/random/Random';
import * as cartesian from 'cartesian';
import * as oneWise from 'one-wise';
import * as suffleObjArrays from 'shuffle-obj-arrays';
import { RandomLong } from '../testdata/random/RandomLong';

/**
 * Combination strategy
 *
 * @author Thiago Delgado Pinto
 */
export interface CombinationStrategy {

    /**
     * Performs the combination
     *
     * @param map Maps a string to an array of items, that is: { string => any[] }
     * @returns Array of maps. Each maps a state to a pair, that is: [ { string => any }, ... ]
     */
    combine( map: object ): object[];

}


/**
 * Performs a cartezian product of the elements.
 *
 * @author Thiago Delgado Pinto
 */
export class CartesianProductStrategy implements CombinationStrategy {

    /** @inheritDoc */
    combine( map: object ): object[] {
        return cartesian( map );
    }

}


/**
 * Performs a 1-wise combination of the elements.
 *
 * @author Thiago Delgado Pinto
 */
export class OneWiseStrategy implements CombinationStrategy {

    private readonly _random: Random;

    constructor( seed: string ) {
        this._random = new Random( seed );
    }

    /** @inheritDoc */
    combine( map: object ): object[] {
        const rng = () => this._random.generate();
        return oneWise( map, rng );
    }

}

/**
 * Performs a shuffled 1-wise combination of the elements.
 *
 * @author Thiago Delgado Pinto
 */
export class ShuffledOneWiseStrategy implements CombinationStrategy {

    private readonly _random: Random;

    constructor( seed: string ) {
        this._random = new Random( seed );
    }

    /** @inheritDoc */
    combine( map: object ): object[] {
        const rng = () => this._random.generate();
        const options = { copy: true, rng: rng };
        return oneWise( suffleObjArrays( map, options ), rng );
    }

}


/**
 * Selects a single, random element from each.
 *
 * @author Thiago Delgado Pinto
 */
export class SingleRandomOfEachStrategy implements CombinationStrategy {

    private readonly _randomLong: RandomLong;

    constructor( seed: string ) {
        this._randomLong = new RandomLong( new Random( seed ) )
    }

    /** @inheritDoc */
    combine( map: object ): object[] {
        let obj = {};
        for ( let key in map ) {
            let elements = map[ key ];
            if ( Array.isArray( elements ) ) {
                const size = elements.length;
                const index = size > 1 ? this._randomLong.between( 0, size - 1 ) : 0;
                obj[ key ] = elements[ index ];
            }
        }
        return [ obj ];
    }

}


/**
 * Selects the given index of each element.
 *
 * Whether the index does not exist for a certain element, it selects the last element.
 *
 * This is useful for test purposes.
 *
 * @author Thiago Delgado Pinto
 */
export class IndexOfEachStrategy implements CombinationStrategy {

    constructor( private _index: number ) {
    }

    /** @inheritDoc */
    combine( map: object ): object[] {
        let obj = {};
        for ( let key in map ) {
            let elements = map[ key ];
            if ( Array.isArray( elements ) ) {
                const size = elements.length;
                const index = ( this._index >= size || this._index < 0 ) ? size - 1 : this._index;
                obj[ key ] = elements[ index ];
            }
        }
        return [ obj ];
    }

}