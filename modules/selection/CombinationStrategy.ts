import { Random } from '../testdata/random/Random';
import * as cartesian from 'cartesian';
import * as oneWise from 'one-wise';
import * as suffleObjArrays from 'shuffle-obj-arrays';

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