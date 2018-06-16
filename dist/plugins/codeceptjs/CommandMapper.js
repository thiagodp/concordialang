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
    CmdCmp[CmdCmp["ONE_VALUE_ONE_NUMBER_SAME_OPTION"] = 7] = "ONE_VALUE_ONE_NUMBER_SAME_OPTION";
    CmdCmp[CmdCmp["ONE_VALUE_TWO_NUMBERS_SAME_OPTION"] = 8] = "ONE_VALUE_TWO_NUMBERS_SAME_OPTION";
    CmdCmp[CmdCmp["ONE_VALUE_SAME_MODIFIER"] = 9] = "ONE_VALUE_SAME_MODIFIER";
    CmdCmp[CmdCmp["ONE_VALUE_TWO_NUMBERS"] = 10] = "ONE_VALUE_TWO_NUMBERS";
    CmdCmp[CmdCmp["ONE_VALUE_THREE_NUMBERS"] = 11] = "ONE_VALUE_THREE_NUMBERS";
    CmdCmp[CmdCmp["ONE_NUMBER"] = 12] = "ONE_NUMBER";
    CmdCmp[CmdCmp["ONE_TARGET"] = 13] = "ONE_TARGET";
    CmdCmp[CmdCmp["ONE_TARGET_ONE_VALUE"] = 14] = "ONE_TARGET_ONE_VALUE";
    CmdCmp[CmdCmp["ONE_TARGET_ONE_NUMBER"] = 15] = "ONE_TARGET_ONE_NUMBER";
    CmdCmp[CmdCmp["ONE_TARGET_TWO_NUMBERS_SAME_OPTION"] = 16] = "ONE_TARGET_TWO_NUMBERS_SAME_OPTION";
    CmdCmp[CmdCmp["ONE_TARGET_SAME_TARGET_TYPE"] = 17] = "ONE_TARGET_SAME_TARGET_TYPE";
    CmdCmp[CmdCmp["ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER"] = 18] = "ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER";
    CmdCmp[CmdCmp["ONE_TARGET_ONE_VALUE_ONE_OPTION_SAME_MODIFIER"] = 19] = "ONE_TARGET_ONE_VALUE_ONE_OPTION_SAME_MODIFIER";
    CmdCmp[CmdCmp["ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER"] = 20] = "ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER";
    CmdCmp[CmdCmp["ONE_TARGET_SAME_OPTION"] = 21] = "ONE_TARGET_SAME_OPTION";
    CmdCmp[CmdCmp["ONE_TARGET_SAME_MODIFIER"] = 22] = "ONE_TARGET_SAME_MODIFIER";
    CmdCmp[CmdCmp["SAME_TARGET_TYPE"] = 23] = "SAME_TARGET_TYPE";
    CmdCmp[CmdCmp["SAME_OPTION"] = 24] = "SAME_OPTION";
    CmdCmp[CmdCmp["TWO_TARGETS"] = 25] = "TWO_TARGETS";
    CmdCmp[CmdCmp["TWO_VALUES_SAME_OPTION"] = 26] = "TWO_VALUES_SAME_OPTION";
    CmdCmp[CmdCmp["TWO_NUMBERS"] = 27] = "TWO_NUMBERS";
    CmdCmp[CmdCmp["TWO_NUMBERS_SAME_OPTION"] = 28] = "TWO_NUMBERS_SAME_OPTION";
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
            case CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_OPTION: {
                const ok = 2 === valuesCount && isNumber(cmd.values[1]) &&
                    includeOptions(cfg, cmd);
                if (ok) {
                    cmd.values[1] = Number(cmd.values[1]);
                }
                return ok;
            }
            case CmdCmp.ONE_VALUE_TWO_NUMBERS_SAME_OPTION: {
                const ok = 3 === valuesCount && isNumber(cmd.values[1]) &&
                    isNumber(cmd.values[2]) && includeOptions(cfg, cmd);
                if (ok) {
                    cmd.values[1] = Number(cmd.values[1]);
                    cmd.values[2] = Number(cmd.values[2]);
                }
                return ok;
            }
            case CmdCmp.ONE_VALUE_SAME_MODIFIER: {
                return 1 === valuesCount && cmd.modifier === cfg.modifier;
            }
            case CmdCmp.ONE_VALUE_TWO_NUMBERS: {
                const ok = 3 === valuesCount && isNumber(cmd.values[1]) &&
                    isNumber(cmd.values[2]);
                if (ok) {
                    cmd.values[1] = Number(cmd.values[1]);
                    cmd.values[2] = Number(cmd.values[2]);
                }
                return ok;
            }
            case CmdCmp.ONE_VALUE_THREE_NUMBERS: {
                const ok = 4 === valuesCount && isNumber(cmd.values[1]) &&
                    isNumber(cmd.values[2]) && isNumber(cmd.values[3]);
                if (ok) {
                    cmd.values[1] = Number(cmd.values[1]);
                    cmd.values[2] = Number(cmd.values[2]);
                    cmd.values[3] = Number(cmd.values[3]);
                }
                return ok;
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
            case CmdCmp.ONE_TARGET_TWO_NUMBERS_SAME_OPTION: {
                const ok = 1 === targetsCount && 2 === valuesCount &&
                    isNumber(cmd.values[0]) && isNumber(cmd.values[1]) &&
                    includeOptions(cfg, cmd);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                    cmd.values[1] = Number(cmd.values[1]);
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
            case CmdCmp.ONE_TARGET_ONE_VALUE_ONE_OPTION_SAME_MODIFIER: {
                return 1 === targetsCount && 1 === valuesCount &&
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
            case CmdCmp.TWO_VALUES_SAME_OPTION: {
                return 2 == valuesCount && includeOptions(cfg, cmd);
            }
            case CmdCmp.TWO_NUMBERS: {
                let ok = 2 == valuesCount && isNumber(cmd.values[0]) &&
                    isNumber(cmd.values[1]);
                if (ok) {
                    cmd.values[0] = Number(cmd.values[0]);
                    cmd.values[1] = Number(cmd.values[1]);
                }
                return ok;
            }
            case CmdCmp.TWO_NUMBERS_SAME_OPTION: {
                let ok = 2 == valuesCount && isNumber(cmd.values[0]) &&
                    isNumber(cmd.values[1]) && includeOptions(cfg, cmd);
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
