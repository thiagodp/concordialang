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
    CmdCmp[CmdCmp["ONE_VALUE__OR_ARRAY"] = 1] = "ONE_VALUE__OR_ARRAY";
    CmdCmp[CmdCmp["ONE_VALUE__ONE_NUMBER"] = 2] = "ONE_VALUE__ONE_NUMBER";
    CmdCmp[CmdCmp["ONE_VALUE__TWO_NUMBERS"] = 3] = "ONE_VALUE__TWO_NUMBERS";
    CmdCmp[CmdCmp["ONE_VALUE__THREE_NUMBERS"] = 4] = "ONE_VALUE__THREE_NUMBERS";
    CmdCmp[CmdCmp["ONE_VALUE__ONE_TARGET"] = 5] = "ONE_VALUE__ONE_TARGET";
    CmdCmp[CmdCmp["ONE_NUMBER"] = 6] = "ONE_NUMBER";
    CmdCmp[CmdCmp["ONE_TARGET"] = 7] = "ONE_TARGET";
    CmdCmp[CmdCmp["ONE_TARGET__ONE_VALUE"] = 8] = "ONE_TARGET__ONE_VALUE";
    CmdCmp[CmdCmp["ONE_TARGET__ONE_NUMBER"] = 9] = "ONE_TARGET__ONE_NUMBER";
    CmdCmp[CmdCmp["SAME_TARGET_TYPE"] = 10] = "SAME_TARGET_TYPE";
    CmdCmp[CmdCmp["SAME_TARGET_TYPE__ONE_VALUE"] = 11] = "SAME_TARGET_TYPE__ONE_VALUE";
    CmdCmp[CmdCmp["SAME_TARGET_TYPE__ONE_VALUE_ONE_NUMBER"] = 12] = "SAME_TARGET_TYPE__ONE_VALUE_ONE_NUMBER";
    CmdCmp[CmdCmp["SAME_TARGET_TYPE__ONE_TARGET"] = 13] = "SAME_TARGET_TYPE__ONE_TARGET";
    CmdCmp[CmdCmp["SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER"] = 14] = "SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER";
    CmdCmp[CmdCmp["SAME_OPTION"] = 15] = "SAME_OPTION";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_NUMBER"] = 16] = "SAME_OPTION__ONE_NUMBER";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_VALUE"] = 17] = "SAME_OPTION__ONE_VALUE";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_VALUE__ONE_NUMBER"] = 18] = "SAME_OPTION__ONE_VALUE__ONE_NUMBER";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_TARGET"] = 19] = "SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_TARGET";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_VALUE"] = 20] = "SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_VALUE";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_VALUE__TWO_NUMBERS"] = 21] = "SAME_OPTION__ONE_VALUE__TWO_NUMBERS";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_TARGET"] = 22] = "SAME_OPTION__ONE_TARGET";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_TARGET__ONE_NUMBER"] = 23] = "SAME_OPTION__ONE_TARGET__ONE_NUMBER";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_TARGET__TWO_NUMBERS"] = 24] = "SAME_OPTION__ONE_TARGET__TWO_NUMBERS";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_TARGET__ONE_VALUE"] = 25] = "SAME_OPTION__ONE_TARGET__ONE_VALUE";
    CmdCmp[CmdCmp["SAME_OPTION__ONE_TARGET__ONE_VALUE__ONE_NUMBER"] = 26] = "SAME_OPTION__ONE_TARGET__ONE_VALUE__ONE_NUMBER";
    CmdCmp[CmdCmp["SAME_MODIFIER__ONE_VALUE"] = 27] = "SAME_MODIFIER__ONE_VALUE";
    CmdCmp[CmdCmp["SAME_MODIFIER__ONE_TARGET"] = 28] = "SAME_MODIFIER__ONE_TARGET";
    CmdCmp[CmdCmp["SAME_MODIFIER__SAME_OPTION__ONE_VALUE"] = 29] = "SAME_MODIFIER__SAME_OPTION__ONE_VALUE";
    CmdCmp[CmdCmp["SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE"] = 30] = "SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE";
    CmdCmp[CmdCmp["SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET"] = 31] = "SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET";
    CmdCmp[CmdCmp["SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE"] = 32] = "SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE";
    CmdCmp[CmdCmp["SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE"] = 33] = "SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE";
    CmdCmp[CmdCmp["TWO_TARGETS"] = 34] = "TWO_TARGETS";
    CmdCmp[CmdCmp["TWO_VALUES_SAME_OPTION"] = 35] = "TWO_VALUES_SAME_OPTION";
    CmdCmp[CmdCmp["TWO_NUMBERS"] = 36] = "TWO_NUMBERS";
    CmdCmp[CmdCmp["TWO_NUMBERS_SAME_OPTION"] = 37] = "TWO_NUMBERS_SAME_OPTION";
})(CmdCmp = exports.CmdCmp || (exports.CmdCmp = {}));
/**
 * Command mapper
 *
 * @author Thiago Delgado Pinto
 */
