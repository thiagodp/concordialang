import * as seedrandom from 'seedrandom';

/**
 * Predictable random numbers.
 * 
 * @author  Thiago Delgado Pinto
 * @see     https://github.com/davidbau/seedrandom
 * @see     https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
 */
export class Random {

    private _prng: any;

    /**
     * @param seed Seed (optional). Defaults to the current timestamp.
     */
    constructor( seed?: string ) {
        // Uses Johannes Baagøe's extremely fast Alea PRNG
        this._prng = seedrandom.alea( seed || Date.now().toString() );
    }

    /**
     * Generates a double >= 0 and < 1.
     */
    generate(): number {
        return this._prng(); // 32 bits of randomness in a double
        //return this._prng().double(); // 56 bits of randomness in a double
    }

}