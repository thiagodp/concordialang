import { ATSCommand } from "../../modules/testscript/AbstractTestScript";
import { render } from "mustache";

type CmdObj = {
    action: string,
    modifier?: string,
    options?: string[],
    ignoreOptions?: boolean,
    targetType?: string,
    default? :boolean,
    template: string,
    valueAsNonArray?: boolean, // only when length > 1
    firstValueShouldBeInteger?: boolean
};


/**
 * Translates abstract test commands to CodeceptJS commands.
 *
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
export class ActionMapper {

    private readonly ANY_TYPE: string = 'any';
    private readonly NONE_TYPE: string = '---'; // cannot be empty

    // Evaluation order matters!
    private commandMap: Array< CmdObj > = [

        // @see https://github.com/Codeception/CodeceptJS/tree/master/docs/webapi

        // AM_IN
        { action: 'amIn', targetType: 'url', template: 'I.amOnPage({{{target}}});' },
        { action: 'amIn', default: true, template: 'I.amOnPage({{{value}}});' },

        // APPEND
        { action: 'append', default: true, template: 'I.appendField({{{target}}}, {{{value}}});' },

        // ATTACH_FILE
        { action: 'attachFile', default: true,  template: 'I.attachFile({{{target}}}, {{{value}}});' },

        // CHECK
        { action: 'check', targetType: this.ANY_TYPE, template: 'I.checkOption({{{target}}});' },
        { action: 'check', default: true, template: 'I.checkOption({{{value}}});' },

        // CLEAR
        { action: 'clear', targetType: 'cookie', template: 'I.clearCookie({{{target}}});' },
        { action: 'clear', default: true, template: 'I.clearField({{{target}}});' },

        // CLICK
        { action: 'click', targetType: this.ANY_TYPE, template: 'I.click({{{target}}});' },
        { action: 'click', default: true, template: 'I.click({{{value}}});' },

        // CLOSE
        { action: 'close', targetType: 'currentTab', template: 'I.closeCurrentTab();' },
        { action: 'close', targetType: this.NONE_TYPE, options: [ 'currentTab' ], template: 'I.closeCurrentTab();' },

        { action: 'close', targetType: 'otherTabs', template: 'I.closeOtherTabs();' },
        { action: 'close', targetType: this.NONE_TYPE, options: [ 'otherTabs' ], template: 'I.closeOtherTabs();' },

        // DOUBLE_CLICK
        { action: 'doubleClick', targetType: this.ANY_TYPE, template: 'I.doubleClick({{{target}}});' },
        { action: 'doubleClick', default: true, template: 'I.doubleClick({{{value}}});' },

        // DRAG
        { action: 'drag', targetType: this.ANY_TYPE, template: 'I.dragAndDrop({{{target}}});' },

        // FILL
        { action: 'fill', default: true, template: 'I.fillField({{{target}}}, {{{value}}});' },

        // MOVE
        { action: 'move', targetType: this.ANY_TYPE, options: [ 'cursor' ], template: 'I.moveCursorTo({{{target}}});' },

        // PRESS
        { action: 'press', default: true, template: 'I.pressKey({{{value}}});' },

        // RIGHT_CLICK
        { action: 'rightClick', targetType: this.ANY_TYPE, template: 'I.rightClick({{{target}}});' },
        { action: 'rightClick', default: true, template: 'I.rightClick({{{value}}});' },

        // SAVE SCREENSHOT
        { action: 'saveScreenshot', default: true, template: 'I.saveScreenshot({{{value}}});' },

        // SEE
        { action: 'see',  targetType: 'textbox', template: 'I.seeInField({{{target}}}, {{{value}}});' },
        { action: 'see',  targetType: 'textbox', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
        { action: 'see',  targetType: 'textarea', template: 'I.seeInField({{{target}}}, {{{value}}});' },
        { action: 'see',  targetType: 'textarea', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },

        { action: 'see',  targetType: 'checkbox', options: [ 'checked' ], template: 'I.seeCheckboxIsChecked({{{target}}});' },
        { action: 'see',  targetType: 'checkbox', modifier: 'not', options: [ 'checked' ], template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },

        { action: 'see',  targetType: 'cookie', template: 'I.seeCookie({{{value}}});' },
        { action: 'see',  targetType: 'cookie', modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
        { action: 'see',  targetType: this.ANY_TYPE, options: [ 'cookie' ], template: 'I.seeCookie({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TYPE, options: [ 'cookie' ], modifier: 'not', template: 'I.dontSeeCookie({{{target}}});' },

        { action: 'see',  targetType: 'title', template: 'I.seeInTitle({{{target}}});' },
        { action: 'see',  targetType: 'title', modifier: 'not', template: 'I.dontSeeInTitle({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TYPE, options: [ 'title' ], template: 'I.seeInTitle({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TYPE, options: [ 'title' ], modifier: 'not', template: 'I.dontSeeInTitle({{{target}}});' },
        { action: 'see',  targetType: 'title', options: [ 'inside' ], template: 'I.seeInTitle({{{value}}});' },
        { action: 'see',  targetType: 'title', options: [ 'inside' ], modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
        { action: 'see',  targetType: 'title', options: [ 'with' ], template: 'I.seeInTitle({{{value}}});' },
        { action: 'see',  targetType: 'title', options: [ 'with' ], modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
        { action: 'see',  targetType: this.NONE_TYPE, options: [ 'with', 'title' ], template: 'I.seeInTitle({{{value}}});' },
        { action: 'see',  targetType: this.NONE_TYPE, options: [ 'with', 'title' ], modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },

        { action: 'see',  targetType: 'url', template: 'I.seeCurrentUrlEquals({{{target}}});' },
        { action: 'see',  targetType: 'url', modifier: 'not', template: 'I.dontSeeCurrentUrlEquals({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TYPE, options: [ 'url' ], template: 'I.seeCurrentUrlEquals({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TYPE, modifier: 'not', options: [ 'url' ], template: 'I.dontSeeCurrentUrlEquals({{{target}}});' },

        { action: 'see',  targetType: 'url', options: [ 'with' ], template: 'I.seeInCurrentUrl({{{value}}});' },
        { action: 'see',  targetType: 'url', options: [ 'inside' ], template: 'I.seeInCurrentUrl({{{value}}});' },
        { action: 'see',  targetType: 'url', options: [ 'with' ], modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
        { action: 'see',  targetType: 'url', options: [ 'inside' ], modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
        { action: 'see',  targetType: this.NONE_TYPE, options: [ 'with', 'url' ], template: 'I.seeInCurrentUrl({{{value}}});' },
        { action: 'see',  targetType: this.NONE_TYPE, options: [ 'with', 'url' ], modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },

        { action: 'see',  targetType: this.ANY_TYPE, template: 'I.seeElement({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TYPE, modifier: 'not', template: 'I.dontSeeElement({{{target}}});' },

        { action: 'see',  default: true, modifier: 'not', template: 'I.dontSee({{{value}}});' },
        { action: 'see',  default: true, template: 'I.see({{{value}}});' },

        // SELECT
        { action: 'select', default: true, template: 'I.selectOption({{{target}}}, {{{value}}});' },

        // TAP
        { action: 'tap', targetType: this.ANY_TYPE, template: 'I.tap({{{target}}});' },
        { action: 'tap', default: true, template: 'I.tap({{{value}}});' },

        // UNCHECK
        { action: 'uncheck', default: true, template: 'I.uncheckOption({{{target}}});' },

        // WAIT
        { action: 'wait', targetType: 'text', template: 'I.waitForText({{{target}}}, {{{value}}});' },
        { action: 'wait', targetType: this.NONE_TYPE, options: [ 'visible' ], template: 'I.waitForVisible({{{target}}});' },
        { action: 'wait', targetType: this.NONE_TYPE, options: [ 'invisible' ], template: 'I.waitForInvisible({{{target}}});' },
        { action: 'wait', targetType: this.NONE_TYPE, options: [ 'enabled' ], template: 'I.waitForEnabled({{{target}}});' },
        { action: 'wait', targetType: this.NONE_TYPE, ignoreOptions: true, firstValueShouldBeInteger: true, template: 'I.wait({{{value}}});' },
        { action: 'wait', targetType: this.NONE_TYPE, template: 'I.waitForText({{{value}}});', valueAsNonArray: true },
        { action: 'wait', targetType: this.ANY_TYPE, template: 'I.waitForElement({{{target}}}, {{{value}}});', firstValueShouldBeInteger: true },
        { action: 'wait', targetType: this.ANY_TYPE, template: 'I.waitForElement({{{target}}});' },
    ];


    /**
     * Translates an abstract command to one or more CodeceptJS commands.
     * Returns an array of commands, since an abstract command can generate
     * multiple lines of test code.
     */
    public map( command: ATSCommand ): Array<string> {

        console.log( 'command', command );

        let commands: Array<string> = [];

        let compareMapObj = obj =>
        {

            const sameAction = obj.action === command.action;
            if ( ! sameAction ) {
                return false;
            }

            // console.log( "\t", obj );

            const sameModifier = obj.modifier == command.modifier;

            if ( true === obj.default ) {
                return sameModifier;
            }

            const isNoneType: boolean = this.NONE_TYPE === obj.targetType;
            const targetsCount: number = ! command.targets ? 0 : command.targets.length;
            const targetTypesCount: number = ! command.targetTypes ? 0 : command.targetTypes.length;
            const valuesCount: number = ! command.values ? 0 : command.values.length;

            const onlyForValues = ( ( ! obj.targetType || isNoneType ) && targetsCount < 1 );

            const acceptsAny = this.ANY_TYPE === obj.targetType && targetsCount > 0;

            if ( ( onlyForValues || acceptsAny ) && true === obj.firstValueShouldBeInteger ) {
                if ( valuesCount < 1 ) {
                    return false;
                }
                const value = command.values[ 0 ];
                if ( 'number' === typeof value || ! isNaN( parseInt( value ) ) ) {
                    command.values[ 0 ] = Number( value ); // Guarantee number type
                    return true;
                }
                return false;
            }

            const sameOptions = this.sameValues( obj.options, command.options );

            if ( onlyForValues ) {
                return ( sameOptions || obj.ignoreOptions ) && sameModifier;
            }

            if ( isNoneType && sameOptions && valuesCount < 1 ) {
                return true;
            }

            const sameTargetType = acceptsAny ||
                ( Array.isArray( command.targetTypes )
                    && command.targetTypes.indexOf( obj.targetType ) >= 0 );

            // console.log( sameTargetType, sameModifier, sameOptions );

            return sameTargetType && sameModifier && sameOptions;
        };

        // console.log( 'COMMAND', command );
        let entry: CmdObj = this.commandMap.filter( compareMapObj )[0];
        // console.log( 'SELECTED', entry );

        let cmd;
        if ( ! entry ) {
            // console.log( 'NOT FOUND', command );
            cmd = this.generateNotAvailableMessage( command );
        } else {
            cmd = render(
                entry.template + ' // ({{{location.line}}},{{{location.column}}}){{#comment}} {{{comment}}}{{/comment}}',
                {
                    target   : ! command.targets ? '' : this.convertTargets( command.targets ),
                    value    : ! command.values ? '' : this.convertValues( command.values, entry.valueAsNonArray ),
                    location : command.location,
                    comment  : command.comment,
                    modifier : command.modifier,
                    options  : command.options,
                }
            );
        }

        commands.push( cmd );

        return commands;
    }

    private convertTargets( targets: string[] | any[] ): string {

        if ( 0 === targets.length ) {
            return '';
        }

        const areStrings = 'string' === typeof targets[ 0 ];
        if ( areStrings ) {
            let strTargets: string[] = targets as string[];
            if ( 1 === targets.length ) {
                return this.convertSingleTarget( strTargets[ 0 ] );
            }
            return strTargets.map( this.convertSingleTarget ).join( ', ' );
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

    private convertSingleTarget( target: string ): string {
        return target.charAt( 0 ) === '@' ? `{name: "${target.substr(1)}"}` : `"${target}"`;
    }

    private convertValues( values: any[], valueAsNonArrayWhenGreaterThanOne: boolean = false ): string {
        if ( 0 === values.length ) {
            return '';
        }
        if ( 1 === values.length ) {
            return this.convertSingleValue( values[ 0 ] );
        }
        const joint = values.map( this.convertSingleValue ).join( ', ' );
        if ( ! valueAsNonArrayWhenGreaterThanOne ) {
            return '[' + joint + ']';
        }
        return joint;
    }

    private convertSingleValue( value: any ) {
        return typeof value === 'string' ? `"${value}"`: value;
    }

    private sameValues( a: string[], b: string[] ): boolean {
        if ( a === b || ( ! a && ! b ) ) {
            return true;
        }
        if ( ( ! a && !! b ) || ( !! a && ! b ) ) {
            return false;
        }
        let aa = Array.isArray( a ) ? a.sort() : [];
        let bb = Array.isArray( b ) ? b.sort() : [];
        if ( 0 === aa.length && 0 === b.length ) {
            return true;
        }
        return a.join('').toLowerCase() === b.join('').toLowerCase();
    }

    private generateNotAvailableMessage( command: ATSCommand ): string {
        let message: string = '// Command not available. ';
        message += `Action: "${ ! command.action ? 'none' : command.action }". `;
        message += `Modifier: "${ ! command.modifier ? 'none' : command.modifier }". `;
        message += `Option: ${ ! command.options ? 'none' : command.options }. `;
        message += `Targets: ${ ! command.targets ? 'none' : command.targets }. `;
        message += `Target type: ${ ! command.targetTypes ? 'none' : command.targetTypes }. `;
        message += `Values: ${ ! command.values ? 'none' : command.values }. `;
        return message;
    }

}