class CommandMapper {
    constructor(commands) {
        this.commands = commands;
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
        // singleQuotedTargets defaults to true if undefined
        if (undefined === cfg.singleQuotedTargets) {
            cfg.singleQuotedTargets = true;
        }
        const COMMENT_TEMPLATE = ' // ({{{location.line}}},{{{location.column}}}){{#comment}} {{{comment}}}{{/comment}}';
        if (!!cmd["db"] && cmd.action === 'connect') {
            const values = {
                value: ['"' + cmd.values[0] + '"', JSON.stringify(cmd["db"])],
                location: cmd.location,
                comment: cmd.comment,
            };
            const template = cfg.template + COMMENT_TEMPLATE;
            return [mustache_1.render(template, values)];
        }
        const template = cfg.template + COMMENT_TEMPLATE;
        const values = {
            target: !cmd.targets ? '' : this.targetsToParameters(cmd.targets, cfg.singleQuotedTargets),
            value: !cmd.values ? '' : this.valuesToParameters(cmd.values, cfg.valuesAsNonArray, cfg.singleQuotedValues),
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
        function oneValueThenNumbers(cmd, numberCount) {
            const valuesCount = numberCount + 1;
            if ((cmd.values || []).length !== valuesCount) {
                return false;
            }
            if (numberCount !== cmd.values.filter(isNumber).length) {
                return false;
            }
            let newArray = [];
            for (let i = 0; i < valuesCount; ++i) {
                if (isNumber(cmd.values[i])) {
                    newArray.push(Number(cmd.values[i]));
                }
                else {
                    newArray.unshift(cmd.values[i]);
                }
            }
            cmd.values = newArray;
            return true;
        }
        function oneValueThenOneNumber(cmd) {
            return oneValueThenNumbers(cmd, 1);
        }
        function oneValueThenTwoNumbers(cmd) {
            return oneValueThenNumbers(cmd, 2);
        }
        function oneValueThenThreeNumbers(cmd) {
            return oneValueThenNumbers(cmd, 3);
        }
        const valuesCount = (cmd.values || []).length;
        const targetsCount = (cmd.targets || []).length;
        switch (cfg.comp) {
            case CmdCmp.ONE_VALUE: {
                return 1 === valuesCount && !isNumber(cmd.values[0]);
            }
            case CmdCmp.SAME_TARGET_TYPE__ONE_VALUE: {
                return 1 === valuesCount &&
                    !isNumber(cmd.values[0]) &&
                    sameTargetTypes(cfg, cmd);
            }
            case CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_VALUE: {
                return 1 === valuesCount &&
                    !isNumber(cmd.values[0]) &&
                    sameTargetTypes(cfg, cmd) &&
                    cfg.modifier === cmd.modifier;
            }
            case CmdCmp.SAME_OPTION__ONE_NUMBER: {
                const ok = 1 === valuesCount &&
                    isNumber(cmd.values[0]) &&
                    includeOptions(cfg, cmd);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                }
                return ok;
            }
            case CmdCmp.SAME_OPTION__ONE_VALUE: {
                return 1 === valuesCount &&
                    !isNumber(cmd.values[0]) &&
                    includeOptions(cfg, cmd);
            }
            case CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_VALUE: {
                return 1 === valuesCount &&
                    !isNumber(cmd.values[0]) &&
                    includeOptions(cfg, cmd) &&
                    cfg.modifier === cmd.modifier;
            }
            case CmdCmp.ONE_VALUE__OR_ARRAY: {
                return valuesCount >= 1;
            }
            case CmdCmp.ONE_VALUE__ONE_NUMBER: {
                return oneValueThenOneNumber(cmd);
            }
            case CmdCmp.SAME_TARGET_TYPE__ONE_VALUE_ONE_NUMBER: {
                return sameTargetTypes(cfg, cmd) && oneValueThenOneNumber(cmd);
            }
            case CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER: {
                return includeOptions(cfg, cmd) && oneValueThenOneNumber(cmd);
            }
            case CmdCmp.SAME_MODIFIER__ONE_VALUE: {
                return 1 === valuesCount && cmd.modifier === cfg.modifier;
            }
            case CmdCmp.ONE_VALUE__TWO_NUMBERS: {
                return oneValueThenTwoNumbers(cmd);
            }
            case CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_TARGET: {
                return oneValueThenOneNumber(cmd) &&
                    1 === targetsCount &&
                    includeOptions(cfg, cmd);
            }
            case CmdCmp.SAME_OPTION__ONE_VALUE__ONE_NUMBER__ONE_VALUE: {
                if (3 !== valuesCount) {
                    return false;
                }
                const numberIndex = cmd.values.findIndex(isNumber);
                if (numberIndex < 0) {
                    return false;
                }
                // Transform to number
                cmd.values[numberIndex] = Number(cmd.values[numberIndex]);
                // Guarantee order -> index 1 is where the number must be placed
                if (0 === numberIndex) {
                    cmd.values = [cmd.values[1], cmd.values[0], cmd.values[2]];
                }
                else if (2 == numberIndex) {
                    cmd.values = [cmd.values[0], cmd.values[2], cmd.values[1]];
                }
                return true;
            }
            case CmdCmp.SAME_OPTION__ONE_VALUE__TWO_NUMBERS: {
                return includeOptions(cfg, cmd) && oneValueThenTwoNumbers(cmd);
            }
            case CmdCmp.ONE_VALUE__THREE_NUMBERS: {
                return oneValueThenThreeNumbers(cmd);
            }
            case CmdCmp.ONE_NUMBER: {
                const ok = 1 === valuesCount && isNumber(cmd.values[0]);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                }
                return ok;
            }
            case CmdCmp.ONE_TARGET: return 1 === targetsCount;
            case CmdCmp.ONE_VALUE__ONE_TARGET: ; // next
            case CmdCmp.ONE_TARGET__ONE_VALUE: {
                return 1 === targetsCount && 1 === valuesCount && !isNumber(cmd.values[0]);
            }
            case CmdCmp.ONE_TARGET__ONE_NUMBER: {
                const ok = 1 === targetsCount && 1 === valuesCount &&
                    isNumber(cmd.values[0]);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                }
                return ok;
            }
            case CmdCmp.SAME_OPTION__ONE_TARGET__ONE_NUMBER: {
                const ok = 1 === targetsCount && 1 === valuesCount &&
                    isNumber(cmd.values[0]) &&
                    includeOptions(cfg, cmd);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                }
                return ok;
            }
            case CmdCmp.SAME_TARGET_TYPE__ONE_TARGET__ONE_NUMBER: {
                const ok = 1 === targetsCount && 1 === valuesCount &&
                    isNumber(cmd.values[0]) &&
                    sameTargetTypes(cfg, cmd);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                }
                return ok;
            }
            case CmdCmp.SAME_OPTION__ONE_TARGET__TWO_NUMBERS: {
                const ok = 1 === targetsCount && 2 === valuesCount &&
                    isNumber(cmd.values[0]) &&
                    isNumber(cmd.values[1]) &&
                    includeOptions(cfg, cmd);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                    cmd.values[1] = Number(cmd.values[1]);
                }
                return ok;
            }
            case CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE: {
                return 1 === targetsCount &&
                    1 === valuesCount &&
                    includeOptions(cfg, cmd);
            }
            case CmdCmp.SAME_OPTION__ONE_TARGET__ONE_VALUE__ONE_NUMBER: {
                return 1 === targetsCount &&
                    includeOptions(cfg, cmd) &&
                    oneValueThenOneNumber(cmd);
            }
            case CmdCmp.SAME_TARGET_TYPE__ONE_TARGET: {
                return 1 === targetsCount && sameTargetTypes(cfg, cmd);
            }
            case CmdCmp.SAME_MODIFIER__SAME_OPTION__SAME_TARGET_TYPE__ONE_TARGET: {
                return 1 === targetsCount && sameTargetTypes(cfg, cmd) &&
                    includeOptions(cfg, cmd) &&
                    cfg.modifier === cmd.modifier;
            }
            case CmdCmp.SAME_MODIFIER__SAME_OPTION__ONE_TARGET__ONE_VALUE: {
                return 1 === targetsCount && 1 === valuesCount &&
                    !isNumber(cmd.values[0]) &&
                    includeOptions(cfg, cmd) &&
                    cfg.modifier === cmd.modifier;
            }
            case CmdCmp.SAME_MODIFIER__SAME_TARGET_TYPE__ONE_TARGET__ONE_VALUE: {
                return 1 === targetsCount && 1 === valuesCount &&
                    !isNumber(cmd.values[0]) &&
                    sameTargetTypes(cfg, cmd) &&
                    cfg.modifier === cmd.modifier;
            }
            case CmdCmp.SAME_OPTION__ONE_TARGET: {
                return 1 === targetsCount && includeOptions(cfg, cmd);
            }
            case CmdCmp.SAME_MODIFIER__ONE_TARGET: {
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
            case CmdCmp.TWO_VALUES_SAME_OPTION: {
                return 2 == valuesCount &&
                    !isNumber(cmd.values[0]) &&
                    !isNumber(cmd.values[1]) &&
                    includeOptions(cfg, cmd);
            }
            case CmdCmp.TWO_NUMBERS: {
                let ok = 2 == valuesCount &&
                    isNumber(cmd.values[0]) &&
                    isNumber(cmd.values[1]);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                    cmd.values[1] = Number(cmd.values[1]);
                }
                return ok;
            }
            case CmdCmp.TWO_NUMBERS_SAME_OPTION: {
                let ok = 2 == valuesCount &&
                    isNumber(cmd.values[0]) &&
                    isNumber(cmd.values[1]) &&
                    includeOptions(cfg, cmd);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                    cmd.values[1] = Number(cmd.values[1]);
                }
                return ok;
            }
        }
        return false;
    }
    /**
     * Convert targets to function parameters.
     *
     * @param targets Targets to convert, usually UI literals.
     * @param singleQuotedTargets Whether the targets should be wrapped with single quotes.
     */
    targetsToParameters(targets, singleQuotedTargets) {
        if (0 === targets.length) {
            return '';
        }
        const areStrings = 'string' === typeof targets[0];
        if (areStrings) {
            let strTargets = targets;
            if (1 === targets.length) {
                return this.convertSingleTarget(strTargets[0], singleQuotedTargets);
            }
            return strTargets
                .map(v => this.convertSingleTarget(v, singleQuotedTargets))
                .join(', ');
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
    convertSingleTarget(target, singleQuotedTargets) {
        const t = !singleQuotedTargets
            ? this.escapeDoubleQuotes(target)
            : this.escapeSingleQuotes(target);
        return !singleQuotedTargets
            ? t.charAt(0) === '@' ? `{name: "${t.substr(1)}"}` : `"${t}"`
            : t.charAt(0) === '@' ? `{name: '${t.substr(1)}'}` : `'${t}'`;
    }
    /**
     * Convert values to function parameters.
     *
     * @param values Values to convert.
     * @param valueAsNonArrayWhenGreaterThanOne Whether wants to convert an
     *      array to single values when its size is greater than one.
     * @param singleQuotedValues Whether is desired to use single quotes.
     */
    valuesToParameters(values, valueAsNonArrayWhenGreaterThanOne = false, singleQuotedValues = false) {
        if (0 === values.length) {
            return '';
        }
        if (1 === values.length) {
            return this.convertSingleValue(values[0], singleQuotedValues);
        }
        const joint = values
            .map(v => this.convertSingleValue(v, singleQuotedValues))
            .join(', ');
        if (!valueAsNonArrayWhenGreaterThanOne) {
            return '[' + joint + ']';
        }
        return joint;
    }
    convertSingleValue(value, singleQuotedValues = false) {
        if (typeof value === 'string') {
            const v = singleQuotedValues
                ? this.escapeSingleQuotes(value)
                : this.escapeDoubleQuotes(value);
            return singleQuotedValues ? `'${v}'` : `"${v}"`;
        }
        return value;
    }
    escapeDoubleQuotes(value) {
        return value.replace(/[^\\](")/g, (p1) => {
            return p1.substr(0, 1) + '\\"';
        });
    }
    escapeSingleQuotes(value) {
        return value.replace(/[^\\](')/g, (p1) => {
            return p1.substr(0, 1) + "\\'";
        });
    }
}
exports.CommandMapper = CommandMapper;
