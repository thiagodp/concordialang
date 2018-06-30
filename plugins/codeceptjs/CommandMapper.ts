import { ATSCommand } from "../../modules/testscript/AbstractTestScript";
import { render } from "mustache";

/**
 * Command comparison
 *
 * @author Thiago Delgado Pinto
 */
export enum CmdCmp {

    ONE_VALUE,
    ONE_VALUE__OR_ARRAY,
    ONE_VALUE__ONE_NUMBER,
    ONE_VALUE__TWO_NUMBERS,
    ONE_VALUE__THREE_NUMBERS,
    ONE_VALUE__ONE_TARGET,

    ONE_VALUE_OR_NUMBER,
    ONE_VALUE_OR_NUMBER__ONE_NUMBER,
    ONE_VALUE_OR_NUMBER__ONE_TARGET,
    ONE_VALUE_OR_NUMBER__OR_ARRAY,

    ONE_NUMBER,
    ONE_NUMBER__ONE_TARGET,

    ONE_TARGET,
    ONE_TARGET__ONE_VALUE,
    ONE_TARGET__ONE_NUMBER,
    ONE_TARGET__ONE_VALUE_OR_NUMBER,
    ONE_TARGET__TWO_NUMBERS,
    ONE_TARGET__THREE_NUMBERS,

    SAME_TARGET_TYPE,
    SAME_TARGET_TYPE__ONE_NUMBER,
    SAME_TARGET_TYPE__ONE_VALUE,
    SAME_TARGET_TYPE__ONE_VALUE__ONE_NUMBER,
    SAME_TARGET_TYPE__ONE_TARGET,
    SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER,
    SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER__ONE_VALUE,
    SAME_TARGET_TYPE__ONE_TARGET__TWO_NUMBERS,
    SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER,
    SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE__ONE_NUMBER,

    SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER,
    SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER__ONE_NUMBER,
    SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER__ONE_NUMBER__ONE_TARGET,

    SAME_OPTION,
    SAME_OPTION__ONE_NUMBER,

    SAME_OPTION__ONE_VALUE,
    SAME_OPTION__ONE_VALUE__ONE_NUMBER,
    SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_TARGET,
    SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_VALUE,
    SAME_OPTION__ONE_VALUE__TWO_NUMBERS,

    SAME_OPTION__ONE_VALUE_OR_NUMBER,
    SAME_OPTION__ONE_VALUE_OR_NUMBER__ONE_NUMBER,

    SAME_OPTION__ONE_TARGET,
    SAME_OPTION__ONE_TARGET__ONE_NUMBER,
    SAME_OPTION__ONE_TARGET__TWO_NUMBERS,
    SAME_OPTION__ONE_TARGET__ONE_VALUE,
    SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER,
    SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER__ONE_NUMBER,
    SAME_OPTION__ONE_TARGET__ONE_VALUE__ONE_NUMBER,

    SAME_OPTION__SAME_TARGET_TYPE,
    SAME_OPTION__SAME_TARGET_TYPE__ONE_NUMBER,
    SAME_OPTION__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER,
    SAME_OPTION__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER__ONE_NUMBER,
    SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET,
    SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER,

    SAME_MODIFIER__ONE_VALUE,
    SAME_MODIFIER__ONE_VALUE_OR_NUMBER,
    SAME_MODIFIER__ONE_TARGET,
    SAME_MODIFIER__SAME_OPTION,
    SAME_MODIFIER__SAME_OPTION__ONE_VALUE,
    SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER,
    SAME_MODIFIER__SAME_OPTION__ONE_TARGET,
    SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE,
    SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER,
    SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET,
    SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE,
    SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER,
    SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE,
    SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER,

    TWO_TARGETS,
    TWO_VALUES_SAME_OPTION,

    TWO_NUMBERS,
    TWO_NUMBERS_SAME_OPTION,
    TWO_NUMBERS_SAME_TARGET_TYPE
}

/**
 * Command configuration
 *
 * @author Thiago Delgado Pinto
 */
export interface CmdCfg {
    action: string,
    comp: CmdCmp,
    modifier?: string,
    options?: string[],
    targetType?: string,
    template: string,
    valuesAsNonArray?: boolean,
    singleQuotedValues?: boolean,
    singleQuotedTargets?: boolean
}

