import { ATSCommand } from '../../../modules/testscript/AbstractTestScript';
import { ActionMapper } from '../../../plugins/codeceptjs/ActionMapper';

/**
* @author Matheus Eller Fagundes
*/
describe( 'ActionMapperTest', () => {

    let mapper: ActionMapper; // under test

    const comment = ' // (,)';

    beforeEach(() => {
        mapper = new ActionMapper();
    });

    it( 'append', () => {
        let command: ATSCommand = {
            action: 'append',
            targets: ['#login'],
            values: ['steve_rogers']
        };
        expect(mapper.map(command)).toContainEqual('I.appendField("#login", "steve_rogers");' + comment);
    } );

    it( 'append command finding the target by name', () => {
        let command: ATSCommand = {
            action: 'append',
            targets: ['@login'],
            values: ['steve_rogers']
        };
        expect(mapper.map(command)).toContainEqual('I.appendField({name: "login"}, "steve_rogers");' + comment );
    } );

    it( 'attach file', () => {
        let command: ATSCommand = {
            action: 'attachFile',
            targets: ['#input_file'],
            values: ['my_file.txt']
        };
        expect(mapper.map(command)).toContainEqual('I.attachFile("#input_file", "my_file.txt");' + comment );
    } );

    it( 'check', () => {
        let command: ATSCommand = {
            action: 'check',
            targets: ['#accept_privacy_policy']
        };
        expect(mapper.map(command)).toContainEqual('I.checkOption("#accept_privacy_policy");' + comment );
    } );

    it( 'clear all cookies', () => {
        let command: ATSCommand = {
            action: 'clear',
            targets: [],
            targetTypes: [ 'cookie' ]
        };
        expect(mapper.map(command)).toContainEqual('I.clearCookie();' + comment );
    } );

    it( 'clear cookie', () => {
        let command: ATSCommand = {
            action: 'clear',
            targets: ['preferences'],
            targetTypes: [ 'cookie' ]
        };
        expect(mapper.map(command)).toContainEqual('I.clearCookie("preferences");' + comment );
    } );

    it( 'clear field without target type', () => {
        let command: ATSCommand = {
            action: 'clear',
            targets: ['#login']
        };
        expect(mapper.map(command)).toContainEqual('I.clearField("#login");' + comment );
    } );

    it( 'clear field with target type', () => {
        let command: ATSCommand = {
            action: 'clear',
            targets: ['#login'],
            targetTypes: [ 'textbox' ]
        };
        expect(mapper.map(command)).toContainEqual('I.clearField("#login");' + comment );
    } );

    it( 'click', () => {
        let command: ATSCommand = {
            action: 'click',
            targets: ['#enter']
        };
        expect(mapper.map(command)).toContainEqual('I.click("#enter");' + comment );
    } );

    it( 'click with specific platform target', () => {
        let command: ATSCommand = {
            action: 'click',
            targets: [{
                web: '#enter'
            }],
        };
        expect(mapper.map(command)).toContainEqual('I.click({"web":"#enter"});' + comment );
    } );

    it( 'click with multiplatform targets', () => {
        let command: ATSCommand = {
            action: 'click',
            targets: [{
                web:'@enter' ,
                ios: '//UIAApplication[1]/UIAWindow[1]/UIAButton[1]',
                android: '//android.widget.Button'
            }],
        };
        expect(mapper.map(command)).toContainEqual(
            'I.click({"web":{"name":"enter"},"ios":"//UIAApplication[1]/UIAWindow[1]/UIAButton[1]","android":"//android.widget.Button"});' + comment );
    } );

    it( 'double click', () => {
        let command: ATSCommand = {
            action: 'doubleClick',
            targets: ['#enter']
        };
        expect(mapper.map(command)).toContainEqual('I.doubleClick("#enter");' + comment );
    } );

    it( 'fill', () => {
        let command: ATSCommand = {
            action: 'fill',
            targets: ['#login'],
            values: ['steve_rogers']
        };
        expect(mapper.map(command)).toContainEqual('I.fillField("#login", "steve_rogers");' + comment );
    });

    it( 'press with one key', () => {
        let command: ATSCommand = {
            action: 'press',
            targets: [],
            values: ['Enter']
        };
        expect(mapper.map(command)).toContainEqual('I.pressKey("Enter");' + comment );
    });

    it( 'press with multiple keys', () => {
        let command: ATSCommand = {
            action: 'press',
            targets: [],
            values: ['Control', 'v']
        };
        expect(mapper.map(command)).toContainEqual('I.pressKey(["Control", "v"]);' + comment);
    });

    it( 'see', () => {
        let command: ATSCommand = {
            action: 'see',
            values: ['Welcome Back!']
        };
        expect(mapper.map(command)).toContainEqual('I.see("Welcome Back!");' + comment );
    });

    it( 'see cookie', () => {
        let command: ATSCommand = {
            action: 'see',
            targets: ['preferences'],
            targetTypes: [ 'cookie' ]
        };
        expect(mapper.map(command)).toContainEqual('I.seeCookie("preferences");' + comment );
    });

    it( 'see url', () => {
        let command: ATSCommand = {
            action: 'see',
            targets: ['http://www.mysite.com/login'],
            targetTypes: [ 'url' ]
        };
        expect(mapper.map(command)).toContainEqual('I.seeCurrentUrlEquals("http://www.mysite.com/login");' + comment );
    });

    it( 'see element', () => {
        let command: ATSCommand = {
            action: 'see',
            targets: ['#login'],
            targetTypes: [ 'button' ]
        };
        expect(mapper.map(command)).toContainEqual('I.seeElement("#login");' + comment );
    });

    it( 'select', () => {
        let command: ATSCommand = {
            action: 'select',
            targets: ['#os'],
            values: ['Ubuntu']
        };
        expect(mapper.map(command)).toContainEqual('I.selectOption("#os", "Ubuntu");' + comment );
    });

    it( 'select with multiple values', () => {
        let command: ATSCommand = {
            action: 'select',
            targets: ['#os'],
            values: ['Ubuntu', 'Android']
        };
        expect(mapper.map(command)).toContainEqual('I.selectOption("#os", ["Ubuntu", "Android"]);' + comment);
    });

    it( 'wait', () => {
        let command: ATSCommand = {
            action: 'wait',
            targets: [],
            values: [2]
        };
        expect(mapper.map(command)).toContainEqual('I.wait(2);' + comment);
    });

    it( 'wait for a ui element', () => {
        let command: ATSCommand = {
            action: 'wait',
            targets: ['#login'],
            targetTypes: [ 'button' ],
            values: [5]
        };
        expect(mapper.map(command)).toContainEqual('I.waitForElement("#login", 5);' + comment);
    });

    it( 'wait for text', () => {
        let command: ATSCommand = {
            action: 'wait',
            values: [ 'Welcome!', 5 ]
        };
        expect(mapper.map(command)).toContainEqual('I.waitForText("Welcome!", 5);' + comment);
    });

} );
