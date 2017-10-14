import { ATSCommand } from "../../modules/ts/AbstractTestScript";
import { render } from "mustache";

/**
 * Translates abstract test commands to CodeceptJS commands.
 * 
 * @author Matheus Eller Fagundes
 */
export class ActionMapper {

    private commandMap: Array<{ action: string, targetType?: string, default? :boolean, template: string }> = [
        //Append
        { action: 'append', default: true, template: 'I.appendField({{{target}}}, {{{value}}});' },

        //Attach
        { action: 'attachFile', default: true,  template: 'I.attachFile({{{target}}}, {{{value}}});' },

        //Check
        { action: 'check', default: true, template: 'I.checkOption({{{target}}});' },

        //Clear
        { action: 'clear', targetType: 'cookie', template: 'I.clearCookie({{{target}}});' },
        { action: 'clear', default: true, template: 'I.clearField({{{target}}});' },

        //Click
        { action: 'click', default: true, template: 'I.click({{{target}}});' },

        //Double click
        { action: 'doubleClick', default: true, template: 'I.doubleClick({{{target}}});' },

        //Fill
        { action: 'fill', default: true, template: 'I.fillField({{{target}}}, {{{value}}});' },

        //Press
        { action: 'press', default: true, template: 'I.pressKey({{{value}}});' },

        //See
        { action: 'see',  targetType: 'cookie', template: 'I.seeCookie({{{target}}});' },
        { action: 'see',  targetType: 'url', template: 'I.seeCurrentUrlEquals({{{target}}});' },
        { action: 'see',  targetType: 'button', template: 'I.seeElement({{{target}}});' },
        { action: 'see',  targetType: 'checkbox', template: 'I.seeElement({{{target}}});' },
        { action: 'see',  targetType: 'label', template: 'I.seeElement({{{target}}});' },
        { action: 'see',  targetType: 'select', template: 'I.seeElement({{{target}}});' },
        { action: 'see',  targetType: 'textbox', template: 'I.seeElement({{{target}}});' },
        { action: 'see',  targetType: 'textarea', template: 'I.seeElement({{{target}}});' },
        { action: 'see',  default: true, template: 'I.see({{{target}}});' },

        //Select
        { action: 'select', default: true, template: 'I.selectOption({{{target}}}, {{{value}}});' },

        //Wait
        { action: 'wait',  targetType: 'button', template: 'I.waitForElement({{{target}}}, {{{value}}});' },
        { action: 'wait',  targetType: 'checkbox', template: 'I.waitForElement({{{target}}}, {{{value}}});' },
        { action: 'wait',  targetType: 'label', template: 'I.waitForElement({{{target}}}, {{{value}}});' },
        { action: 'wait',  targetType: 'select', template: 'I.waitForElement({{{target}}}, {{{value}}});' },
        { action: 'wait',  targetType: 'textbox', template: 'I.waitForElement({{{target}}}, {{{value}}});' },
        { action: 'wait',  targetType: 'textarea', template: 'I.waitForElement({{{target}}}, {{{value}}});' },
        { action: 'wait',  targetType: 'text', template: 'I.waitForText({{{target}}}, {{{value}}});' },
        { action: 'wait', default: true, template: 'I.wait({{{value}}});' }
    ];
    
    /**
     * Translates an abstract command to one or more CodeceptJS commands. Returns an array of commands,
     * since an abstract command can generate multiple lines of test code.
     */
    public map( command: ATSCommand ): Array<string> {
        let commands: Array<string> = [];

        let entry: { action: string, template: string } = this.commandMap.filter( mapEntry => {
            let isActionEquals = mapEntry.action === command.action;
            let isTargetTypeEquals = mapEntry.targetType === command.targetType || mapEntry.default;
            return isActionEquals && isTargetTypeEquals;
        })[0];

        commands.push( entry ? render( entry.template, {
            target: this.parseTarget(command.targets[0]),
            value: command.values ?  this.parseValue(command.values) : ''
        } ) : this.generateNotAvailableMessage( command ) );
        return commands;
    }

    private parseTarget( target: any ): string {
        if ( target == null )
            return '';
        if ( typeof target === 'string' )
            return `${this.parseTargetBySelector( target )}`;
        let properties: Array<string> = Object.getOwnPropertyNames( target );
        if ( properties.length === 1 )
            return `${this.parseTargetBySelector( target[properties[0]] )}`;
        return '{' + properties.map(element =>{
            return `${element}: ${this.parseTargetBySelector( target[element] )}`;
        }).join( ', ' ) + '}';
    }

    private parseTargetBySelector( targetSelector: string ): string {
        return targetSelector.charAt(0) === '@' ? `{name: '${targetSelector.substr(1)}'}` : `'${targetSelector}'`;
    }

    private parseValue( value: any ): string | number | Array<string | number> {
        if ( !Array.isArray(value) )
            return typeof value == 'string' ? `'${value}'`: value;
        if (value.length == 1)
            return typeof value[0] == 'string' ? `'${value[0]}'`: value[0];
        return `[${value.map((v: any) => typeof v == 'string' ? `'${v}'` : v).join(', ')}]`;
    }

    private generateNotAvailableMessage( command: ATSCommand ): string {
        let message: string = '// Command not available. ';
        message += `Action: ${ command.action ? command.action : 'none' }. `;
        message += `Modifier: ${ command.modifier ? command.modifier : 'none' }. `;
        message += `Option: ${ command.options ? command.options : 'none' }. `;
        message += `Targets: ${ command.targets ? command.targets : 'none' }. `;
        message += `Target type: ${ command.targetType ? command.targetType : 'none' }. `;
        message += `Values: ${ command.values ? command.values : 'none' }. `;
        return message;
    }

}