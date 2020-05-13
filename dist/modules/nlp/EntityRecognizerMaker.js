"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bravey = require("../../lib/bravey"); // .js file
const cloneRegExp = require("clone-regexp");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
// import { expressionsOf, joinExpressions, propertyByMatch, datePropertyToDate, prefixedRegex, extractNumberFromPrefixedMatch } from './DateTimeExpressions';
// import { LocalDate, DateTimeFormatter } from '@js-joda/core';
//
// REGEXES
//  - all of them have /g
//  - It is recommended to clone before using, because of lastIndex when using exec()
//
exports.VALUE_REGEX = /"(?:[^"\\]|\\.)*"/g;
// export const UI_ELEMENT_REF_REGEX = new RegExp( '\{[a-zA-ZÀ-ÖØ-öø-ÿ][^|<\r\n\>\}]*\}', 'g' );
exports.UI_ELEMENT_REF_REGEX = /\{[a-zA-ZÀ-ÖØ-öø-ÿ][^|<\r\n\>\}]*\}/g;
// export const UI_PROPERTY_REF_REGEX = new RegExp( '\\{[ ]*[a-zA-ZÀ-ÖØ-öø-ÿ]+[a-zA-ZÀ-ÖØ-öø-ÿ ]*\\:?[a-zA-ZÀ-ÖØ-öø-ÿ ]*\\|[a-zA-ZÀ-ÖØ-öø-ÿ ]+\\}', 'g' );
exports.UI_PROPERTY_REF_REGEX = /\{[ ]*[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*(\:[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*)?\|[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ ]+\}/g;
// export const UI_LITERAL_REGEX = /(?:\<)((?:#|@|\.|\/\/|~|[a-zA-ZÀ-ÖØ-öø-ÿ])[^<\r\n\>]*)(?:\>)/g;
// export const UI_LITERAL_REGEX = /(?:\<)((?:#|@|\.|\/\/|~|[a-zA-ZÀ-ÖØ-öø-ÿ])[^<\r\n]*)(?:\>)/g; // Issue #19
exports.UI_LITERAL_REGEX = /(?:\<)((?:#|@|\.|\/\/|~|[a-zA-ZÀ-ÖØ-öø-ÿ0-9 ]?)[^<\r\n]*[^\\>])(?:\>)/g;
exports.NUMBER_REGEX = /(-?[0-9]+(?:\.[0-9]+)?)/g;
// export const NUMBER_REGEX = /(?:[ ,\[]|^)(-?[0-9]+(?:\.[0-9]+)?)/g; // Last addition to not consider the invalid seconds of a time as being a number
// export const QUERY_REGEX = new RegExp( '"(?:\t| )*SELECT[^"]+"', "gi" );
exports.QUERY_REGEX = /"(?:\t| )*SELECT[^"]+"/gi;
exports.CONSTANT_REGEX = /\[[a-zA-ZÀ-ÖØ-öø-ÿ_][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*\]/g;
// export const VALUE_LIST_REGEX = /\[(?: )*((?:,) ?|([0-9]+(\.[0-9]+)?|\"(.*[^\\])\"))+(?: )*\]/g;
// export const VALUE_LIST_REGEX = /(\[[\t ]*([^\]])*[\t ]*[^\\]\])+/g; // only [ anything ]
// export const VALUE_LIST_REGEX = /(?:\[[\t ]*)(("[^"]*"|(-?[0-9]+(\.[0-9]+)?))*,?[\t ]?)+[^\]]?(?:\])/g; // [ value or number ]
exports.VALUE_LIST_REGEX = /(?:\[[\t ]*)(("(\\"|[^"])+"|(-?[0-9]+(\.[0-9]+)?))+,?[\t ]?)+[^\]]?(?:\])/g; // [ value or number ]
exports.STATE_REGEX = /\~[a-zA-ZÀ-ÖØ-öø-ÿ_][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*\~/g;
exports.COMMAND_REGEX = /'(?:[^'\\]|\\.)*'/g;
/**
 * EntityRecognizer maker
 *
 * @author Thiago Delgado Pinto
 */
class EntityRecognizerMaker {
    /**
     * Creates a recognizer for values between quotes.
     *
     * Example: I fill "name" with "Bob"
     * --> The words "name" and "Bob" are recognized (without quotes).
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    makeValue(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.VALUE_REGEX);
        valueRec.addMatch(regex, function (match) {
            const value = match[0] || '';
            return value.substring(1, value.length - 1); // exclude quotes
        }, 100 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for references to UI Elements.
     *
     * Example 1: I fill {Name} with "Bob"
     *        --> The text "Name" is recognized (without quotes).
     *
     * Example 2: I fill {My Feature:Year} with "Bob"
     *        --> The text "My Feature:Year" is recognized (without quotes).
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    makeUIElementReference(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.UI_ELEMENT_REF_REGEX);
        valueRec.addMatch(regex, function (match) {
            //console.log( 'match: ', match );
            return match.toString().replace('{', '').replace('}', '');
        }, 100 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for references to UI Properties.
     *
     * Example 1: I fill {Foo} with {Name|value}
     *
     *  --> The ext "Name|value" is recognized (without quotes).
     *
     * Example 2: I fill {Foo} with {My Feature:Name|value}
     *
     *  --> The ext "My Feature:Name|value" is recognized (without quotes).
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    makeUIPropertyReference(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.UI_PROPERTY_REF_REGEX);
        valueRec.addMatch(regex, function (match) {
            const value = match[0] || '';
            return value.substring(1, value.length - 1).trim(); // exclude { and } and trim
        }, 100 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for values between < and >, with restrictions.
     *
     * Example: I fill <username> with "Bob"
     * --> The word "username" is recognized (without quotes).
     *
     * Supported formats: <id>, <#id>, <@name>, <.css>, <//xpath>, and <~mobilename>.
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    makeUILiteral(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.UI_LITERAL_REGEX);
        valueRec.addMatch(regex, function (match) {
            //console.log( 'match: ', match );
            return match[1].toString();
        }, 100 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for a number.
     *
     * Example: I fill {Name} with -10.33
     * --> The value -10.33 is recognized.
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    makeNumber(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.NUMBER_REGEX);
        valueRec.addMatch(regex, function (match) {
            // console.log( 'match ', match );
            // return match[ 0 ].toString().trim();
            const value = match[0].toString().trim();
            return Number(value);
        }, 10 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for values that start with select.
     *
     * Example: - value comes from the query "SELECT * FROM users"
     * --> The value "SELECT * FROM users" (without quotes) is recognized.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeQuery(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.QUERY_REGEX);
        valueRec.addMatch(regex, function (match) {
            // return match.toString().replace( /["]+/g, '' ).trim();
            const content = match.toString();
            return content.substring(1, content.length - 1).trim();
        }, 200 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for Constant references in the format [name].
     * A Constant name should not:
     * - be a number, e.g., [1] is invalid.
     * - have a dollar sign, e.g., [Foo$] is invalid.
     * - have spaces around, e.g., [ Foo ] is invalid.
     * - have quotes, e.g., [Foo"] is invalid.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeConstant(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.CONSTANT_REGEX);
        valueRec.addMatch(regex, function (match) {
            const value = match[0].toString();
            return value.substring(1, value.length - 1); // exclude '[' and ']'
        }, 10 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for a list of values, in the format [ 1, "hello", 2, "hi \"Jane\"!" ]
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeValueList(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.VALUE_LIST_REGEX);
        valueRec.addMatch(regex, function (match) {
            // console.log( 'match: ', match );
            // return match[ 0 ].toString().trim();
            let content = match[0].toString().trim();
            content = content.substring(1, content.length - 1); // Remove [ and ]
            const contentRegex = /(((-?[0-9]+(?:\.[0-9]+)?)|"(\\"|[^"])+"))+/g;
            let values = [];
            let result;
            while ((result = contentRegex.exec(content)) !== undefined) {
                if (null === result) {
                    break;
                }
                const v = result[0];
                if (v.startsWith('"')) {
                    values.push(v.substring(1, v.length - 1)); // Remove quotes
                }
                else {
                    values.push(ValueTypeDetector_1.adjustValueToTheRightType(v));
                }
            }
            // console.log( "VALUES:", values );
            return values;
        }, 1000 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for State references in the format ~name~.
     * A State name should not:
     * - be a number, e.g., [1] is invalid.
     * - have a dollar sign, e.g., [Foo$] is invalid.
     * - have spaces around, e.g., [ Foo ] is invalid.
     * - have quotes, e.g., [Foo"] is invalid.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeState(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.STATE_REGEX);
        valueRec.addMatch(regex, function (match) {
            const value = match[0].toString();
            return value.substring(1, value.length - 1); // exclude '~' and '~'
        }, 10 // priority
        );
        return valueRec;
    }
    /**
     * Creates a recognizer for values between single quotes
     *
     * Example: I run the command 'DELETE FROM users'
     * --> the value 'DELETE FROM users' (without single quotes) is recognized.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    makeCommand(entityName) {
        let valueRec = new Bravey.RegexEntityRecognizer(entityName, 10);
        let regex = cloneRegExp(exports.COMMAND_REGEX);
        valueRec.addMatch(regex, function (match) {
            const content = match.toString();
            return content.substring(1, content.length - 1).trim();
        }, 500 // priority
        );
        return valueRec;
    }
    // public makeDate2( language: string, entityName: string ): any {
    //     let valueRec = new Bravey.RegexEntityRecognizer( entityName, 100 );
    //     const dateFormatter = DateTimeFormatter.ofPattern( 'yyyy-MM-dd' );
    //     // "static" expressions, e.g. yesterday
    //     const expressions = expressionsOf( language );
    //     const exp: string = joinExpressions( expressions.date );
    //     valueRec.addMatch(
    //         new RegExp( exp, 'gi' ),
    //         function( match ) {
    //             const content = match[ 0 ];
    //             const property = propertyByMatch( content, expressions.date );
    //             const date = datePropertyToDate( property );
    //             return date.format( dateFormatter ).toString();
    //         },
    //         10 // priority
    //     );
    //     // // "dynamic" expressions, e.g. 1 day ago
    //     // const dynExp = '(last|next)?([0-9]+)( )+(days?|months?|weeks?|semesters?|years?)( )*(ago|in the past|from now|from today|ahead|later|in the future)?';
    //     // valueRec.addMatch(
    //     //     new RegExp( dynExp, 'gi' ),
    //     //     function( match ) {
    //     //         const content = match[ 0 ];
    //     //         const property = propertyByMatch( content, expressions.date );
    //     //         const date = datePropertyToDate( property );
    //     //         return date.format( DateTimeFormatter.ofPattern( 'yyyy-MM-dd' ) ).toString();
    //     //     },
    //     //     10 // priority
    //     // );
    //     // DYNAMIC
    //     // year - past
    //     valueRec.addMatch(
    //         prefixedRegex( expressions.pastModificators.prefix, expressions.datePeriod.year ),
    //         function ( match: RegExpExecArray ) {
    //             const number = extractNumberFromPrefixedMatch( match );
    //             return LocalDate.now().minusYears( number )
    //                 .format( dateFormatter ).toString();
    //         },
    //         100 // priority
    //     );
    //     return valueRec;
    // }
    /**
     * Creates a date recognizer.
     *
     * @param language Language of the recognizer. Available: "en", "pt", "it"
     * @param entityName Entity name
     */
    makeDate(language, entityName) {
        const lang = this.braveyLanguage(language);
        return new lang.DateEntityRecognizer(entityName);
    }
    /**
     * Creates a time recognizer.
     *
     * @param language Language of the recognizer. Available: "en", "pt", "it"
     * @param entityName Entity name
     */
    makeTime(language, entityName) {
        const lang = this.braveyLanguage(language);
        return new lang.TimeEntityRecognizer2(entityName);
    }
    // /**
    //  * Creates a time period recognizer.
    //  *
    //  * @param language Language of the recognizer. Available: "en", "pt", "it"
    //  * @param entityName Entity name
    //  */
    // public makeTimePeriod( language: string, entityName: string ): any {
    //     const lang = this.braveyLanguage( language );
    //     return new lang.TimePeriodEntityRecognizer( entityName, 10 );
    // }
    //
    // Helper methods
    //
    /**
     * Returns a Bravey language object according to the given language.
     * If the language is not found, it returns the detector for English.
     *
     * @param language
     * @return Bravey.Language
     */
    braveyLanguage(language) {
        const lang = language.substr(0, 2).toUpperCase();
        return Bravey.Language[lang] || Bravey.Language['EN'];
    }
}
exports.EntityRecognizerMaker = EntityRecognizerMaker;
