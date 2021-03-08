import { Variant } from "../ast/Variant";
import { Random } from "../testdata/random/Random";
import { RandomLong } from "../testdata/random/RandomLong";
import { TagUtil } from "../util/TagUtil";

/**
 * Variant selection strategy
 *
 * @author Thiago Delgado Pinto
 */
export interface VariantSelectionStrategy {

    select( variants: Variant[] ): Variant[];
}

/**
 * Variant selection strategy in which all variants are selected
 *
 * @author Thiago Delgado Pinto
 */
export class AllVariantsSelectionStrategy implements VariantSelectionStrategy {

    select( variants: Variant[] ): Variant[] {
        return variants;
    }
}

/**
 * Variant selection strategy in which the first variant is selected
 *
 * @author Thiago Delgado Pinto
 */
export class FirstVariantSelectionStrategy implements VariantSelectionStrategy {

    select( variants: Variant[] ): Variant[] {
        return variants.length > 0 ? [ variants[ 0 ] ] : [];
    }
}

/**
 * Variant selection strategy in which a single variant is randomly selected
 *
 * @author Thiago Delgado Pinto
 */
export class SingleRandomVariantSelectionStrategy implements VariantSelectionStrategy {

    constructor( private _seed: string ) {
    }

    select( variants: Variant[] ): Variant[] {
        const max = variants.length;
        if ( max < 1 ) {
            return [];
        }
        const randomLong = new RandomLong( new Random( this._seed ) );
        const index = randomLong.between( 0, max - 1 );
        return [ variants[ index ] ];
    }
}

/**
 * Variant selection strategy in which the first most important variant is selected.
 * The strategy considers the tag `importance` to get variants' importance value,
 * and assumes the default importance value when this tag is not declared.
 *
 * @author Thiago Delgado Pinto
 */
export class FirstMostImportantVariantSelectionStrategy implements VariantSelectionStrategy {

    private readonly _tagUtil = new TagUtil();

    constructor(
        private _defaultImportance: number,
        private _importanceKeywords: string[]
    ) {
    }

    select( variants: Variant[] ): Variant[] {
        let greaterImportanceValue = 0;
        let greaterImportanceIndex = -1;
        let index = -1;
        for ( let v of variants || [] ) {
            ++index;
            let importance = this.importanceOf( v );
            if ( importance > greaterImportanceValue ) {
                greaterImportanceValue = importance;
                greaterImportanceIndex = index;
            }
        }
        return greaterImportanceIndex >= 0 ? [ variants[ greaterImportanceIndex ] ] : [];
    }

    importanceOf( variant: Variant ): number {
        const importance: number | null = this._tagUtil.numericContentOfTheFirstTag(
            this._tagUtil.tagsWithNameInKeywords(
                variant.tags,
                this._importanceKeywords
            )
        );
        return null === importance ? this._defaultImportance : importance;
    }

}
