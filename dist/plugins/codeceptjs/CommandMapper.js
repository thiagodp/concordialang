"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mustache_1 = require("mustache");
/**
 * Command comparison
 *
 * @author Thiago Delgado Pinto
 */
var CmdCmp;
(function (CmdCmp) {
    CmdCmp[CmdCmp["ONE_VALUE"] = 0] = "ONE_VALUE";
    CmdCmp[CmdCmp["ONE_VALUE_SAME_TARGET_TYPE"] = 1] = "ONE_VALUE_SAME_TARGET_TYPE";
    CmdCmp[CmdCmp["ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER"] = 2] = "ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER";
    CmdCmp[CmdCmp["ONE_VALUE_SAME_OPTION"] = 3] = "ONE_VALUE_SAME_OPTION";
    CmdCmp[CmdCmp["ONE_VALUE_SAME_OPTION_SAME_MODIFIER"] = 4] = "ONE_VALUE_SAME_OPTION_SAME_MODIFIER";
    CmdCmp[CmdCmp["ONE_VALUE_OR_ARRAY"] = 5] = "ONE_VALUE_OR_ARRAY";
    CmdCmp[CmdCmp["ONE_VALUE_ONE_NUMBER_SAME_TARGET_TYPE"] = 6] = "ONE_VALUE_ONE_NUMBER_SAME_TARGET_TYPE";
    CmdCmp[CmdCmp["ONE_VALUE_SAME_MODIFIER"] = 7] = "ONE_VALUE_SAME_MODIFIER";
    CmdCmp[CmdCmp["ONE_NUMBER"] = 8] = "ONE_NUMBER";
    CmdCmp[CmdCmp["ONE_TARGET"] = 9] = "ONE_TARGET";
    CmdCmp[CmdCmp["ONE_TARGET_ONE_VALUE"] = 10] = "ONE_TARGET_ONE_VALUE";
    CmdCmp[CmdCmp["ONE_TARGET_ONE_NUMBER"] = 11] = "ONE_TARGET_ONE_NUMBER";
    CmdCmp[CmdCmp["ONE_TARGET_SAME_TARGET_TYPE"] = 12] = "ONE_TARGET_SAME_TARGET_TYPE";
    CmdCmp[CmdCmp["ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER"] = 13] = "ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER";
    CmdCmp[CmdCmp["ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER"] = 14] = "ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER";
    CmdCmp[CmdCmp["ONE_TARGET_SAME_OPTION"] = 15] = "ONE_TARGET_SAME_OPTION";
    CmdCmp[CmdCmp["ONE_TARGET_SAME_MODIFIER"] = 16] = "ONE_TARGET_SAME_MODIFIER";
    CmdCmp[CmdCmp["SAME_TARGET_TYPE"] = 17] = "SAME_TARGET_TYPE";
    CmdCmp[CmdCmp["SAME_OPTION"] = 18] = "SAME_OPTION";
    CmdCmp[CmdCmp["TWO_TARGETS"] = 19] = "TWO_TARGETS";
})(CmdCmp || (CmdCmp = {}));
/**
 * Command mapper
 *
 * @author Thiago Delgado Pinto
 */
