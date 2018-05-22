"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ActionMapper_1 = require("../../../plugins/codeceptjs/ActionMapper");
/**
* @author Matheus Eller Fagundes
*/
describe('ActionMapperTest', () => {
    let mapper; // under test
    const comment = ' // (,)';
    beforeEach(() => {
        mapper = new ActionMapper_1.ActionMapper();
    });
    it('amIn', () => {
        let command = {
            action: 'amIn',
            values: ['/']
        };
        expect(mapper.map(command)).toContainEqual('I.amOnPage("/");' + comment);
    });
    it('append', () => {
        let command = {
            action: 'append',
            targets: ['#login'],
            values: ['steve_rogers']
        };
        expect(mapper.map(command)).toContainEqual('I.appendField("#login", "steve_rogers");' + comment);
    });
    it('append command finding the target by name', () => {
        let command = {
            action: 'append',
            targets: ['@login'],
            values: ['steve_rogers']
        };
        expect(mapper.map(command)).toContainEqual('I.appendField({name: "login"}, "steve_rogers");' + comment);
    });
    it('attach file', () => {
        let command = {
            action: 'attachFile',
            targets: ['#input_file'],
            values: ['my_file.txt']
        };
        expect(mapper.map(command)).toContainEqual('I.attachFile("#input_file", "my_file.txt");' + comment);
    });
    it('check', () => {
        let command = {
            action: 'check',
            targets: ['#accept_privacy_policy']
        };
        expect(mapper.map(command)).toContainEqual('I.checkOption("#accept_privacy_policy");' + comment);
    });
    it('clear all cookies', () => {
        let command = {
            action: 'clear',
            targets: [],
            targetTypes: ['cookie']
        };
        expect(mapper.map(command)).toContainEqual('I.clearCookie();' + comment);
    });
    it('clear cookie', () => {
        let command = {
            action: 'clear',
            targets: ['preferences'],
            targetTypes: ['cookie']
        };
        expect(mapper.map(command)).toContainEqual('I.clearCookie("preferences");' + comment);
    });
    it('clear field without target type', () => {
        let command = {
            action: 'clear',
            targets: ['#login']
        };
        expect(mapper.map(command)).toContainEqual('I.clearField("#login");' + comment);
    });
    it('clear field with target type', () => {
        let command = {
            action: 'clear',
            targets: ['#login'],
            targetTypes: ['textbox']
        };
        expect(mapper.map(command)).toContainEqual('I.clearField("#login");' + comment);
    });
    it('close current tab', () => {
        let command = {
            action: 'close',
            options: ['currentTab']
        };
        expect(mapper.map(command)).toContainEqual('I.closeCurrentTab();' + comment);
    });
    it('close other tabs', () => {
        let command = {
            action: 'close',
            options: ['otherTabs']
        };
        expect(mapper.map(command)).toContainEqual('I.closeOtherTabs();' + comment);
    });
    it('click', () => {
        let command = {
            action: 'click',
            targets: ['#enter']
        };
        expect(mapper.map(command)).toContainEqual('I.click("#enter");' + comment);
    });
    it('click with specific platform target', () => {
        let command = {
            action: 'click',
            targets: [{
                    web: '#enter'
                }],
        };
        expect(mapper.map(command)).toContainEqual('I.click({"web":"#enter"});' + comment);
    });
    it('click with multiplatform targets', () => {
        let command = {
            action: 'click',
            targets: [{
                    web: '@enter',
                    ios: '//UIAApplication[1]/UIAWindow[1]/UIAButton[1]',
                    android: '//android.widget.Button'
                }],
        };
        expect(mapper.map(command)).toContainEqual('I.click({"web":{"name":"enter"},"ios":"//UIAApplication[1]/UIAWindow[1]/UIAButton[1]","android":"//android.widget.Button"});' + comment);
    });
    describe('dont', () => {
        it('see', () => {
            let command = {
                action: 'see',
                values: ['Welcome Back!'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSee("Welcome Back!");' + comment);
        });
        it('see checkbox is checked', () => {
            let command = {
                action: 'see',
                targets: ['foo'],
                targetTypes: ['checkbox'],
                options: ['checked'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeCheckboxIsChecked("foo");' + comment);
        });
        it('see cookie', () => {
            let command = {
                action: 'see',
                targetTypes: ['cookie'],
                values: ['foo'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeCookie("foo");' + comment);
        });
        it('see url', () => {
            let command = {
                action: 'see',
                targets: ['http://www.mysite.com/login'],
                targetTypes: ['url'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeCurrentUrlEquals("http://www.mysite.com/login");' + comment);
        });
        it('see the url with', () => {
            let command = {
                action: 'see',
                options: ['with', 'url'],
                values: ['/login'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeInCurrentUrl("/login");' + comment);
        });
        it('see in the url', () => {
            let command = {
                action: 'see',
                options: ['inside'],
                targetTypes: ['url'],
                values: ['/login'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeInCurrentUrl("/login");' + comment);
        });
        it('see in current url', () => {
            let command = {
                action: 'see',
                options: ['with'],
                targetTypes: ['url'],
                values: ['/login'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeInCurrentUrl("/login");' + comment);
        });
        it('see element', () => {
            let command = {
                action: 'see',
                targets: ['#login'],
                targetTypes: ['button'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeElement("#login");' + comment);
        });
        it('see in title - in options', () => {
            let command = {
                action: 'see',
                options: ['with', 'title'],
                values: ['Hello'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeInTitle("Hello");' + comment);
        });
        it('see in title - option "with" and target type "title"', () => {
            let command = {
                action: 'see',
                options: ['with'],
                targetTypes: ['title'],
                values: ['Hello'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeInTitle("Hello");' + comment);
        });
        it('see in title - option "inside" and target type "title"', () => {
            let command = {
                action: 'see',
                options: ['inside'],
                targetTypes: ['title'],
                values: ['Hello'],
                modifier: 'not'
            };
            expect(mapper.map(command)).toContainEqual('I.dontSeeInTitle("Hello");' + comment);
        });
    });
    it('double click', () => {
        let command = {
            action: 'doubleClick',
            targets: ['#enter']
        };
        expect(mapper.map(command)).toContainEqual('I.doubleClick("#enter");' + comment);
    });
    it('drag', () => {
        let command = {
            action: 'drag',
            targets: ['#foo', '#bar']
        };
        expect(mapper.map(command)).toContainEqual('I.dragAndDrop("#foo", "#bar");' + comment);
    });
    it('fill', () => {
        let command = {
            action: 'fill',
            targets: ['#login'],
            values: ['steve_rogers']
        };
        expect(mapper.map(command)).toContainEqual('I.fillField("#login", "steve_rogers");' + comment);
    });
    it('move cursor', () => {
        let command = {
            action: 'move',
            targets: ['#foo'],
            options: ['cursor']
        };
        expect(mapper.map(command)).toContainEqual('I.moveCursorTo("#foo");' + comment);
    });
    it('press single key', () => {
        let command = {
            action: 'press',
            targets: [],
            values: ['Enter']
        };
        expect(mapper.map(command)).toContainEqual('I.pressKey("Enter");' + comment);
    });
    it('press multiple keys', () => {
        let command = {
            action: 'press',
            targets: [],
            values: ['Control', 'v']
        };
        expect(mapper.map(command)).toContainEqual('I.pressKey(["Control", "v"]);' + comment);
    });
    it('right click', () => {
        let command = {
            action: 'rightClick',
            targets: ['#foo']
        };
        expect(mapper.map(command)).toContainEqual('I.rightClick("#foo");' + comment);
    });
    describe('see', () => {
        it('see', () => {
            let command = {
                action: 'see',
                values: ['Welcome Back!']
            };
            expect(mapper.map(command)).toContainEqual('I.see("Welcome Back!");' + comment);
        });
        it('see checkbox is checked', () => {
            let command = {
                action: 'see',
                targets: ['foo'],
                targetTypes: ['checkbox'],
                options: ['checked']
            };
            expect(mapper.map(command)).toContainEqual('I.seeCheckboxIsChecked("foo");' + comment);
        });
        it('see cookie', () => {
            let command = {
                action: 'see',
                targetTypes: ['cookie'],
                values: ['foo'],
            };
            expect(mapper.map(command)).toContainEqual('I.seeCookie("foo");' + comment);
        });
        it('see url', () => {
            let command = {
                action: 'see',
                targets: ['http://www.mysite.com/login'],
                targetTypes: ['url']
            };
            expect(mapper.map(command)).toContainEqual('I.seeCurrentUrlEquals("http://www.mysite.com/login");' + comment);
        });
        it('see the url with - in options', () => {
            let command = {
                action: 'see',
                options: ['with', 'url'],
                values: ['/login']
            };
            expect(mapper.map(command)).toContainEqual('I.seeInCurrentUrl("/login");' + comment);
        });
        it('see the url with - option and target type', () => {
            let command = {
                action: 'see',
                options: ['with'],
                targetTypes: ['url'],
                values: ['/login']
            };
            expect(mapper.map(command)).toContainEqual('I.seeInCurrentUrl("/login");' + comment);
        });
        it('see in the url', () => {
            let command = {
                action: 'see',
                options: ['inside'],
                targetTypes: ['url'],
                values: ['/login']
            };
            expect(mapper.map(command)).toContainEqual('I.seeInCurrentUrl("/login");' + comment);
        });
        it('see element', () => {
            let command = {
                action: 'see',
                targets: ['#login'],
                targetTypes: ['button']
            };
            expect(mapper.map(command)).toContainEqual('I.seeElement("#login");' + comment);
        });
        it('see in field with textbox', () => {
            let command = {
                action: 'see',
                targets: ['#foo'],
                targetTypes: ['textbox'],
                values: ["bar"]
            };
            expect(mapper.map(command)).toContainEqual('I.seeInField("#foo", "bar");' + comment);
        });
        it('see in field with textarea', () => {
            let command = {
                action: 'see',
                targets: ['#foo'],
                targetTypes: ['textarea'],
                values: ["bar"]
            };
            expect(mapper.map(command)).toContainEqual('I.seeInField("#foo", "bar");' + comment);
        });
        it('see in title - in options', () => {
            let command = {
                action: 'see',
                options: ['with', 'title'],
                values: ['Hello']
            };
            expect(mapper.map(command)).toContainEqual('I.seeInTitle("Hello");' + comment);
        });
        it('see in title - option "with" and target type "title"', () => {
            let command = {
                action: 'see',
                options: ['with'],
                targetTypes: ['title'],
                values: ['Hello']
            };
            expect(mapper.map(command)).toContainEqual('I.seeInTitle("Hello");' + comment);
        });
        it('see in title - option "inside" and target type "title"', () => {
            let command = {
                action: 'see',
                options: ['inside'],
                targetTypes: ['title'],
                values: ['Hello']
            };
            expect(mapper.map(command)).toContainEqual('I.seeInTitle("Hello");' + comment);
        });
    });
    it('save screenshot', () => {
        let command = {
            action: 'saveScreenshot',
            values: ['foo.png']
        };
        expect(mapper.map(command)).toContainEqual('I.saveScreenshot("foo.png");' + comment);
    });
    it('select', () => {
        let command = {
            action: 'select',
            targets: ['#os'],
            values: ['Ubuntu']
        };
        expect(mapper.map(command)).toContainEqual('I.selectOption("#os", "Ubuntu");' + comment);
    });
    it('select with multiple values', () => {
        let command = {
            action: 'select',
            targets: ['#os'],
            values: ['Ubuntu', 'Android']
        };
        expect(mapper.map(command)).toContainEqual('I.selectOption("#os", ["Ubuntu", "Android"]);' + comment);
    });
    it('uncheck', () => {
        let command = {
            action: 'uncheck',
            targets: ['#os']
        };
        expect(mapper.map(command)).toContainEqual('I.uncheckOption("#os");' + comment);
    });
    it('wait', () => {
        let command = {
            action: 'wait',
            targets: [],
            values: [2]
        };
        expect(mapper.map(command)).toContainEqual('I.wait(2);' + comment);
    });
    it('wait with a number as string', () => {
        let command = {
            action: 'wait',
            targets: [],
            values: ['2']
        };
        expect(mapper.map(command)).toContainEqual('I.wait(2);' + comment);
    });
    it('wait for a ui element', () => {
        let command = {
            action: 'wait',
            targets: ['#login'],
            targetTypes: ['button'],
            values: [5]
        };
        expect(mapper.map(command)).toContainEqual('I.waitForElement("#login", 5);' + comment);
    });
    it('wait for text', () => {
        let command = {
            action: 'wait',
            values: ['Welcome!', 5]
        };
        expect(mapper.map(command)).toContainEqual('I.waitForText("Welcome!", 5);' + comment);
    });
});
//# sourceMappingURL=ActionMapperTest.js.map