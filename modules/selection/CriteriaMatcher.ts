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
     * @param nodeTags Node tags.
     * @param nodeName Node name, e.g., feature name, scenario name, variant name, etc.
     */
    matches(
        criteria: Map< FilterCriterion, string | number | string[] >,
        nodeTags: Tag[],
        nodeName: string
    ): boolean {

        // No filter ? Matches.
        if ( 0 === criteria.size ) {
            return true;
        }

        const hasTags: boolean = nodeTags.length > 0;

        // An Importance value is considered even if the node has no Importance tag defined.
        // The node assumes a default Importance value.
        let tagImportanceValue: number | null = hasTags
            ? this.importanceValue( nodeTags ) || this._defaultImportanceValue
            : this._defaultImportanceValue;

        // Whether the criterion is established, ignore those with @ignore
        if ( hasTags 
            && criteria.has( FilterCriterion.IGNORE_TAG_NOT_DECLARED )
            && this.hasIgnoreTag( nodeTags ) ) {
            return false; // Does not match, i.e., has ignore tag
        }

        for ( let [ criterion, value ] of criteria ) {

            // Importance
            const criterionIsAboutImportance: boolean = criterion.toString().startsWith( 'importance' );
            if ( criterionIsAboutImportance ) {
                const val: number = isString( value ) ? parseInt( value.toString() ) : Number( value );
                switch ( criterion ) {
                    case FilterCriterion.IMPORTANCE_GTE: return tagImportanceValue >= val;
                    case FilterCriterion.IMPORTANCE_LTE: return tagImportanceValue <= val;
                    case FilterCriterion.IMPORTANCE_EQ: return tagImportanceValue == val;
                }
            }

            if ( hasTags ) {
                // Tag keyword
                switch ( criterion ) {
                    case FilterCriterion.TAG_EQ: 
                        return this.tagsWithKeyword( nodeTags, [ value.toString() ] ).length > 0;
                    case FilterCriterion.TAG_NEQ:
                        return 0 === this.tagsWithKeyword( nodeTags, [ value.toString() ] ).length;
                    case FilterCriterion.TAG_IN:
                        return this.tagsWithKeyword( nodeTags, value as string[] ).length > 0;
                    case FilterCriterion.TAG_NOT_IN:
                        return this.tagsWithKeyword( nodeTags, value as string[] ).length < 1;                        
                }
            }

            // Node name
            switch ( criterion ) {
                case FilterCriterion.NAME_EQ:
                    return nodeName.toLowerCase() === value.toString().toLowerCase();
                case FilterCriterion.NAME_STARTING_WITH:
                    return nodeName.toLowerCase().startsWith( value.toString().toLowerCase() );
                case FilterCriterion.NAME_ENDING_WITH:
                    return nodeName.toLowerCase().endsWith( value.toString().toLowerCase() );
                case FilterCriterion.NAME_CONTAINING:
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
        const filtered = this.tagsWithKeyword( tags, this._importanceKeywords );
        return ( filtered.length > 0 ) ? parseInt( filtered[ 0 ].content ) : null;
    }

    hasIgnoreTag( tags: Tag[] ): boolean {
        const filtered = this.tagsWithKeyword( tags, this._ignoreKeywords );
        return filtered.length > 0;
    }
}