/**
 * Command mapper
 *
 * @author Thiago Delgado Pinto
 */
export class CommandMapper {

    constructor( protected commands: CmdCfg[] ) {
    }

    /**
     * Converts an abstract test script command into one or more lines of code.
     *
     * @param cmd Abstract test script command
     */
    map( cmd: ATSCommand ): string[] {

        let cmdCfg = this.commands.find( cfg => this.areCompatible( cfg, cmd ) );
        if ( ! cmdCfg ) {
            return [];
        }
        // if ( cmd.action === 'swipe' ) console.log( cmd, cmdCfg );
        return this.makeCommands( cmdCfg, cmd );
    }

    /**
     * Make one or more lines of code from the given command configuration and
     * abstract test script command.
     *
     * @param cfg Command configuration
     * @param cmd Abstract test script command
     * @returns Lines of code.
     */
    makeCommands( cfg: CmdCfg, cmd: ATSCommand ): string[] {

        // singleQuotedTargets defaults to true if undefined
        if ( undefined === cfg.singleQuotedTargets ) {
            cfg.singleQuotedTargets = true;
        }

        const COMMENT_TEMPLATE = ' // ({{{location.line}}},{{{location.column}}}){{#comment}} {{{comment}}}{{/comment}}';

        if ( !! cmd[ "db" ] && cmd.action === 'connect' ) {

            const values = {
                value: [ '"' + cmd.values[ 0 ] + '"', JSON.stringify( cmd[ "db" ]  ) ],
                location : cmd.location,
                comment: cmd.comment,
            };
            const template = cfg.template + COMMENT_TEMPLATE;

            return [ render( template, values ) ];
        }

        const template = cfg.template + COMMENT_TEMPLATE;

        const values = {
            target   : ! cmd.targets ? '' : this.targetsToParameters( cmd.targets, cfg.singleQuotedTargets ),
            value    : ! cmd.values ? '' : this.valuesToParameters( cmd.values, cfg.valuesAsNonArray, cfg.singleQuotedValues ),
            location : cmd.location,
            comment  : cmd.comment,
            modifier : cmd.modifier,
            options  : cmd.options,
        }

        return [ render( template, values ) ];
    }

    /**
     * Make a code comment with the data of a abstract test script command.
     *
     * @param cmd Abstract test script command
     */
    makeCommentWithCommand( cmd: ATSCommand ): string {
        return '// COMMAND NOT ACCEPTED -> ' + this.serializeCommand( cmd );
    }

    serializeCommand( cmd: ATSCommand ): string {
        let s = '';
        let count = 0;
        for ( let prop in cmd ) {
            let val = cmd[ prop ];
            if ( undefined === val ) {
                continue;
            }
            if ( count > 0 ) {
                s += ', ';
            }
            s += `"${prop}": ` + JSON.stringify( val );
            ++count;
        }
        return s;
    }

