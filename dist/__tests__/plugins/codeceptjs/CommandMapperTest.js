"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMapper_1 = require("../../../plugins/codeceptjs/CommandMapper");
/**
 * @author Thiago Delgado Pinto
 */
describe('CommandMapperTest', () => {
    let cm; // under test
    const comment = ' // (,)';
    beforeEach(() => {
        cm = new CommandMapper_1.CommandMapper();
    });
    afterEach(() => {
        cm = null;
    });
    describe('amOn', () => {
        it('value', () => {
            let cmd = {
                action: 'amOn',
                values: ['/foo']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.amOnPage("/foo");' + comment);
        });
        it('targetType url, target', () => {
            let cmd = {
                action: 'amOn',
                targetTypes: ['url'],
                targets: ['/foo']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.amOnPage("/foo");' + comment);
        });
    });
    describe('append', () => {
        it('target, value', () => {
            let cmd = {
                action: 'append',
                targets: ['foo'],
                values: ['bar']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.appendField("foo", "bar");' + comment);
        });
    });
    describe('attachFile', () => {
        it('target, value', () => {
            let cmd = {
                action: 'attachFile',
                targets: ['foo'],
                values: ['bar']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.attachFile("foo", "bar");' + comment);
        });
    });
    describe('check', () => {
        it('value', () => {
            let cmd = {
                action: 'check',
                values: ['foo']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.checkOption("foo");' + comment);
        });
        it('target', () => {
            let cmd = {
                action: 'check',
                targets: ['foo'],
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.checkOption("foo");' + comment);
        });
    });
    describe('clear', () => {
        describe('clearField', () => {
            it('target', () => {
                let cmd = {
                    action: 'clear',
                    targets: ['foo'],
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.clearField("foo");' + comment);
            });
        });
        describe('clearCookie', () => {
            it('targeType cookie, target', () => {
                let cmd = {
                    action: 'clear',
                    targetTypes: ['cookie'],
                    targets: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.clearCookie("foo");' + comment);
            });
        });
    });
    describe('click', () => {
        it('value', () => {
            let cmd = {
                action: 'click',
                values: ['foo']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.click("foo");' + comment);
        });
        it('target', () => {
            let cmd = {
                action: 'click',
                targets: ['foo'],
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.click("foo");' + comment);
        });
    });
    describe('close', () => {
        describe('currentTab', () => {
            it('targetType', () => {
                let cmd = {
                    action: 'close',
                    targetTypes: ['currentTab']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.closeCurrentTab();' + comment);
            });
            it('options', () => {
                let cmd = {
                    action: 'close',
                    options: ['currentTab']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.closeCurrentTab();' + comment);
            });
        });
        describe('otherTabs', () => {
            it('targetType', () => {
                let cmd = {
                    action: 'close',
                    targetTypes: ['otherTabs']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.closeOtherTabs();' + comment);
            });
            it('options', () => {
                let cmd = {
                    action: 'close',
                    options: ['otherTabs']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.closeOtherTabs();' + comment);
            });
        });
    });
    describe('doubleClick', () => {
        it('value', () => {
            let cmd = {
                action: 'doubleClick',
                values: ['foo']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.doubleClick("foo");' + comment);
        });
        it('target', () => {
            let cmd = {
                action: 'doubleClick',
                targets: ['foo'],
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.doubleClick("foo");' + comment);
        });
    });
    describe('drag', () => {
        it('two targets', () => {
            let cmd = {
                action: 'drag',
                targets: ['foo', 'bar'],
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.dragAndDrop("foo", "bar");' + comment);
        });
    });
    describe('fill', () => {
        it('target, value', () => {
            let cmd = {
                action: 'fill',
                targets: ['foo'],
                values: ['bar']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.fillField("foo", "bar");' + comment);
        });
    });
    describe('move', () => {
        describe('moveCursorTo', () => {
            it('target, options', () => {
                let cmd = {
                    action: 'move',
                    targets: ['foo'],
                    options: ['cursor']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.moveCursorTo("foo");' + comment);
            });
        });
    });
    describe('press', () => {
        it('value', () => {
            let cmd = {
                action: 'press',
                values: ['Enter'],
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.pressKey("Enter");' + comment);
        });
        it('array', () => {
            let cmd = {
                action: 'press',
                values: ['Ctrl', 'S'],
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.pressKey(["Ctrl", "S"]);' + comment);
        });
    });
    describe('rightClick', () => {
        it('value', () => {
            let cmd = {
                action: 'rightClick',
                values: ['foo']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.rightClick("foo");' + comment);
        });
        it('target', () => {
            let cmd = {
                action: 'rightClick',
                targets: ['foo'],
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.rightClick("foo");' + comment);
        });
    });
    describe('saveScreenshot', () => {
        it('value', () => {
            let cmd = {
                action: 'saveScreenshot',
                values: ['foo']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.saveScreenshot("foo");' + comment);
        });
    });
    describe('see', () => {
        describe('seeInField', () => {
            it('targetType textbox, value, field', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['textbox'],
                    targets: ['foo'],
                    values: ['bar'],
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeInField("foo", "bar");' + comment);
            });
            it('targetType textarea, value, field', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['textarea'],
                    targets: ['foo'],
                    values: ['bar'],
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeInField("foo", "bar");' + comment);
            });
        });
        describe('dontSeeInField', () => {
            it('targetTypes textbox, target, value, modifier', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['textbox'],
                    targets: ['foo'],
                    values: ['bar'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeInField("foo", "bar");' + comment);
            });
            it('targetType textarea, target, value, modifier', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['textarea'],
                    targets: ['foo'],
                    values: ['bar'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeInField("foo", "bar");' + comment);
            });
        });
        describe('seeCheckboxIsChecked', () => {
            it('targetType checkbox, value, value', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['checkbox'],
                    options: ['checked'],
                    targets: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeCheckboxIsChecked("foo");' + comment);
            });
        });
        describe('dontSeeCheckboxIsChecked', () => {
            it('targetType checkbox, value, value, modifier', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['checkbox'],
                    options: ['checked'],
                    targets: ['foo'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeCheckboxIsChecked("foo");' + comment);
            });
        });
        describe('seeCookie', () => {
            it('targetType cookie, value', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['cookie'],
                    values: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeCookie("foo");' + comment);
            });
            it('option cookie, value', () => {
                let cmd = {
                    action: 'see',
                    options: ['cookie'],
                    values: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeCookie("foo");' + comment);
            });
        });
        describe('dontSeeCookie', () => {
            it('targetType cookie, value, modifier', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['cookie'],
                    values: ['foo'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeCookie("foo");' + comment);
            });
            it('option cookie, value, modifier', () => {
                let cmd = {
                    action: 'see',
                    options: ['cookie'],
                    values: ['foo'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeCookie("foo");' + comment);
            });
        });
        describe('seeInTitle', () => {
            it('targetType title, value', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['title'],
                    values: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeInTitle("foo");' + comment);
            });
            it('option title, value', () => {
                let cmd = {
                    action: 'see',
                    options: ['title'],
                    values: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeInTitle("foo");' + comment);
            });
        });
        describe('dontSeeInTitle', () => {
            it('targetType title, value, modifier', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['title'],
                    values: ['foo'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeInTitle("foo");' + comment);
            });
            it('option title, value, modifier', () => {
                let cmd = {
                    action: 'see',
                    options: ['title'],
                    values: ['foo'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeInTitle("foo");' + comment);
            });
        });
        describe('seeInCurrentUrl', () => {
            it('targetType url, value', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['url'],
                    values: ['/foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeInCurrentUrl("/foo");' + comment);
            });
            it('option url, value', () => {
                let cmd = {
                    action: 'see',
                    options: ['url'],
                    values: ['/foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeInCurrentUrl("/foo");' + comment);
            });
        });
        describe('dontSeeInCurrentUrl', () => {
            it('targetType url, value, modifier', () => {
                let cmd = {
                    action: 'see',
                    targetTypes: ['url'],
                    values: ['/foo'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeInCurrentUrl("/foo");' + comment);
            });
            it('option url, value, modifier', () => {
                let cmd = {
                    action: 'see',
                    options: ['url'],
                    values: ['/foo'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeInCurrentUrl("/foo");' + comment);
            });
        });
        describe('seeElement', () => {
            it('target', () => {
                let cmd = {
                    action: 'see',
                    targets: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.seeElement("foo");' + comment);
            });
        });
        describe('dontSeeElement', () => {
            it('target, modifier', () => {
                let cmd = {
                    action: 'see',
                    targets: ['foo'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSeeElement("foo");' + comment);
            });
        });
        describe('see', () => {
            it('value', () => {
                let cmd = {
                    action: 'see',
                    values: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.see("foo");' + comment);
            });
        });
        describe('dontSee', () => {
            it('value, modifier', () => {
                let cmd = {
                    action: 'see',
                    values: ['foo'],
                    modifier: 'not'
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.dontSee("foo");' + comment);
            });
        });
    });
    describe('select', () => {
        it('works with one target and one value', () => {
            let cmd = {
                action: 'select',
                targets: ['foo'],
                values: ['bar']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.selectOption("foo", "bar");' + comment);
        });
    });
    describe('tap', () => {
        it('value', () => {
            let cmd = {
                action: 'tap',
                values: ['foo']
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.tap("foo");' + comment);
        });
        it('target', () => {
            let cmd = {
                action: 'tap',
                targets: ['foo'],
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.tap("foo");' + comment);
        });
    });
    describe('uncheck', () => {
        it('target', () => {
            let cmd = {
                action: 'uncheck',
                targets: ['foo'],
            };
            const r = cm.map(cmd);
            expect(r).toContainEqual('I.uncheckOption("foo");' + comment);
        });
    });
    describe('wait', () => {
        describe('waitUrlEquals', () => {
            it('targetType, value', () => {
                let cmd = {
                    action: 'wait',
                    targetTypes: ['url'],
                    values: ['/foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.waitUrlEquals("/foo");' + comment);
            });
            it('targetType, value, number', () => {
                let cmd = {
                    action: 'wait',
                    targetTypes: ['url'],
                    values: ['/foo', '3']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.waitUrlEquals("/foo", 3);' + comment);
            });
        });
        describe('waitForVisible', () => {
            it('option, target', () => {
                let cmd = {
                    action: 'wait',
                    options: ['visible'],
                    targets: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.waitForVisible("foo");' + comment);
            });
        });
        describe('waitForInvisible', () => {
            it('option, target', () => {
                let cmd = {
                    action: 'wait',
                    options: ['invisible'],
                    targets: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.waitForInvisible("foo");' + comment);
            });
        });
        describe('waitForEnabled', () => {
            it('option, target', () => {
                let cmd = {
                    action: 'wait',
                    options: ['enabled'],
                    targets: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.waitForEnabled("foo");' + comment);
            });
        });
        describe('waitForElement', () => {
            it('target', () => {
                let cmd = {
                    action: 'wait',
                    targets: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.waitForElement("foo");' + comment);
            });
            it('target, number', () => {
                let cmd = {
                    action: 'wait',
                    targets: ['foo'],
                    values: ['3']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.waitForElement("foo", 3);' + comment);
            });
        });
        describe('waitForText', () => {
            it('targetType text, target', () => {
                let cmd = {
                    action: 'wait',
                    targetTypes: ['text'],
                    targets: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.waitForText("foo");' + comment);
            });
            it('option text, value', () => {
                let cmd = {
                    action: 'wait',
                    options: ['text'],
                    values: ['foo']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.waitForText("foo");' + comment);
            });
        });
        describe('wait', () => {
            it('number', () => {
                let cmd = {
                    action: 'wait',
                    values: ['3']
                };
                const r = cm.map(cmd);
                expect(r).toContainEqual('I.wait(3);' + comment);
            });
        });
    });
});
//# sourceMappingURL=CommandMapperTest.js.map