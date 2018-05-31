import { CommandMapper } from "../../../plugins/codeceptjs/CommandMapper";
import { ATSCommand } from "../../../modules/testscript/AbstractTestScript";
import { CODECEPTJS_COMMANDS } from "../../../plugins/codeceptjs/Commands";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'CommandMapperTest', () => {

    let cm: CommandMapper; // under test

    const comment = ' // (,)';

    beforeEach( () => {
        cm = new CommandMapper( CODECEPTJS_COMMANDS );
    } );

    afterEach( () => {
        cm = null;
    } );

    describe( 'amOn', () => {

        it( 'value', () => {
            let cmd: ATSCommand = {
                action: 'amOn',
                values: [ '/foo' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.amOnPage("/foo");' + comment );
        } );

        it( 'targetType url, target', () => {
            let cmd: ATSCommand = {
                action: 'amOn',
                targetTypes: [ 'url' ],
                targets: [ '/foo' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.amOnPage("/foo");' + comment );
        } );

    } );

    describe( 'append', () => {
        it( 'target, value', () => {
            let cmd: ATSCommand = {
                action: 'append',
                targets: [ 'foo' ],
                values: [ 'bar' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.appendField("foo", "bar");' + comment );
        } );
    } );

    describe( 'attachFile', () => {
        it( 'target, value', () => {
            let cmd: ATSCommand = {
                action: 'attachFile',
                targets: [ 'foo' ],
                values: [ 'bar' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.attachFile("foo", "bar");' + comment );
        } );
    } );

    describe( 'check', () => {

        it( 'value', () => {
            let cmd: ATSCommand = {
                action: 'check',
                values: [ 'foo' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.checkOption("foo");' + comment );
        } );

        it( 'target', () => {
            let cmd: ATSCommand = {
                action: 'check',
                targets: [ 'foo' ],
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.checkOption("foo");' + comment );
        } );

    } );

    describe( 'clear', () => {

        describe( 'clearField', () => {

            it( 'target', () => {
                let cmd: ATSCommand = {
                    action: 'clear',
                    targets: [ 'foo' ],
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.clearField("foo");' + comment );
            } );

        } );

        describe( 'clearCookie', () => {

            it( 'targeType cookie, target', () => {
                let cmd: ATSCommand = {
                    action: 'clear',
                    targetTypes: [ 'cookie' ],
                    targets: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.clearCookie("foo");' + comment );
            } );

        } );

    } );

    describe( 'click', () => {

        it( 'value', () => {
            let cmd: ATSCommand = {
                action: 'click',
                values: [ 'foo' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.click("foo");' + comment );
        } );

        it( 'target', () => {
            let cmd: ATSCommand = {
                action: 'click',
                targets: [ 'foo' ],
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.click("foo");' + comment );
        } );

    } );

    describe( 'close', () => {

        describe( 'app', () => {

            it( 'options', () => {
                let cmd: ATSCommand = {
                    action: 'close',
                    options: [ 'app' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.closeApp();' + comment );
            } );

        } );

        describe( 'currentTab', () => {

            it( 'targetType', () => {
                let cmd: ATSCommand = {
                    action: 'close',
                    targetTypes: [ 'currentTab' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.closeCurrentTab();' + comment );
            } );

            it( 'options', () => {
                let cmd: ATSCommand = {
                    action: 'close',
                    options: [ 'currentTab' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.closeCurrentTab();' + comment );
            } );

        } );

        describe( 'otherTabs', () => {

            it( 'targetType', () => {
                let cmd: ATSCommand = {
                    action: 'close',
                    targetTypes: [ 'otherTabs' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.closeOtherTabs();' + comment );
            } );

            it( 'options', () => {
                let cmd: ATSCommand = {
                    action: 'close',
                    options: [ 'otherTabs' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.closeOtherTabs();' + comment );
            } );

        } );

    } );

    describe( 'doubleClick', () => {

        it( 'value', () => {
            let cmd: ATSCommand = {
                action: 'doubleClick',
                values: [ 'foo' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.doubleClick("foo");' + comment );
        } );

        it( 'target', () => {
            let cmd: ATSCommand = {
                action: 'doubleClick',
                targets: [ 'foo' ],
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.doubleClick("foo");' + comment );
        } );

    } );

    describe( 'drag', () => {

        it( 'two targets', () => {
            let cmd: ATSCommand = {
                action: 'drag',
                targets: [ 'foo', 'bar' ],
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.dragAndDrop("foo", "bar");' + comment );
        } );

    } );

    describe( 'fill', () => {

        it( 'target, value', () => {
            let cmd: ATSCommand = {
                action: 'fill',
                targets: [ 'foo' ],
                values: [ 'bar' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.fillField("foo", "bar");' + comment );
        } );

    } );


    describe( 'hide', () => {

        describe( 'keyboard', () => {

            it( 'options', () => {
                let cmd: ATSCommand = {
                    action: 'hide',
                    options: [ 'keyboard' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.hideDeviceKeyboard();' + comment );
            } );

        } );

    } );


    describe( 'install', () => {

        it( 'option, value', () => {
            let cmd: ATSCommand = {
                action: 'install',
                options: [ 'app' ],
                values: [ 'foo.apk' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.installApp("foo.apk");' + comment );
        } );

    } );



    describe( 'move', () => {

        describe( 'moveCursorTo', () => {

            it( 'target, options', () => {
                let cmd: ATSCommand = {
                    action: 'move',
                    targets: [ 'foo' ],
                    options: [ 'cursor' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.moveCursorTo("foo");' + comment );
            } );

        } );

    } );


    describe( 'open', () => {

        describe( 'notifications', () => {

            it( 'options', () => {
                let cmd: ATSCommand = {
                    action: 'open',
                    options: [ 'notifications' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.openNotifications();' + comment );
            } );

        } );

    } );


    describe( 'press', () => {

        it( 'value', () => {
            let cmd: ATSCommand = {
                action: 'press',
                values: [ 'Enter' ],
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.pressKey("Enter");' + comment );
        } );

        it( 'array', () => {
            let cmd: ATSCommand = {
                action: 'press',
                values: [ 'Ctrl', 'S' ],
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.pressKey(["Ctrl", "S"]);' + comment );
        } );

    } );


    describe( 'pull', () => {

        describe( 'file', () => {

            it( 'options, two values', () => {
                let cmd: ATSCommand = {
                    action: 'pull',
                    options: [ 'file' ],
                    values: [ 'foo.png', 'bar.png' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.pullFile("foo.png", "bar.png");' + comment );
            } );

        } );

    } );


    describe( 'remove', () => {

        describe( 'app', () => {

            it( 'options, value', () => {
                let cmd: ATSCommand = {
                    action: 'remove',
                    options: [ 'app' ],
                    values: [ 'foo.apk' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.removeApp("foo.apk");' + comment );
            } );

        } );

    } );


    describe( 'rightClick', () => {

        it( 'value', () => {
            let cmd: ATSCommand = {
                action: 'rightClick',
                values: [ 'foo' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.rightClick("foo");' + comment );
        } );

        it( 'target', () => {
            let cmd: ATSCommand = {
                action: 'rightClick',
                targets: [ 'foo' ],
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.rightClick("foo");' + comment );
        } );

    } );


    describe( 'rotate', () => {

        it( 'two numbers', () => {
            let cmd: ATSCommand = {
                action: 'rotate',
                values: [ '100', '200' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.rotate(100, 200);' + comment );
        } );

    } );


    describe( 'saveScreenshot', () => {

        it( 'value', () => {
            let cmd: ATSCommand = {
                action: 'saveScreenshot',
                values: [ 'foo' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.saveScreenshot("foo");' + comment );
        } );

    } );

    describe( 'see', () => {

        describe( 'seeAppIsInstalled', () => {

            it( 'options, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'app', 'installed' ],
                    values: [ 'foo.apk' ],
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeAppIsInstalled("foo.apk");' + comment );
            } );

        } );

        describe( 'seeAppIsNotInstalled', () => {

            it( 'options, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'app', 'installed' ],
                    values: [ 'foo.apk' ],
                    modifier: 'not',
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeAppIsNotInstalled("foo.apk");' + comment );
            } );

        } );

        describe( 'seeCurrentActivityIs', () => {

            it( 'options, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'currentActivity' ],
                    values: [ 'foo' ],
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeCurrentActivityIs("foo");' + comment );
            } );

        } );


        describe( 'seeDeviceIsLocked', () => {

            it( 'options, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'device', 'locked' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeDeviceIsLocked();' + comment );
            } );

        } );


        describe( 'seeDeviceIsUnlocked', () => {

            it( 'options, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'device', 'unlocked' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeDeviceIsUnlocked();' + comment );
            } );

        } );


        describe( 'seeInField', () => {

            it( 'targetType textbox, value, field', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'textbox' ],
                    targets: [ 'foo' ],
                    values: [ 'bar' ],
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeInField("foo", "bar");' + comment );
            } );

            it( 'targetType textarea, value, field', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'textarea' ],
                    targets: [ 'foo' ],
                    values: [ 'bar' ],
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeInField("foo", "bar");' + comment );
            } );

        } );


        describe( 'dontSeeInField', () => {

            it( 'targetTypes textbox, target, value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'textbox' ],
                    targets: [ 'foo' ],
                    values: [ 'bar' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeInField("foo", "bar");' + comment );
            } );

            it( 'targetType textarea, target, value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'textarea' ],
                    targets: [ 'foo' ],
                    values: [ 'bar' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeInField("foo", "bar");' + comment );
            } );

        } );


        describe( 'seeCheckboxIsChecked', () => {

            it( 'targetType checkbox, value, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'checkbox' ],
                    options: [ 'checked' ],
                    targets: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeCheckboxIsChecked("foo");' + comment );
            } );

        } );


        describe( 'dontSeeCheckboxIsChecked', () => {

            it( 'targetType checkbox, value, value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'checkbox' ],
                    options: [ 'checked' ],
                    targets: [ 'foo' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeCheckboxIsChecked("foo");' + comment );
            } );

        } );


        describe( 'seeCookie', () => {

            it( 'targetType cookie, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'cookie' ],
                    values: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeCookie("foo");' + comment );
            } );

            it( 'option cookie, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'cookie' ],
                    values: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeCookie("foo");' + comment );
            } );

        } );


        describe( 'dontSeeCookie', () => {

            it( 'targetType cookie, value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'cookie' ],
                    values: [ 'foo' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeCookie("foo");' + comment );
            } );

            it( 'option cookie, value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'cookie' ],
                    values: [ 'foo' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeCookie("foo");' + comment );
            } );

        } );


        describe( 'seeInTitle', () => {

            it( 'targetType title, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'title' ],
                    values: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeInTitle("foo");' + comment );
            } );

            it( 'option title, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'title' ],
                    values: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeInTitle("foo");' + comment );
            } );

        } );


        describe( 'dontSeeInTitle', () => {

            it( 'targetType title, value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'title' ],
                    values: [ 'foo' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeInTitle("foo");' + comment );
            } );

            it( 'option title, value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'title' ],
                    values: [ 'foo' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeInTitle("foo");' + comment );
            } );

        } );


        describe( 'seeInCurrentUrl', () => {

            it( 'targetType url, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'url' ],
                    values: [ '/foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeInCurrentUrl("/foo");' + comment );
            } );

            it( 'option url, value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'url' ],
                    values: [ '/foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeInCurrentUrl("/foo");' + comment );
            } );

        } );

        describe( 'dontSeeInCurrentUrl', () => {

            it( 'targetType url, value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targetTypes: [ 'url' ],
                    values: [ '/foo' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeInCurrentUrl("/foo");' + comment );
            } );

            it( 'option url, value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'url' ],
                    values: [ '/foo' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeInCurrentUrl("/foo");' + comment );
            } );

        } );


        describe( 'seeElement', () => {
            it( 'target', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targets: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeElement("foo");' + comment );
            } );
        } );


        describe( 'dontSeeElement', () => {
            it( 'target, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    targets: [ 'foo' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSeeElement("foo");' + comment );
            } );
        } );


        describe( 'seeOrientationIs', () => {

            it( 'options, value portrait', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'orientation', 'portrait' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeOrientationIs("PORTRAIT");' + comment );
            } );

            it( 'options, value landscape', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    options: [ 'orientation', 'landscape' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.seeOrientationIs("LANDSCAPE");' + comment );
            } );

        } );


        describe( 'see', () => {
            it( 'value', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    values: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.see("foo");' + comment );
            } );
        } );


        describe( 'dontSee', () => {
            it( 'value, modifier', () => {
                let cmd: ATSCommand = {
                    action: 'see',
                    values: [ 'foo' ],
                    modifier: 'not'
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.dontSee("foo");' + comment );
            } );
        } );

    } );

    describe( 'shake', () => {

        it( 'nothing', () => {
            let cmd: ATSCommand = {
                action: 'shake'
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.shakeDevice();' + comment );
        } );

    } );


    describe( 'select', () => {

        it( 'works with one target and one value', () => {
            let cmd: ATSCommand = {
                action: 'select',
                targets: [ 'foo' ],
                values: [ 'bar' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.selectOption("foo", "bar");' + comment );
        } );

    } );


    describe( 'swipe', () => {

        it( 'value, two numbers', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                values: [ 'foo', '100', '200' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipe("foo", 100, 200);' + comment );
        } );

        it( 'value, three numbers', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                values: [ 'foo', '100', '200', '3000' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipe("foo", 100, 200, 3000);' + comment );
        } );

    } );


    describe( 'swipeDown', () => {

        it( 'value, number', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                options: [ 'down' ],
                values: [ 'foo', '100' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipeDown("foo", 100);' + comment );
        } );

        it( 'value, two numbers', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                options: [ 'down' ],
                values: [ 'foo', '100', '3000' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipeDown("foo", 100, 3000);' + comment );
        } );

    } );


    describe( 'swipeLeft', () => {

        it( 'value, number', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                options: [ 'left' ],
                values: [ 'foo', '100' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipeLeft("foo", 100);' + comment );
        } );

        it( 'value, two numbers', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                options: [ 'left' ],
                values: [ 'foo', '100', '3000' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipeLeft("foo", 100, 3000);' + comment );
        } );

    } );


    describe( 'swipeRight', () => {

        it( 'value, number', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                options: [ 'right' ],
                values: [ 'foo', '100' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipeRight("foo", 100);' + comment );
        } );

        it( 'value, two numbers', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                options: [ 'right' ],
                values: [ 'foo', '100', '3000' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipeRight("foo", 100, 3000);' + comment );
        } );

    } );



    describe( 'swipeUp', () => {

        it( 'value, number', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                options: [ 'up' ],
                values: [ 'foo', '100' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipeUp("foo", 100);' + comment );
        } );

        it( 'value, two numbers', () => {
            let cmd: ATSCommand = {
                action: 'swipe',
                options: [ 'up' ],
                values: [ 'foo', '100', '3000' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.swipeUp("foo", 100, 3000);' + comment );
        } );

    } );


    describe( 'switchToNative', () => {

        it( 'option', () => {
            let cmd: ATSCommand = {
                action: 'switch',
                options: [ 'native' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.switchToNative();' + comment );
        } );

        it( 'option, value', () => {
            let cmd: ATSCommand = {
                action: 'switch',
                options: [ 'native' ],
                values: [ 'context' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.switchToNative("context");' + comment );
        } );

    } );


    describe( 'switchToWeb', () => {

        it( 'option', () => {
            let cmd: ATSCommand = {
                action: 'switch',
                options: [ 'web' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.switchToWeb();' + comment );
        } );

        it( 'option, value', () => {
            let cmd: ATSCommand = {
                action: 'switch',
                options: [ 'web' ],
                values: [ 'context' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.switchToWeb("context");' + comment );
        } );

    } );


    describe( 'tap', () => {

        it( 'value', () => {
            let cmd: ATSCommand = {
                action: 'tap',
                values: [ 'foo' ]
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.tap("foo");' + comment );
        } );

        it( 'target', () => {
            let cmd: ATSCommand = {
                action: 'tap',
                targets: [ 'foo' ],
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.tap("foo");' + comment );
        } );

    } );

    describe( 'uncheck', () => {

        it( 'target', () => {
            let cmd: ATSCommand = {
                action: 'uncheck',
                targets: [ 'foo' ],
            };
            const r = cm.map( cmd );
            expect( r ).toContainEqual( 'I.uncheckOption("foo");' + comment );
        } );

    } );


    describe( 'wait', () => {

        describe( 'waitUrlEquals', () => {

            it( 'targetType, value', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    targetTypes: [ 'url' ],
                    values: [ '/foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.waitUrlEquals("/foo");' + comment );
            } );

            it( 'targetType, value, number', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    targetTypes: [ 'url' ],
                    values: [ '/foo', '3' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.waitUrlEquals("/foo", 3);' + comment );
            } );

        } );


        describe( 'waitForVisible', () => {
            it( 'option, target', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    options: [ 'visible' ],
                    targets: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.waitForVisible("foo");' + comment );
            } );
        } );


        describe( 'waitForInvisible', () => {
            it( 'option, target', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    options: [ 'invisible' ],
                    targets: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.waitForInvisible("foo");' + comment );
            } );
        } );


        describe( 'waitForEnabled', () => {
            it( 'option, target', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    options: [ 'enabled' ],
                    targets: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.waitForEnabled("foo");' + comment );
            } );
        } );


        describe( 'waitForElement', () => {

            it( 'target', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    targets: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.waitForElement("foo");' + comment );
            } );

            it( 'target, number', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    targets: [ 'foo' ],
                    values: [ '3' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.waitForElement("foo", 3);' + comment );
            } );

        } );


        describe( 'waitForText', () => {

            it( 'targetType text, target', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    targetTypes: [ 'text' ],
                    targets: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.waitForText("foo");' + comment );
            } );

            it( 'option text, value', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    options: [ 'text' ],
                    values: [ 'foo' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.waitForText("foo");' + comment );
            } );

        } );


        describe( 'wait', () => {
            it( 'number', () => {
                let cmd: ATSCommand = {
                    action: 'wait',
                    values: [ '3' ]
                };
                const r = cm.map( cmd );
                expect( r ).toContainEqual( 'I.wait(3);' + comment );
            } );
        } );

    } );

} );