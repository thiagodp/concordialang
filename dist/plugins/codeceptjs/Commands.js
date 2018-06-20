"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMapper_1 = require("./CommandMapper");
/** Maps available commands. ORDER MATTERS */
exports.CODECEPTJS_COMMANDS = [
    // accept
    { action: 'accept', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['alert'], template: 'I.acceptPopup();' },
    { action: 'accept', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['confirm'], template: 'I.acceptPopup();' },
    { action: 'accept', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['popup'], template: 'I.acceptPopup();' },
    { action: 'accept', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['prompt'], template: 'I.acceptPopup();' },
    // amOn
    { action: 'amOn', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE__ONE_TARGET, targetType: 'url', template: 'I.amOnPage({{{target}}});' },
    { action: 'amOn', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.amOnPage({{{value}}});' },
    // append
    { action: 'append', comp: CommandMapper_1.CmdCmp.ONE_TARGET__ONE_VALUE, template: 'I.appendField({{{target}}}, {{{value}}});' },
    // attachFile
    { action: 'attachFile', comp: CommandMapper_1.CmdCmp.ONE_TARGET__ONE_VALUE, template: 'I.attachFile({{{target}}}, {{{value}}});' },
    // cancel
    { action: 'cancel', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['alert'], template: 'I.cancelPopup();' },
    { action: 'cancel', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['confirm'], template: 'I.cancelPopup();' },
    { action: 'cancel', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['popup'], template: 'I.cancelPopup();' },
    { action: 'cancel', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['prompt'], template: 'I.cancelPopup();' },
    // check
    { action: 'check', comp: CommandMapper_1.CmdCmp.ONE_VALUE__ONE_TARGET, template: 'I.checkOption({{{value}}}, {{{target}}});' },
    { action: 'check', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.checkOption({{{target}}});' },
    { action: 'check', comp: CommandMapper_1.CmdCmp.TWO_TARGETS, template: 'I.checkOption({{{target}}});' },
    { action: 'check', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.checkOption({{{value}}});' },
    // clear + cookie
    { action: 'clear', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE__ONE_TARGET, targetType: 'cookie', template: 'I.clearCookie({{{target}}});' },
    // clear + field
    { action: 'clear', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.clearField({{{target}}});' },
    { action: 'clear', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET, options: ['field'], template: 'I.clearField({{{target}}});' },
    // click
    { action: 'click', comp: CommandMapper_1.CmdCmp.ONE_VALUE__ONE_TARGET, template: 'I.click({{{value}}}, {{{target}}});' },
    { action: 'click', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.click({{{target}}});' },
    { action: 'click', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.click({{{value}}});' },
    { action: 'click', comp: CommandMapper_1.CmdCmp.TWO_TARGETS, template: 'I.click({{{target}}});' },
    // close + app (Appium only)
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['app'], template: 'I.closeApp();' },
    // close + currentTab
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE, targetType: 'currentTab', template: 'I.closeCurrentTab();' },
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['currentTab'], template: 'I.closeCurrentTab();' },
    // close + otherTabs
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE, targetType: 'otherTabs', template: 'I.closeOtherTabs();' },
    { action: 'close', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['otherTabs'], template: 'I.closeOtherTabs();' },
    // connect + database (usually during a Test Event)
    { action: 'connect', comp: CommandMapper_1.CmdCmp.TWO_VALUES_SAME_OPTION, options: ['database'], valuesAsNonArray: true, template: 'I.connect({{{value}}});' },
    // disconnect + database (usually during a Test Event)
    { action: 'disconnect', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['database'], valuesAsNonArray: true, template: 'await I.disconnect({{{value}}});' },
    // doubleClick
    { action: 'doubleClick', comp: CommandMapper_1.CmdCmp.ONE_VALUE__ONE_TARGET, template: 'I.doubleClick({{{value}}}, {{{target}}});' },
    { action: 'doubleClick', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.doubleClick({{{target}}});' },
    { action: 'doubleClick', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.doubleClick({{{value}}});' },
    { action: 'doubleClick', comp: CommandMapper_1.CmdCmp.TWO_TARGETS, template: 'I.doubleClick({{{target}}});' },
    // drag
    { action: 'drag', comp: CommandMapper_1.CmdCmp.TWO_TARGETS, template: 'I.dragAndDrop({{{target}}});' },
    // fill
    { action: 'fill', comp: CommandMapper_1.CmdCmp.ONE_TARGET__ONE_VALUE, template: 'I.fillField({{{target}}}, {{{value}}});' },
    { action: 'fill', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE, options: ['field'], template: 'I.fillField({{{target}}}, {{{value}}});' },
    { action: 'fill', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE, options: ['inside'], template: 'I.fillField({{{target}}}, {{{value}}});' },
    // hide + keyboard (Appium only)
    { action: 'hide', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['keyboard'], template: 'I.hideDeviceKeyboard();' },
    // install (Appium only)
    { action: 'install', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['app'], template: 'I.installApp({{{value}}});' },
    // maximize + window
    { action: 'maximize', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['window'], template: 'I.resizeWindow("maximize");' },
    // move + cursor
    { action: 'move', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__TWO_NUMBERS, options: ['cursor'], valuesAsNonArray: true, template: 'I.moveCursorTo({{{target}}}, {{{value}}});' },
    { action: 'move', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET, options: ['cursor'], template: 'I.moveCursorTo({{{target}}});' },
    // open + notifications (Appium only)
    { action: 'open', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['notifications'], template: 'I.openNotifications();' },
    // press
    { action: 'press', comp: CommandMapper_1.CmdCmp.ONE_VALUE__OR_ARRAY, template: 'I.pressKey({{{value}}});' },
    // pull + file (Appium only)
    { action: 'pull', comp: CommandMapper_1.CmdCmp.TWO_VALUES_SAME_OPTION, options: ['file'], valuesAsNonArray: true, template: 'I.pullFile({{{value}}});' },
    // refresh + currentPage
    { action: 'refresh', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['currentPage'], template: 'I.refreshPage();' },
    // refresh + url
    { action: 'refresh', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['url'], template: 'I.refreshPage();' },
    // remove + app (Appium only)
    { action: 'remove', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['app'], template: 'I.removeApp({{{value}}});' },
    // resize + window
    { action: 'resize', comp: CommandMapper_1.CmdCmp.TWO_NUMBERS_SAME_OPTION, options: ['window'], valuesAsNonArray: true, template: 'I.resizeWindow({{{value}}});' },
    // rightClick
    { action: 'rightClick', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.rightClick({{{target}}});' },
    { action: 'rightClick', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.rightClick({{{value}}});' },
    // rotate (Appium only)
    { action: 'rotate', comp: CommandMapper_1.CmdCmp.TWO_NUMBERS, valuesAsNonArray: true, template: 'I.rotate({{{value}}});' },
    // run + command (usually during a Test Event)
    { action: 'run', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['command'], singleQuotedValues: true, template: 'await I.runCommand({{{value}}});' },
    // run + script (usually during a Test Event)
    { action: 'run', comp: CommandMapper_1.CmdCmp.TWO_VALUES_SAME_OPTION, options: ['script'], valuesAsNonArray: true, singleQuotedValues: true, template: 'await I.run({{{value}}});' },
    // saveScreenshot
    { action: 'saveScreenshot', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.saveScreenshot({{{value}}});' },
    // see + app + installed (Appium only)
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: ['app', 'installed'], template: 'I.seeAppIsInstalled({{{value}}});' },
    // see + app + installed + not (Appium only)
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: ['app', 'installed'], modifier: 'not', template: 'I.seeAppIsNotInstalled({{{value}}});' },
    // see + currentActivity + value (Appium only)
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: ['currentActivity'], template: 'I.seeCurrentActivityIs({{{value}}});' },
    // see + device + locked (Appium only)
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['device', 'locked'], template: 'I.seeDeviceIsLocked();' },
    // see + device + unlocked (Appium only)
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['device', 'unlocked'], template: 'I.seeDeviceIsUnlocked();' },
    // see + orientation + landscape (Appium only)
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['orientation', 'landscape'], template: 'I.seeOrientationIs("LANDSCAPE");' },
    // see + orientation + portrait (Appium only)
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['orientation', 'portrait'], template: 'I.seeOrientationIs("PORTRAIT");' },
    // see + value + inside + target
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE, options: ['inside'], template: 'I.see({{{value}}}, {{{target}}});' },
    // see + value + not + inside + target
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE, options: ['inside'], modifier: 'not', template: 'I.dontSee({{{value}}}, {{{target}}});' },
    // see + with
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE, options: ['with'], template: 'I.see({{{value}}}, {{{target}}});' },
    // see + with + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE, options: ['with'], modifier: 'not', template: 'I.dontSee({{{value}}}, {{{target}}});' },
    // see + field as option
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE, options: ['field'], template: 'I.seeInField({{{target}}}, {{{value}}});' },
    // see + field as option + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE, options: ['field'], modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    // see + textbox as target type
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE, targetType: 'textbox', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    // see + textbox as target type + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE, targetType: 'textbox', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    // see + textarea as target type
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE, targetType: 'textarea', template: 'I.seeInField({{{target}}}, {{{value}}});' },
    // see + textarea as target type + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE, targetType: 'textarea', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
    // see + checkbox
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET, targetType: 'checkbox', options: ['checked'], template: 'I.seeCheckboxIsChecked({{{target}}});' },
    // see + checkbox + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET, targetType: 'checkbox', options: ['checked'], modifier: 'not', template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },
    // see + cookie
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE, targetType: 'cookie', template: 'I.seeCookie({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: ['cookie'], template: 'I.seeCookie({{{value}}});' },
    // see + cookie + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE, targetType: 'cookie', modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: ['cookie'], modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
    // see + title
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE, targetType: 'title', template: 'I.seeInTitle({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: ['title'], template: 'I.seeInTitle({{{value}}});' },
    // see + title + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE, targetType: 'title', modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: ['title'], modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
    // see + url
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE, targetType: 'url', template: 'I.seeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: ['url'], template: 'I.seeInCurrentUrl({{{value}}});' },
    // see + url + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE, targetType: 'url', modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE, options: ['url'], modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
    // see + target
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__ONE_TARGET, template: 'I.seeElement({{{target}}});' },
    // see + target + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__ONE_TARGET, modifier: 'not', template: 'I.dontSeeElement({{{target}}});' },
    // see
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__ONE_VALUE, template: 'I.see({{{value}}});' },
    // see + not
    { action: 'see', comp: CommandMapper_1.CmdCmp.SAME_MODIFIER__ONE_VALUE, modifier: 'not', template: 'I.dontSee({{{value}}});' },
    // select
    { action: 'select', comp: CommandMapper_1.CmdCmp.ONE_TARGET__ONE_VALUE, template: 'I.selectOption({{{target}}}, {{{value}}});' },
    // shake (Appium only)
    { action: 'shake', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: [], template: 'I.shakeDevice();' },
    // swipe + down (Appium only)
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['down'], valuesAsNonArray: true, template: 'I.swipeDown({{{value}}});' },
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS, options: ['down'], valuesAsNonArray: true, template: 'I.swipeDown({{{value}}});' },
    // swipe + left (Appium only)
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['left'], valuesAsNonArray: true, template: 'I.swipeLeft({{{value}}});' },
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS, options: ['left'], valuesAsNonArray: true, template: 'I.swipeLeft({{{value}}});' },
    // swipe + right (Appium only)
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['right'], valuesAsNonArray: true, template: 'I.swipeRight({{{value}}});' },
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS, options: ['right'], valuesAsNonArray: true, template: 'I.swipeRight({{{value}}});' },
    // swipe + up (Appium only)
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['up'], valuesAsNonArray: true, template: 'I.swipeUp({{{value}}});' },
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS, options: ['up'], valuesAsNonArray: true, template: 'I.swipeUp({{{value}}});' },
    // swipe (Appium only)
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.ONE_VALUE__TWO_NUMBERS, valuesAsNonArray: true, template: 'I.swipe({{{value}}});' },
    { action: 'swipe', comp: CommandMapper_1.CmdCmp.ONE_VALUE__THREE_NUMBERS, valuesAsNonArray: true, template: 'I.swipe({{{value}}});' },
    // switch + native (Appium only)
    { action: 'switch', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['native'], template: 'I.switchToNative({{{value}}});' },
    { action: 'switch', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['native'], template: 'I.switchToNative();' },
    // switch + web (Appium only)
    { action: 'switch', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['web'], template: 'I.switchToWeb({{{value}}});' },
    { action: 'switch', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['web'], template: 'I.switchToWeb();' },
    // switch + tab + number
    { action: 'switch', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_NUMBER, options: ['tab'], template: 'I.switchToNextTab({{{value}}});' },
    // switch + next + tab
    { action: 'switch', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['next', 'tab'], template: 'I.switchToNextTab();' },
    // switch + previous + tab
    { action: 'switch', comp: CommandMapper_1.CmdCmp.SAME_OPTION, options: ['previous', 'tab'], template: 'I.switchToPreviousTab();' },
    // tap (Appium only)
    { action: 'tap', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.tap({{{target}}});' },
    { action: 'tap', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.tap({{{value}}});' },
    // uncheck
    { action: 'uncheck', comp: CommandMapper_1.CmdCmp.ONE_VALUE__ONE_TARGET, template: 'I.uncheckOption({{{value}}}, {{{target}}});' },
    { action: 'uncheck', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.uncheckOption({{{target}}});' },
    { action: 'uncheck', comp: CommandMapper_1.CmdCmp.TWO_TARGETS, template: 'I.uncheckOption({{{target}}});' },
    { action: 'uncheck', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.uncheckOption({{{value}}});' },
    // wait + url
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE__ONE_VALUE, targetType: 'url', template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE__ONE_VALUE_ONE_NUMBER, targetType: 'url', valuesAsNonArray: true, template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: ['url'], template: 'I.waitUrlEquals({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET, options: ['url'], template: 'I.waitUrlEquals({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['url'], template: 'I.waitUrlEquals({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['url'], valuesAsNonArray: true, template: 'I.waitUrlEquals({{{value}}});' },
    // wait + target + number + visible + elements
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: ['visible', 'elements'], valuesAsNonArray: true, template: 'I.waitNumberOfVisibleElements({{{target}}}, {{{value}}});' },
    // wait + visible
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: ['visible'], template: 'I.waitForVisible({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET, options: ['visible'], template: 'I.waitForVisible({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['visible'], valuesAsNonArray: true, template: 'I.waitForVisible({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['visible'], template: 'I.waitForVisible({{{value}}});' },
    // wait + invisible
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: ['invisible'], template: 'I.waitForInvisible({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET, options: ['invisible'], template: 'I.waitForInvisible({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['invisible'], valuesAsNonArray: true, template: 'I.waitForInvisible({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['invisible'], template: 'I.waitForInvisible({{{value}}});' },
    // wait + enabled
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: ['enabled'], template: 'I.waitForEnabled({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET, options: ['enabled'], template: 'I.waitForEnabled({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['enabled'], valuesAsNonArray: true, template: 'I.waitForEnabled({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['enabled'], template: 'I.waitForEnabled({{{value}}});' },
    // wait + ( hide | hidden )
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: ['hide'], template: 'I.waitToHide({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET, options: ['hide'], template: 'I.waitToHide({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['hide'], valuesAsNonArray: true, template: 'I.waitToHide({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['hide'], template: 'I.waitToHide({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: ['hidden'], template: 'I.waitToHide({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET, options: ['hidden'], template: 'I.waitToHide({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['hidden'], valuesAsNonArray: true, template: 'I.waitToHide({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['hidden'], template: 'I.waitToHide({{{value}}});' },
    // wait + text
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER, targetType: 'text', template: 'I.waitForText({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_TARGET_TYPE__ONE_TARGET, targetType: 'text', template: 'I.waitForText({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_TARGET, options: ['text'], valuesAsNonArray: true, template: 'I.waitForText({{{value}}}, {{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE, options: ['text'], template: 'I.waitForText({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER, options: ['text'], valuesAsNonArray: true, template: 'I.waitForText({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_VALUE, options: ['text'], valuesAsNonArray: true, template: 'I.waitForText({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER, options: ['text'], template: 'I.waitForText({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET, options: ['text'], template: 'I.waitForText({{{target}}});' },
    // wait + value
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE__ONE_NUMBER, options: ['value'], valuesAsNonArray: true, template: 'I.waitForValue({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE, options: ['value'], template: 'I.waitForValue({{{target}}}, {{{value}}});' },
    // wait + target
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_TARGET__ONE_NUMBER, template: 'I.waitForElement({{{target}}}, {{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_TARGET, template: 'I.waitForElement({{{target}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_VALUE, template: 'I.waitForElement({{{value}}});' },
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_VALUE__ONE_NUMBER, valuesAsNonArray: true, template: 'I.waitForElement({{{value}}});' },
    // wait
    { action: 'wait', comp: CommandMapper_1.CmdCmp.ONE_NUMBER, template: 'I.wait({{{value}}});' }
];