class CommandMapper {
    constructor() {
        /** Maps available commands. ORDER MATTERS */
        this.commands = [
            // AM_ON
            { action: 'amOn', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'url', template: 'I.amOnPage({{{target}}});' },
            { action: 'amOn', comp: CmdCmp.ONE_VALUE, template: 'I.amOnPage({{{value}}});' },
            // APPEND
            { action: 'append', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.appendField({{{target}}}, {{{value}}});' },
            // ATTACH_FILE
            { action: 'attachFile', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.attachFile({{{target}}}, {{{value}}});' },
            // CHECK
            { action: 'check', comp: CmdCmp.ONE_TARGET, template: 'I.checkOption({{{target}}});' },
            { action: 'check', comp: CmdCmp.ONE_VALUE, template: 'I.checkOption({{{value}}});' },
            // CLEAR
            { action: 'clear', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'cookie', template: 'I.clearCookie({{{target}}});' },
            { action: 'clear', comp: CmdCmp.ONE_TARGET, template: 'I.clearField({{{target}}});' },
            // CLICK
            { action: 'click', comp: CmdCmp.ONE_TARGET, template: 'I.click({{{target}}});' },
            { action: 'click', comp: CmdCmp.ONE_VALUE, template: 'I.click({{{value}}});' },
            // CLOSE
            { action: 'close', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'currentTab', template: 'I.closeCurrentTab();' },
            { action: 'close', comp: CmdCmp.SAME_OPTION, options: ['currentTab'], template: 'I.closeCurrentTab();' },
            { action: 'close', comp: CmdCmp.SAME_TARGET_TYPE, targetType: 'otherTabs', template: 'I.closeOtherTabs();' },
            { action: 'close', comp: CmdCmp.SAME_OPTION, options: ['otherTabs'], template: 'I.closeOtherTabs();' },
            // DOUBLE_CLICK
            { action: 'doubleClick', comp: CmdCmp.ONE_TARGET, template: 'I.doubleClick({{{target}}});' },
            { action: 'doubleClick', comp: CmdCmp.ONE_VALUE, template: 'I.doubleClick({{{value}}});' },
            // DRAG
            { action: 'drag', comp: CmdCmp.TWO_TARGETS, template: 'I.dragAndDrop({{{target}}});' },
            // FILL
            { action: 'fill', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.fillField({{{target}}}, {{{value}}});' },
            // MOVE
            { action: 'move', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: ['cursor'], template: 'I.moveCursorTo({{{target}}});' },
            // PRESS
            { action: 'press', comp: CmdCmp.ONE_VALUE_OR_ARRAY, template: 'I.pressKey({{{value}}});' },
            // RIGHT_CLICK
            { action: 'rightClick', comp: CmdCmp.ONE_TARGET, template: 'I.rightClick({{{target}}});' },
            { action: 'rightClick', comp: CmdCmp.ONE_VALUE, template: 'I.rightClick({{{value}}});' },
            // SAVE_SCREENSHOT
            { action: 'saveScreenshot', comp: CmdCmp.ONE_VALUE, template: 'I.saveScreenshot({{{value}}});' },
            // SEE
            { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textbox', template: 'I.seeInField({{{target}}}, {{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textarea', template: 'I.seeInField({{{target}}}, {{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textbox', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'textarea', modifier: 'not', template: 'I.dontSeeInField({{{target}}}, {{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER, targetType: 'checkbox', options: ['checked'], template: 'I.seeCheckboxIsChecked({{{target}}});' },
            { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER, targetType: 'checkbox', options: ['checked'], modifier: 'not', template: 'I.dontSeeCheckboxIsChecked({{{target}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'cookie', template: 'I.seeCookie({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'cookie', modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['cookie'], template: 'I.seeCookie({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['cookie'], modifier: 'not', template: 'I.dontSeeCookie({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'title', template: 'I.seeInTitle({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'title', modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['title'], template: 'I.seeInTitle({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['title'], modifier: 'not', template: 'I.dontSeeInTitle({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'url', template: 'I.seeInCurrentUrl({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER, targetType: 'url', modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['url'], template: 'I.seeInCurrentUrl({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER, options: ['url'], modifier: 'not', template: 'I.dontSeeInCurrentUrl({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_MODIFIER, template: 'I.seeElement({{{target}}});' },
            { action: 'see', comp: CmdCmp.ONE_TARGET_SAME_MODIFIER, modifier: 'not', template: 'I.dontSeeElement({{{target}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_MODIFIER, template: 'I.see({{{value}}});' },
            { action: 'see', comp: CmdCmp.ONE_VALUE_SAME_MODIFIER, modifier: 'not', template: 'I.dontSee({{{value}}});' },
            // SELECT
            { action: 'select', comp: CmdCmp.ONE_TARGET_ONE_VALUE, template: 'I.selectOption({{{target}}}, {{{value}}});' },
            // TAP
            { action: 'tap', comp: CmdCmp.ONE_TARGET, template: 'I.tap({{{target}}});' },
            { action: 'tap', comp: CmdCmp.ONE_VALUE, template: 'I.tap({{{value}}});' },
            // UNCHECK
            { action: 'uncheck', comp: CmdCmp.ONE_TARGET, template: 'I.uncheckOption({{{target}}});' },
            // WAIT
            { action: 'wait', comp: CmdCmp.ONE_VALUE_SAME_TARGET_TYPE, targetType: 'url', template: 'I.waitUrlEquals({{{value}}});' },
            { action: 'wait', comp: CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_TARGET_TYPE, targetType: 'url', valuesAsNonArray: true, template: 'I.waitUrlEquals({{{value}}});' },
            { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: ['visible'], template: 'I.waitForVisible({{{target}}});' },
            { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: ['invisible'], template: 'I.waitForInvisible({{{target}}});' },
            { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_OPTION, options: ['enabled'], template: 'I.waitForEnabled({{{target}}});' },
            { action: 'wait', comp: CmdCmp.ONE_TARGET_SAME_TARGET_TYPE, targetType: 'text', template: 'I.waitForText({{{target}}});' },
            { action: 'wait', comp: CmdCmp.ONE_VALUE_SAME_OPTION, options: ['text'], template: 'I.waitForText({{{value}}});' },
            { action: 'wait', comp: CmdCmp.ONE_TARGET_ONE_NUMBER, template: 'I.waitForElement({{{target}}}, {{{value}}});' },
            { action: 'wait', comp: CmdCmp.ONE_TARGET, template: 'I.waitForElement({{{target}}});' },
            { action: 'wait', comp: CmdCmp.ONE_NUMBER, template: 'I.wait({{{value}}});' },
        ];
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
    /**
     * Converts an abstract test script command into one or more lines of code.
     *
     * @param cmd Abstract test script command
     */
    map(cmd) {
        let cmdCfg = this.commands.find(cfg => this.areCompatible(cfg, cmd));
        if (!cmdCfg) {
            return [this.makeCommentWithCommand(cmd)];
        }
        return this.makeCommands(cmdCfg, cmd);
    }
    /**
     * Make one or more lines of code from the given command configuration and
     * abstract test script command.
     *
     * @param cfg Command configuration
     * @param cmd Abstract test script command
     * @returns Lines of code.
     */
    makeCommands(cfg, cmd) {
        const template = cfg.template + ' // ({{{location.line}}},{{{location.column}}}){{#comment}} {{{comment}}}{{/comment}}';
        const values = {
            target: !cmd.targets ? '' : this.targetsToParameters(cmd.targets),
            value: !cmd.values ? '' : this.valuesToParameters(cmd.values, cfg.valuesAsNonArray),
            location: cmd.location,
            comment: cmd.comment,
            modifier: cmd.modifier,
            options: cmd.options,
        };
        return [mustache_1.render(template, values)];
    }
    /**
     * Make a code comment with the data of a abstract test script command.
     *
     * @param cmd Abstract test script command
     */
    makeCommentWithCommand(cmd) {
        let s = '// ';
        for (let prop in cmd) {
            let val = cmd[prop];
            if (Array.isArray(val)) {
                if (0 === val.length) {
                    val = '[]';
                }
                else {
                    val = '[ "' + val.join('", "') + '" ]';
                }
            }
            else if (undefined === val) {
                continue;
            }
            else {
                val = '"' + (val || '') + '"';
            }
            s += prop.substr(0, 1).toUpperCase() + prop.substr(1) + ': ' + val + '  ';
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
    areCompatible(cfg, cmd) {
        if (cfg.action !== cmd.action) {
            return false;
        }
        function isNumber(x) {
            return 'number' === typeof x || !isNaN(parseInt(x));
        }
        function sameTargetTypes(cfg, cmd) {
            return (cmd.targetTypes || []).indexOf(cfg.targetType) >= 0;
        }
        function includeOptions(from, into) {
            let targetOptions = into.options || [];
            for (let o of from.options || []) {
                if (targetOptions.indexOf(o) < 0) {
                    return false; // not found
                }
            }
            return true; // all options of cfg were found at cmd
        }
        const valuesCount = (cmd.values || []).length;
        const targetsCount = (cmd.targets || []).length;
        switch (cfg.comp) {
            case CmdCmp.ONE_VALUE: return 1 === valuesCount;
            case CmdCmp.ONE_VALUE_SAME_TARGET_TYPE: {
                return 1 === valuesCount && sameTargetTypes(cfg, cmd);
            }
            case CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER: {
                return 1 === valuesCount && sameTargetTypes(cfg, cmd) &&
                    cfg.modifier === cmd.modifier;
            }
            case CmdCmp.ONE_VALUE_SAME_OPTION: {
                return 1 === valuesCount && includeOptions(cfg, cmd);
            }
            case CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER: {
                return 1 === valuesCount && includeOptions(cfg, cmd) &&
                    cfg.modifier === cmd.modifier;
            }
            case CmdCmp.ONE_VALUE_OR_ARRAY: return valuesCount >= 1;
            case CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_TARGET_TYPE: {
                const ok = 2 === valuesCount && isNumber(cmd.values[1]) &&
                    sameTargetTypes(cfg, cmd);
                if (ok) {
                    cmd.values[1] = Number(cmd.values[1]);
                }
                return ok;
            }
            case CmdCmp.ONE_VALUE_SAME_MODIFIER: {
                return 1 === valuesCount && cmd.modifier === cfg.modifier;
            }
            case CmdCmp.ONE_NUMBER: {
                const ok = 1 === valuesCount && isNumber(cmd.values[0]);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                }
                return ok;
            }
            case CmdCmp.ONE_TARGET: return 1 === targetsCount;
            case CmdCmp.ONE_TARGET_ONE_VALUE: {
                return 1 === targetsCount && 1 === valuesCount;
            }
            case CmdCmp.ONE_TARGET_ONE_NUMBER: {
                const ok = 1 === targetsCount && 1 === valuesCount &&
                    isNumber(cmd.values[0]);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                }
                return ok;
            }
            case CmdCmp.ONE_TARGET_SAME_TARGET_TYPE: {
                return 1 === targetsCount && sameTargetTypes(cfg, cmd);
            }
            case CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER: {
                return 1 === targetsCount && sameTargetTypes(cfg, cmd) &&
                    includeOptions(cfg, cmd) && cfg.modifier === cmd.modifier;
            }
            case CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER: {
                return 1 === targetsCount && 1 === valuesCount && sameTargetTypes(cfg, cmd) &&
                    cfg.modifier === cmd.modifier;
            }
            case CmdCmp.ONE_TARGET_SAME_OPTION: {
                return 1 === targetsCount && includeOptions(cfg, cmd);
            }
            case CmdCmp.ONE_TARGET_SAME_MODIFIER: {
                return 1 === targetsCount && cfg.modifier === cmd.modifier;
            }
            case CmdCmp.SAME_TARGET_TYPE: {
                return 0 === targetsCount && 0 === valuesCount && sameTargetTypes(cfg, cmd);
            }
            case CmdCmp.SAME_OPTION: {
                return 0 === targetsCount && 0 === valuesCount && includeOptions(cfg, cmd);
            }
            case CmdCmp.TWO_TARGETS: {
                return 2 === targetsCount;
            }
        }
        return false;
    }
    /**
     * Convert targets to function parameters.
     *
     * @param targets Targets to convert, usually UI literals.
     */
    targetsToParameters(targets) {
        if (0 === targets.length) {
            return '';
        }
        const areStrings = 'string' === typeof targets[0];
        if (areStrings) {
            let strTargets = targets;
            if (1 === targets.length) {
                return this.convertSingleTarget(strTargets[0]);
            }
            return strTargets.map(this.convertSingleTarget).join(', ');
        }
        function valueReplacer(key, value) {
            if (typeof value === 'string' && value.charAt(0) === '@') {
                return { name: value.substr(1) };
            }
            return value;
        }
        const content = JSON.stringify(targets, valueReplacer);
        // remove [ and ]
        return content.substring(1, content.length - 1);
    }
    convertSingleTarget(target) {
        return target.charAt(0) === '@' ? `{name: "${target.substr(1)}"}` : `"${target}"`;
    }
    /**
     * Convert values to function parameters.
     *
     * @param values Values to convert.
     * @param valueAsNonArrayWhenGreaterThanOne Whether wants to convert an
     *      array to single values when its size is greater than one.
     */
    valuesToParameters(values, valueAsNonArrayWhenGreaterThanOne = false) {
        if (0 === values.length) {
            return '';
        }
        if (1 === values.length) {
            return this.convertSingleValue(values[0]);
        }
        const joint = values.map(this.convertSingleValue).join(', ');
        if (!valueAsNonArrayWhenGreaterThanOne) {
            return '[' + joint + ']';
        }
        return joint;
    }
    convertSingleValue(value) {
        return typeof value === 'string' ? `"${value}"` : value;
    }
}
exports.CommandMapper = CommandMapper;
//# sourceMappingURL=CommandMapper.js.map