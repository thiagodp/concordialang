import { ATSCommand } from "../../modules/testscript/AbstractTestScript";
import { render } from "mustache";

type CmdObj = {
    action: string,
    modifier?: string,
    options?: string[],
    targetType?: string,
    default? :boolean,
    template: string
};


/**
 * Translates abstract test commands to CodeceptJS commands.
 *
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
export class ActionMapper {

    private readonly ANY_TARGET: string = 'any';

    private commandMap: Array< CmdObj > = [

        // AM_IN
        { action: 'amIn', targetType: 'url', template: 'I.amOnPage({{{target}}});' },
        { action: 'amIn', default: true, template: 'I.amOnPage({{{value}}});' },

        // APPEND
        { action: 'append', default: true, template: 'I.appendField({{{target}}}, {{{value}}});' },

        // ATTACH_FILE
        { action: 'attachFile', default: true,  template: 'I.attachFile({{{target}}}, {{{value}}});' },

        // CHECK
        { action: 'check', targetType: this.ANY_TARGET, template: 'I.checkOption({{{target}}});' },
        { action: 'check', default: true, template: 'I.checkOption({{{value}}});' },

        // CLEAR
        { action: 'clear', targetType: 'cookie', template: 'I.clearCookie({{{target}}});' },
        { action: 'clear', default: true, template: 'I.clearField({{{target}}});' },

        // CLICK
        { action: 'click', targetType: this.ANY_TARGET, template: 'I.click({{{target}}});' },
        { action: 'click', default: true, template: 'I.click({{{value}}});' },

        // CLOSE
        // { action: 'close', default: true, template: 'I.click({{{target}}});' },

        // DOUBLE_CLICK
        { action: 'doubleClick', targetType: this.ANY_TARGET, template: 'I.doubleClick({{{target}}});' },
        { action: 'doubleClick', default: true, template: 'I.doubleClick({{{value}}});' },

        // FILL
        { action: 'fill', default: true, template: 'I.fillField({{{target}}}, {{{value}}});' },

        // PRESS
        { action: 'press', default: true, template: 'I.pressKey({{{value}}});' },

        // SEE
        { action: 'see',  targetType: 'textbox', template: 'I.seeInField({{{target}}}, {{{value}}});' },
        { action: 'see',  targetType: 'textarea', template: 'I.seeInField({{{target}}}, {{{value}}});' },
        { action: 'see',  targetType: 'cookie', template: 'I.seeCookie({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TARGET, options: [ 'cookie' ], template: 'I.seeCookie({{{target}}});' },
        { action: 'see',  targetType: 'title', template: 'I.seeInTitle({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TARGET, options: [ 'title' ], template: 'I.seeInTitle({{{target}}});' },
        { action: 'see',  targetType: 'url', template: 'I.seeCurrentUrlEquals({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TARGET, options: [ 'url' ], template: 'I.seeCurrentUrlEquals({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TARGET, template: 'I.seeElement({{{target}}});' },
        { action: 'see',  targetType: this.ANY_TARGET, modifier: 'not', template: 'I.dontSeeElement({{{target}}});' },
        { action: 'see',  default: true, modifier: 'not', template: 'I.dontSee({{{value}}});' },
        { action: 'see',  default: true, template: 'I.see({{{value}}});' },

        // SELECT
        { action: 'select', default: true, template: 'I.selectOption({{{target}}}, {{{value}}});' },

        // TAP
        { action: 'tap', targetType: this.ANY_TARGET, template: 'I.tap({{{target}}});' },
        { action: 'tap', default: true, template: 'I.tap({{{value}}});' },

        // WAIT
        { action: 'wait',  targetType: 'text', template: 'I.waitForText({{{target}}}, {{{value}}});' },
        { action: 'wait',  targetType: this.ANY_TARGET, template: 'I.waitForElement({{{target}}}, {{{value}}});' },
        { action: 'wait', default: true, template: 'I.wait({{{value}}});' }
    ];


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

    /**
     * Translates an abstract command to one or more CodeceptJS commands.
     * Returns an array of commands, since an abstract command can generate
     * multiple lines of test code.
     */
    public map( command: ATSCommand ): Array<string> {

        // console.log( 'command', command.action, command.values );

        let commands: Array<string> = [];

        let compareMapObj = obj =>
        {
            const sameAction = obj.action === command.action;
            if ( ! sameAction ) {
                return false;
            }

            const sameModifier = obj.modifier == command.modifier;

            if ( true === obj.default ) {
                return sameModifier;
            }

            const acceptsAny = this.ANY_TARGET === obj.targetType
                && Array.isArray( command.targets )
                && command.targets.length > 0;

            const sameTargetType = acceptsAny
                || ( Array.isArray( command.targetTypes )
                    && command.targetTypes.indexOf( obj.targetType ) >= 0 );

            const sameOptions = this.sameValues( obj.options, command.options );

            // console.log( sameTargetType, sameModifier, sameOptions );

            return sameTargetType && sameModifier && sameOptions;
        };

        let entry: CmdObj = this.commandMap.filter( compareMapObj )[0];

        let cmd;
        if ( ! entry ) {
            // console.log( 'NOT FOUND', command );
            cmd = this.generateNotAvailableMessage( command );
        } else {
            cmd = render(
                entry.template + ' // ({{{location.line}}},{{{location.column}}}){{#comment}} {{{comment}}}{{/comment}}',
                {
                    target   : this.parseTarget( command.targets[ 0 ] ),
                    value    : ! command.values ? '' : this.parseValue( command.values ),
                    location : command.location,
                    comment  : command.comment,
                    modifier : command.modifier,
                    options  : command.options
                }
            );
        }

        commands.push( cmd );

        return commands;
    }

    private parseTarget( target: any ): string {
        if ( ! target ) {
            return '';
        }
        if ( typeof target === 'string' ) {
            return `${this.parseTargetBySelector( target )}`;
        }
        let properties: Array<string> = Object.getOwnPropertyNames( target );
        if ( 1 === properties.length ) {
            return `${this.parseTargetBySelector( target[properties[0]] )}`;
        }
        return '{' + properties.map( element => {
            return `${element}: ${this.parseTargetBySelector( target[element] )}`;
        } ).join( ', ' ) + '}';
    }

    private parseTargetBySelector( targetSelector: string ): string {
        return targetSelector.charAt(0) === '@' ? `{name: "${targetSelector.substr(1)}"}` : `"${targetSelector}"`;
    }

    private parseValue( value: any ): string | number | Array<string | number> {
        if ( ! Array.isArray( value ) ) {
            return typeof value === 'string' ? `"${value}"`: value;
        }
        if ( 1 === value.length ) {
            return typeof value[ 0 ] === 'string' ? `"${value[0]}"`: value[0];
        }
        const joint = value.map( v => typeof v === 'string' ? `"${v}"` : v ).join( ', ' );

        return '[' + joint + ']';
    }

    private generateNotAvailableMessage( command: ATSCommand ): string {
        let message: string = '// Command not available. ';
        message += `Action: ${ ! command.action ? 'none' : command.action }. `;
        message += `Modifier: ${ ! command.modifier ? 'none' : command.modifier }. `;
        message += `Option: ${ ! command.options ? 'none' : command.options }. `;
        message += `Targets: ${ ! command.targets ? 'none' : command.targets }. `;
        message += `Target type: ${ ! command.targetTypes ? 'none' : command.targetTypes }. `;
        message += `Values: ${ ! command.values ? 'none' : command.values }. `;
        return message;
    }

}