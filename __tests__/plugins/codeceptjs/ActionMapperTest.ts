import { ATSCommand } from "../../../modules/testscript/AbstractTestScript";
import { ActionMapper } from "../../../plugins/codeceptjs/ActionMapper";

/**
* @author Matheus Eller Fagundes
*/
describe( 'ActionMapperTest', () => {

    let mapper: ActionMapper; // under test
    
    beforeEach(() => {
        mapper = new ActionMapper();
    });

    it( 'should translate append command', () => {
        let command: ATSCommand = {
            action: 'append',
            targets: ['#login'],
            values: ['steve_rogers']
        };
        expect(mapper.map(command)).toContainEqual("I.appendField('#login', 'steve_rogers');");
    } );

    it( 'should translate append command finding the target by name', () => {
        let command: ATSCommand = {
            action: 'append',
            targets: ['@login'],
            values: ['steve_rogers']
        };
        expect(mapper.map(command)).toContainEqual("I.appendField({name: 'login'}, 'steve_rogers');");
    } );

    it( 'should translate attach file command', () => {
        let command: ATSCommand = {
            action: 'attachFile',
            targets: ['#input_file'],
            values: ['my_file.txt']
        };
        expect(mapper.map(command)).toContainEqual("I.attachFile('#input_file', 'my_file.txt');");
    } );

    it( 'should translate check command', () => {
        let command: ATSCommand = {
            action: 'check',
            targets: ['#accept_privacy_policy']
        };
        expect(mapper.map(command)).toContainEqual("I.checkOption('#accept_privacy_policy');");
    } );

    it( 'should translate clear all cookies command', () => {
        let command: ATSCommand = {
            action: 'clear',
            targets: [],
            targetType: 'cookie'
        };
        expect(mapper.map(command)).toContainEqual("I.clearCookie();");
    } );

    it( 'should translate clear cookie command', () => {
        let command: ATSCommand = {
            action: 'clear',
            targets: ['preferences'],
            targetType: 'cookie'
        };
        expect(mapper.map(command)).toContainEqual("I.clearCookie('preferences');");
    } );

    it( 'should translate clear field command without target type', () => {
        let command: ATSCommand = {
            action: 'clear',
            targets: ['#login']
        };
        expect(mapper.map(command)).toContainEqual("I.clearField('#login');");
    } );

    it( 'should translate clear field command with target type', () => {
        let command: ATSCommand = {
            action: 'clear',
            targets: ['#login'],
            targetType: 'textbox'
        };
        expect(mapper.map(command)).toContainEqual("I.clearField('#login');");
    } );
    
    it( 'should translate click command', () => {
        let command: ATSCommand = {
            action: 'click',
            targets: ['#enter']
        };
        expect(mapper.map(command)).toContainEqual("I.click('#enter');");
    } );

    it( 'should translate click command with specific platform target', () => {
        let command: ATSCommand = {
            action: 'click',
            targets: [{
                web:'#enter' 
            }],
        };
        expect(mapper.map(command)).toContainEqual("I.click('#enter');");
    } );

    it( 'should translate click command with multiplatform targets', () => {
        let command: ATSCommand = {
            action: 'click',
            targets: [{
                web:'@enter' ,
                ios: '//UIAApplication[1]/UIAWindow[1]/UIAButton[1]',
                android: '//android.widget.Button'
            }],
        };
        expect(mapper.map(command)).toContainEqual("I.click({web: {name: 'enter'}, ios: '//UIAApplication[1]/UIAWindow[1]/UIAButton[1]', android: '//android.widget.Button'});");
    } );

    it( 'should translate double click command', () => {
        let command: ATSCommand = {
            action: 'doubleClick',
            targets: ['#enter']
        };
        expect(mapper.map(command)).toContainEqual("I.doubleClick('#enter');");
    } );

    it('should translate fill command', () => {
        let command: ATSCommand = {
            action: 'fill',
            targets: ['#login'],
            values: ['steve_rogers']
        };
        expect(mapper.map(command)).toContainEqual("I.fillField('#login', 'steve_rogers');");
    });

    it('should translate press command with one key', () => {
        let command: ATSCommand = {
            action: 'press',
            targets: [],
            values: ['Enter']
        };
        expect(mapper.map(command)).toContainEqual("I.pressKey('Enter');");
    });

    it('should translate press command with multiple keys', () => {
        let command: ATSCommand = {
            action: 'press',
            targets: [],
            values: ['Control', 'v']
        };
        expect(mapper.map(command)).toContainEqual("I.pressKey(['Control', 'v']);");
    });

    it('should translate see command', () => {
        let command: ATSCommand = {
            action: 'see',
            targets: ['Welcome Back!'],
        };
        expect(mapper.map(command)).toContainEqual("I.see('Welcome Back!');");
    });

    it('should translate see cookie command', () => {
        let command: ATSCommand = {
            action: 'see',
            targets: ['preferences'],
            targetType: 'cookie'
        };
        expect(mapper.map(command)).toContainEqual("I.seeCookie('preferences');");
    });

    it('should translate see url command', () => {
        let command: ATSCommand = {
            action: 'see',
            targets: ['http://www.mysite.com/login'],
            targetType: 'url'
        };
        expect(mapper.map(command)).toContainEqual("I.seeCurrentUrlEquals('http://www.mysite.com/login');");
    });

    it('should translate see element command', () => {
        let command: ATSCommand = {
            action: 'see',
            targets: ['#login'],
            targetType: 'button'
        };
        expect(mapper.map(command)).toContainEqual("I.seeElement('#login');");
    });

    it('should translate select command', () => {
        let command: ATSCommand = {
            action: 'select',
            targets: ['#os'],
            values: ['Ubuntu']
        };
        expect(mapper.map(command)).toContainEqual("I.selectOption('#os', 'Ubuntu');");
    });

    it('should translate select command with multiple values', () => {
        let command: ATSCommand = {
            action: 'select',
            targets: ['#os'],
            values: ['Ubuntu', 'Android']
        };
        expect(mapper.map(command)).toContainEqual("I.selectOption('#os', ['Ubuntu', 'Android']);");
    });

    it('should translate wait command', () => {
        let command: ATSCommand = {
            action: 'wait',
            targets: [],
            values: [2]
        };
        expect(mapper.map(command)).toContainEqual("I.wait(2);");
    });

    it('should translate wait for a ui element', () => {
        let command: ATSCommand = {
            action: 'wait',
            targets: ['#login'],
            targetType: 'button',
            values: [5]
        };
        expect(mapper.map(command)).toContainEqual("I.waitForElement('#login', 5);");
    });

    it('should translate wait for text', () => {
        let command: ATSCommand = {
            action: 'wait',
            targets: ['#welcome_message'],
            targetType: 'text',
            values: [5]
        };
        expect(mapper.map(command)).toContainEqual("I.waitForText('#welcome_message', 5);");
    });
    
} );