    /**
     * Returns true whether the command configuration is compatible with the
     * given abstract test script command.
     *
     * @param cfg Command configuration
     * @param cmd Abstract test script command
     */
    areCompatible( cfg: CmdCfg, cmd: ATSCommand ): boolean {

        if ( cfg.action !== cmd.action ) {
            return false;
        }

        function isNumber( x ): boolean {
            return 'number' === typeof x || ! isNaN( parseInt( x ) );
        }

        function sameTargetTypes( cfg: CmdCfg, cmd: ATSCommand ): boolean {
            return ( cmd.targetTypes || [] ).indexOf( cfg.targetType ) >= 0;
        }

        function includeOptions( from: CmdCfg, into: ATSCommand ): boolean {
            let targetOptions = into.options || [];
            for ( let o of from.options || [] ) {
                if ( targetOptions.indexOf( o ) < 0 ) {
                    return false; // not found
                }
            }
            return true; // all options of cfg were found at cmd
        }

        function oneValueThenNumbers( cmd: ATSCommand, numberCount: number, atLeast: boolean = false ): boolean {
            const valuesCount = numberCount + 1;
            if ( ( cmd.values || [] ).length !== valuesCount ) {
                return false;
            }
            const totalNumbersInValues = cmd.values.filter( isNumber ).length;
            if ( atLeast && totalNumbersInValues < numberCount ) {
                return false;
            }
            if ( numberCount !== totalNumbersInValues ) {
                return false;
            }
            let newArray = [];
            for ( let i = 0; i < valuesCount; ++i ) {
                if ( isNumber( cmd.values[ i ] ) ) {
                    newArray.push( Number( cmd.values[ i ] ) );
                } else {
                    newArray.unshift( cmd.values[ i ] );
                }
            }
            cmd.values = newArray;
            return true;
        }

        function oneValueThenOneNumber( cmd: ATSCommand ): boolean {
            return oneValueThenNumbers( cmd, 1 );
        }

        function oneValueThenTwoNumbers( cmd: ATSCommand ): boolean {
            return oneValueThenNumbers( cmd, 2 );
        }

        function oneValueThenThreeNumbers( cmd: ATSCommand ): boolean {
            return oneValueThenNumbers( cmd, 3 );
        }

        const valuesCount = ( cmd.values || [] ).length;
        const targetsCount = ( cmd.targets || [] ).length;

        switch( cfg.comp ) {

            case CmdCmp.ONE_VALUE: {
                return 1 === valuesCount && ! isNumber( cmd.values[ 0 ] );
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_VALUE: {
                return 1 === valuesCount &&
                    ! isNumber( cmd.values[ 0 ] ) &&
                    sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE: {
                return 1 === valuesCount &&
                    ! isNumber( cmd.values[ 0 ] ) &&
                    sameTargetTypes( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER: {
                return 1 === valuesCount &&
                    sameTargetTypes( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_OPTION__ONE_NUMBER: {
                const ok = 1 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    includeOptions( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                }
                return ok;
            }

            case CmdCmp.SAME_OPTION__ONE_VALUE: {
                return 1 === valuesCount &&
                    ! isNumber( cmd.values[ 0 ] ) &&
                    includeOptions( cfg, cmd );
            }

            case CmdCmp.SAME_MODIFIER__SAME_OPTION: {
                return includeOptions( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE: {
                return 1 === valuesCount &&
                    ! isNumber( cmd.values[ 0 ] ) &&
                    includeOptions( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE_OR_NUMBER: {
                return 1 === valuesCount &&
                    includeOptions( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.ONE_VALUE_OR_NUMBER__OR_ARRAY: ; // next
            case CmdCmp.ONE_VALUE__OR_ARRAY: {
                return valuesCount >= 1;
            }

            case CmdCmp.ONE_VALUE__ONE_NUMBER: {
                return oneValueThenOneNumber( cmd );
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_NUMBER: {
                return sameTargetTypes( cfg, cmd ) && 1 == valuesCount && isNumber( cmd.values[ 0 ] );
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_VALUE__ONE_NUMBER: {
                return sameTargetTypes( cfg, cmd ) && oneValueThenOneNumber( cmd );
            }

            case CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER: {
                return includeOptions( cfg, cmd ) && oneValueThenOneNumber( cmd );
            }

            case CmdCmp.SAME_MODIFIER__ONE_VALUE: {
                return 1 === valuesCount &&
                    ! isNumber( cmd.values[ 0 ] ) &&
                    cmd.modifier === cfg.modifier;
            }

            case CmdCmp.SAME_MODIFIER__ONE_VALUE_OR_NUMBER: {
                return 1 === valuesCount && cmd.modifier === cfg.modifier;
            }

            case CmdCmp.ONE_VALUE__TWO_NUMBERS: {
                return oneValueThenTwoNumbers( cmd );
            }

            case CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_TARGET: {
                return 1 === targetsCount &&
                    oneValueThenOneNumber( cmd ) &&
                    includeOptions( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_VALUE: {
                if ( 3 !== valuesCount ) {
                    return false;
                }
                const numberIndex = cmd.values.findIndex( isNumber );
                if ( numberIndex < 0 ) {
                    return false;
                }
                // Transform to number
                cmd.values[ numberIndex ] = Number( cmd.values[ numberIndex ] );
                // Guarantee order -> index 1 is where the number must be placed
                if ( 0 === numberIndex ) {
                    cmd.values = [ cmd.values[ 1 ], cmd.values[ 0 ], cmd.values[ 2 ] ];
                } else if ( 2 == numberIndex ) {
                    cmd.values = [ cmd.values[ 0 ], cmd.values[ 2 ], cmd.values[ 1 ] ];
                }
                return true;
            }

            case CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS: {
                return includeOptions( cfg, cmd ) && oneValueThenTwoNumbers( cmd );
            }

            case CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER: {
                return 1 === valuesCount && includeOptions( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION__ONE_VALUE_OR_NUMBER__ONE_NUMBER: {
                return oneValueThenNumbers( cmd, 1, true ) && includeOptions( cfg, cmd );
            }

            case CmdCmp.ONE_VALUE__THREE_NUMBERS: {
                return oneValueThenThreeNumbers( cmd );
            }

            case CmdCmp.ONE_VALUE_OR_NUMBER: {
                return 1 === valuesCount;
            }

            case CmdCmp.ONE_NUMBER: {
                const ok = 1 === valuesCount && isNumber( cmd.values[ 0 ] );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_NUMBER__ONE_TARGET: {
                return 1 === targetsCount && 1 === valuesCount && isNumber( cmd.values[ 0 ] );
            }

            case CmdCmp.ONE_TARGET: return 1 === targetsCount;

            case CmdCmp.ONE_VALUE__ONE_TARGET: ; // next
            case CmdCmp.ONE_TARGET__ONE_VALUE: {
                return 1 === targetsCount && 1 === valuesCount && ! isNumber( cmd.values[ 0 ] );
            }

            case CmdCmp.ONE_TARGET__ONE_NUMBER: {
                const ok = 1 === targetsCount &&
                    1 === valuesCount &&
                    isNumber( cmd.values[ 0 ] );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_VALUE_OR_NUMBER__ONE_NUMBER: {
                return oneValueThenNumbers( cmd, 1, true );
            }

            case CmdCmp.ONE_VALUE_OR_NUMBER__ONE_TARGET: ; // next
            case CmdCmp.ONE_TARGET__ONE_VALUE_OR_NUMBER: {
                return 1 === targetsCount && 1 === valuesCount;
            }

            case CmdCmp.ONE_TARGET__TWO_NUMBERS: {
                const ok = 1 === targetsCount &&
                    2 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    isNumber( cmd.values[ 1 ] );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_TARGET__THREE_NUMBERS: {
                const ok = 1 === targetsCount &&
                    3 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    isNumber( cmd.values[ 1 ] ) &&
                    isNumber( cmd.values[ 2 ] );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                    cmd.values[ 2 ] = Number( cmd.values[ 2 ] );
                }
                return ok;
            }

            case CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER: {
                const ok = 1 === targetsCount &&
                    1 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    includeOptions( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                }
                return ok;
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER: {
                const ok = 1 === targetsCount &&
                    1 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    sameTargetTypes( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                }
                return ok;
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER__ONE_VALUE: {
                let ok = 1 === targetsCount &&
                    2 === valuesCount &&
                    sameTargetTypes( cfg, cmd );
                if ( ! ok ) {
                    return false;
                }
                ok = oneValueThenNumbers( cmd, 1, true );
                if ( ok ) {
                    cmd.values = [ cmd.values[ 1 ], cmd.values[ 0 ] ];
                }
                return ok;
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__TWO_NUMBERS: {
                const ok = 1 === targetsCount &&
                    2 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    isNumber( cmd.values[ 1 ] ) &&
                    sameTargetTypes( cfg, cmd );
                if ( ok ) {
                    cmd.values = [ Number( cmd.values[ 0 ] ), Number( cmd.values[ 1 ] ) ];
                }
                return ok;
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER: {
                return 1 === targetsCount &&
                    1 === valuesCount &&
                    sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE__ONE_NUMBER: {
                const ok = 1 === targetsCount &&
                    2 === valuesCount &&
                    sameTargetTypes( cfg, cmd );
                if ( ! ok ) {
                    return false;
                }
                return oneValueThenNumbers( cmd, 1, true );
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER: {
                return 1 === valuesCount &&
                    sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER__ONE_NUMBER: {
                return oneValueThenNumbers( cmd, 1, true ) &&
                    sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER__ONE_NUMBER__ONE_TARGET: {
                return 1 === targetsCount &&
                    oneValueThenNumbers( cmd, 1, true ) &&
                    sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION__ONE_TARGET__TWO_NUMBERS: {
                const ok = 1 === targetsCount &&
                    2 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    isNumber( cmd.values[ 1 ] ) &&
                    includeOptions( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }

            case CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE: {
                return 1 === targetsCount &&
                    1 === valuesCount &&
                    ! isNumber( cmd.values[ 0 ] ) &&
                    includeOptions( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER: {
                return 1 === targetsCount &&
                    1 === valuesCount &&
                    includeOptions( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER__ONE_NUMBER: {
                const ok = 1 === targetsCount &&
                    2 === valuesCount &&
                    includeOptions( cfg, cmd );
                if ( ! ok ) {
                    return false;
                }
                return oneValueThenNumbers( cmd, 1, true );
            }

            case CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE__ONE_NUMBER: {
                return 1 === targetsCount &&
                    includeOptions( cfg, cmd ) &&
                    oneValueThenOneNumber( cmd );
            }

            case CmdCmp.SAME_OPTION__SAME_TARGET_TYPE: {
                return includeOptions( cfg, cmd ) &&
                    sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION__SAME_TARGET_TYPE__ONE_NUMBER: {
                const ok = 1 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    includeOptions( cfg, cmd ) &&
                    sameTargetTypes( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                }
                return ok;
            }

            case CmdCmp.SAME_OPTION__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER: {
                return 1 === valuesCount &&
                    includeOptions( cfg, cmd ) &&
                    sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION__SAME_TARGET_TYPE__ONE_VALUE_OR_NUMBER__ONE_NUMBER: {
                return oneValueThenNumbers( cmd, 1, true ) &&
                    includeOptions( cfg, cmd ) &&
                    sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET: {
                return 1 === targetsCount &&
                    includeOptions( cfg, cmd ) &&
                    sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER: {
                return 1 === targetsCount &&
                    1 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    includeOptions( cfg, cmd ) &&
                    sameTargetTypes( cfg, cmd );
            }


            case CmdCmp.SAME_TARGET_TYPE__ONE_TARGET: {
                return 1 === targetsCount && sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET: {
                return 1 === targetsCount &&
                    includeOptions( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET: {
                return 1 === targetsCount &&
                    sameTargetTypes( cfg, cmd ) &&
                    includeOptions( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE: {
                return 1 === targetsCount &&
                    1 === valuesCount &&
                    ! isNumber( cmd.values[ 0 ] ) &&
                    includeOptions( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE_OR_NUMBER: {
                return 1 === targetsCount &&
                    1 === valuesCount &&
                    includeOptions( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE: {
                return 1 === targetsCount &&
                    1 === valuesCount &&
                    ! isNumber( cmd.values[ 0 ] ) &&
                    sameTargetTypes( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE_OR_NUMBER: {
                return 1 === targetsCount &&
                    1 === valuesCount &&
                    sameTargetTypes( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_OPTION__ONE_TARGET: {
                return 1 === targetsCount && includeOptions( cfg, cmd );
            }

            case CmdCmp.SAME_MODIFIER__ONE_TARGET: {
                return 1 === targetsCount && cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_TARGET_TYPE: {
                return 0 === targetsCount && 0 === valuesCount && sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION: {
                return 0 === targetsCount && 0 === valuesCount && includeOptions( cfg, cmd );
            }

            case CmdCmp.TWO_TARGETS: {
                return 2 === targetsCount;
            }

            case CmdCmp.TWO_VALUES_SAME_OPTION: {
                return 2 == valuesCount &&
                    ! isNumber( cmd.values[ 0 ] ) &&
                    ! isNumber( cmd.values[ 1 ] ) &&
                    includeOptions( cfg, cmd );
            }

            case CmdCmp.TWO_NUMBERS: {
                let ok = 2 == valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    isNumber( cmd.values[ 1 ] );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }

            case CmdCmp.TWO_NUMBERS_SAME_OPTION: {
                let ok = 2 == valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    isNumber( cmd.values[ 1 ] ) &&
                    includeOptions( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }

            case CmdCmp.TWO_NUMBERS_SAME_TARGET_TYPE: {
                let ok = 2 == valuesCount &&
                    isNumber( cmd.values[ 0 ] ) &&
                    isNumber( cmd.values[ 1 ] ) &&
                    sameTargetTypes( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }
        }

        return false;
    }

    /**
     * Convert targets to function parameters.
     *
     * @param targets Targets to convert, usually UI literals.
     * @param singleQuotedTargets Whether the targets should be wrapped with single quotes.
     */
    private targetsToParameters( targets: string[] | any[], singleQuotedTargets?: boolean ): string {

        if ( 0 === targets.length ) {
            return '';
        }

        const areStrings = 'string' === typeof targets[ 0 ];
        if ( areStrings ) {
            let strTargets: string[] = targets as string[];
            if ( 1 === targets.length ) {
                return this.convertSingleTarget( strTargets[ 0 ], singleQuotedTargets );
            }
            return strTargets
                .map( v => this.convertSingleTarget( v, singleQuotedTargets ) )
                .join( ', ' );
        }

        function valueReplacer( key, value ) {
            if ( typeof value === 'string' && value.charAt( 0 ) === '@' ) {
                return { name: value.substr( 1 ) };
            }
            return value;
        }

        const content = JSON.stringify( targets, valueReplacer );
        // remove [ and ]
        return content.substring( 1, content.length - 1 );
    }

    private convertSingleTarget( target: string, singleQuotedTargets: boolean ): string {

        const t = ! singleQuotedTargets
            ? this.escapeDoubleQuotes( target )
            : this.escapeSingleQuotes( target );

        return ! singleQuotedTargets
            ? t.charAt( 0 ) === '@' ? `{name: "${t.substr(1)}"}` : `"${t}"`
            : t.charAt( 0 ) === '@' ? `{name: '${t.substr(1)}'}` : `'${t}'`;
    }

    /**
     * Convert values to function parameters.
     *
     * @param values Values to convert.
     * @param valueAsNonArrayWhenGreaterThanOne Whether wants to convert an
     *      array to single values when its size is greater than one.
     * @param singleQuotedValues Whether is desired to use single quotes.
     */
    private valuesToParameters(
        values: any[],
        valueAsNonArrayWhenGreaterThanOne: boolean = false,
        singleQuotedValues: boolean = false
    ): string {
        if ( 0 === values.length ) {
            return '';
        }
        if ( 1 === values.length ) {
            return this.convertSingleValue( values[ 0 ], singleQuotedValues );
        }
        const joint = values
            .map( v => this.convertSingleValue( v, singleQuotedValues ) )
            .join( ', ' );
        if ( ! valueAsNonArrayWhenGreaterThanOne ) {
            return '[' + joint + ']';
        }
        return joint;
    }

    private convertSingleValue( value: any, singleQuotedValues: boolean = false ) {
        if ( typeof value === 'string' ) {
            const v = singleQuotedValues
                ? this.escapeSingleQuotes( value )
                : this.escapeDoubleQuotes( value );
            return singleQuotedValues ? `'${v}'` : `"${v}"`;
        }
        return value;
    }

    public escapeDoubleQuotes( value: string ): string {
        return value.replace( /[^\\](")/g, ( p1 ) => {
            return p1.substr( 0, 1 ) + '\\"';
        } );
    }

    public escapeSingleQuotes( value: string ): string {
        return value.replace( /[^\\](')/g, ( p1 ) => {
            return p1.substr( 0, 1 ) + "\\'";
        } );
    }

    // private sameValues( a: string[], b: string[] ): boolean {
    //     if ( a === b || ( ! a && ! b ) ) {
    //         return true;
    //     }
    //     if ( ( ! a && !! b ) || ( !! a && ! b ) ) {
    //         return false;
    //     }
    //     let aa = Array.isArray( a ) ? a.sort() : [];
    //     let bb = Array.isArray( b ) ? b.sort() : [];
    //     if ( 0 === aa.length && 0 === b.length ) {
    //         return true;
    //     }
    //     return a.join('').toLowerCase() === b.join('').toLowerCase();
    // }

}