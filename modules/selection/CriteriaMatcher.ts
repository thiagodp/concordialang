import { FilterCriterion } from './FilterCriterion';
import { ReservedTags } from '../req/ReservedTags';
import { Defaults } from '../app/Defaults';
import { Tag } from '../ast/Tag';
import { isDefined, isString } from '../util/TypeChecking';

export class CriteriaMatcher {

    constructor(
        private _ignoreKeywords: string[] = [ ReservedTags.IGNORE ],
        private _importanceKeywords: string[] = [ ReservedTags.IMPORTANCE ],
        private readonly _defaultImportanceValue: number = ( new Defaults() ).IMPORTANCE
    ) {
    }

    /**
     * Returns true whether the given criteria are match.
     * 
     * @param criteria Criteria to be applied.
     * @param tags Node tags.
     * @param nodeName Node name, e.g., feature name, scenario name, variant name, etc.
     */
    matches(
        criteria: Map< FilterCriterion, string | number >,
        tags: Tag[],
        nodeName: string
    ): boolean {

        // No filter ? Matches.
        if ( 0 === criteria.size ) {
            return true;
        }

        const hasTags: boolean = tags.length > 0;

        // An Importance value is considered even if the node has no Importance tag defined.
        // The node assumes a default Importance value.
        let tagImportanceValue: number | null = hasTags
            ? this.importanceValue( tags ) || this._defaultImportanceValue
            : this._defaultImportanceValue;

        for ( let [ criterion, value ] of criteria ) {

            // Importance
            const criterionIsAboutImportance: boolean = criterion.toString().startsWith( 'importance' );
            if ( criterionIsAboutImportance ) {
                const val: number = isString( value ) ? parseInt( value.toString() ) : Number( value );
                if ( FilterCriterion.IMPORTANCE_GTE === criterion ) {
                    return tagImportanceValue >= val;
                }
                if ( FilterCriterion.IMPORTANCE_LTE === criterion ) {
                    return tagImportanceValue <= val;
                }
                if ( FilterCriterion.IMPORTANCE_EQ === criterion ) {
                    return tagImportanceValue === val;
                }
            }

            if ( hasTags ) {
                // Tag keyword
                if ( FilterCriterion.TAG_EQ === criterion ) {
                    return this.tagsWithKeyword( tags, [ value.toString() ] ).length > 0;
                }
                if ( FilterCriterion.TAG_NEQ === criterion ) {
                    return 0 === this.tagsWithKeyword( tags, [ value.toString() ] ).length;
                }
            }

            // Node name
            if ( FilterCriterion.NAME_EQ === criterion ) {
                return nodeName.toLowerCase() === value.toString().toLowerCase();
            }
            if ( FilterCriterion.NAME_STARTING_WITH === criterion ) {
                return nodeName.toLowerCase().startsWith( value.toString().toLowerCase() );
            }
            if ( FilterCriterion.NAME_ENDING_WITH === criterion ) {
                return nodeName.toLowerCase().endsWith( value.toString().toLowerCase() );
            }
            if ( FilterCriterion.NAME_CONTAINING === criterion ) {
                return nodeName.toLowerCase().indexOf( value.toString().toLowerCase() ) >= 0;
            }            
        }

        return false;
    }

    hasTagAKeyword( tag: Tag, keywords: string[] ): boolean {
        return keywords.indexOf( tag.name.toLowerCase() ) >= 0;
    }    

    tagsWithKeyword( tags: Tag[], keywords: string[] ) {
        return tags.filter( ( t: Tag ) => this.hasTagAKeyword( t, keywords ) );
    }

    importanceValue( tags: Tag[] ): number | null {
        let filtered = this.tagsWithKeyword( tags, this._importanceKeywords );
        return ( filtered.length > 0 ) ? parseInt( filtered[ 0 ].content ) : null;
    }    
}