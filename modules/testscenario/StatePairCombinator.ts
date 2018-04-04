import * as cartesian from 'cartesian';
import * as oneWise from 'one-wise';

/**
 * State pair combinator
 *
 * @author Thiago Delgado Pinto
 */
export interface StatePairCombinator {

    /**
     *
     * @param pairMap Maps a state to an array of pairs, that is: { string => Array< Pair< State, TestScenario > > > }
     * @returns Array of maps. Each maps a state to a pair, that is: Array< { string => Pair< State, TestScenario > } >
     */
    combine( pairMap: object ): object[];

}

/**
 * Performs a cartezian product of the elements.
 *
 * @author Thiago Delgado Pinto
 */
export class AllPairsCombinator implements StatePairCombinator {

    combine( pairMap: object ): object[] {
        return cartesian( pairMap );
    }

}

/**
 * Performs a 1-wise combination of the elements.
 *
 * @author Thiago Delgado Pinto
 */
export class OneWisePairCombinator implements StatePairCombinator {

    combine( pairMap: object ): object[] {
        return oneWise( pairMap );
    }

}