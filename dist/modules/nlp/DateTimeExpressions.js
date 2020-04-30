"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@js-joda/core");
const PT = {
    "date": {
        "lastYear": "ano passado|ano anterior",
        "lastSemester": "semestre passado|semestre anterior",
        "lastMonth": "mês passado|mes passado|mês anterior|mes anterior",
        "lastWeek": "semana passada",
        "theDayBeforeYesterday": "anteontem|antes de ontem",
        "yesterday": "ontem",
        "today": "hoje|data atual",
        "tomorrow": "amanhã|amanha",
        "theDayAfterTomorrow": "depois de amanhã|depois de amanha",
        "nextWeek": "semana que vem",
        "nextMonth": "mês que vem|mes que vem|próximo mês|proximo mes",
        "nextSemester": "semestre que vem",
        "nextYear": "ano que vem"
    },
    "datePeriod": {
        "day": "dia|dias",
        "week": "semana|semanas",
        "month": "mês|mes|meses",
        "semester": "semestre|semestres",
        "year": "ano|anos"
    },
    "pastModificators": {
        "prefix": "no passado",
        "suffix": "atrás"
    },
    "futureModificators": {
        "prefix": "daqui|em|próximo|proximo|próximos|proximos",
        "suffix": "adiante|à frente|a frente|no futuro"
    }
};
const EN = {
    "date": {
        "lastYear": "last year",
        "lastSemester": "last semester",
        "lastMonth": "last month",
        "lastWeek": "last week",
        "theDayBeforeYesterday": "the day before yesterday",
        "yesterday": "yesterday",
        "today": "today|current date",
        "tomorrow": "tomorrow",
        "theDayAfterTomorrow": "the day after tomorrow",
        "nextWeek": "next week",
        "nextMonth": "next month",
        "nextSemester": "next semester",
        "nextYear": "next year"
    },
    "datePeriod": {
        "day": "day|days",
        "week": "week|weeks",
        "month": "month|months",
        "semester": "semester|semesters",
        "year": "year|years"
    },
    "pastModificators": {
        "prefix": "last|past",
        "suffix": "ago"
    },
    "futureModificators": {
        "prefix": "next",
        "suffix": "ahead|from today|in the future"
    }
};
const DATE_TIME_EXPRESSIONS = {
    "pt": PT,
    "en": EN
};
function expressionsOf(language) {
    return DATE_TIME_EXPRESSIONS[language] || DATE_TIME_EXPRESSIONS['en'];
}
exports.expressionsOf = expressionsOf;
function joinExpressions(expressions) {
    let exp = [];
    for (const prop in expressions) {
        exp.push(expressions[prop]);
    }
    return exp.join('|');
}
exports.joinExpressions = joinExpressions;
function propertyByMatch(match, expressions) {
    for (const prop in expressions) {
        const ok = expressions[prop].split('|')
            .find((value) => value == match);
        if (ok) {
            return prop;
        }
    }
    return null;
}
exports.propertyByMatch = propertyByMatch;
function datePropertyToDate(property) {
    let date = core_1.LocalDate.now();
    switch (property) {
        case "lastYear": return date.minusYears(1);
        case "lastSemester": return date.minusMonths(6);
        case "lastMonth": return date.minusMonths(1);
        case "lastWeek": return date.minusDays(7);
        case "theDayBeforeYesterday": return date.minusDays(2);
        case "yesterday": return date.minusDays(1);
        case "today": break;
        case "tomorrow": return date.plusDays(1);
        case "theDayAfterTomorrow": return date.plusDays(2);
        case "nextWeek": return date.plusDays(7);
        case "nextMonth": return date.plusMonths(1);
        case "nextSemester": return date.plusMonths(6);
        case "nextYear": return date.plusYears(1);
    }
    return date;
}
exports.datePropertyToDate = datePropertyToDate;
const EN_DYNAMIC_DATE = {
    "pastPrefix": "last",
    "pastSuffix": "ago|in the past",
    "day": "days?",
    "week": "weeks?",
    "month": "months?",
    "semester": "semesters?",
    "year": "years?",
    "futurePrefix": "next",
    "futureSuffix": "from now|from today|ahead|later|in the future"
};
const PT_DYNAMIC_DATE = {
    "pastPrefix": "h[áa]",
    "futurePrefix": "daqui",
    "day": "dias?",
    "week": "semanas?",
    "month": "m[êe]s",
    "semester": "semestres?",
    "year": "anos?",
    "pastSuffix": "atr[áa]s",
    "futureSuffix": "[àa] frente|adiante"
};
function makePrefixedDDE(dde, prefix, period) {
    return `(${dde[prefix]})([0-9]+)(?: )+(${dde[period]})`;
    // groups:    0            1      2          3
}
exports.makePrefixedDDE = makePrefixedDDE;
function makeSuffixedDDE(dde, suffix, period) {
    return `([0-9]+)(?: )+(${dde[period]})(?: )*(${dde[suffix]})`;
    // groups:  0     1       2            3          4
}
exports.makeSuffixedDDE = makeSuffixedDDE;
function extractPrefixedDDE(match, past) {
    const [, number, , period] = match;
    switch (period) {
    }
    return null;
}
exports.extractPrefixedDDE = extractPrefixedDDE;
function prefixedRegex(prefix, periodValue) {
    return new RegExp(`(${prefix})(?: )+([0-9]+)(?: )+(${periodValue})`, 'i');
    // groups:               0       1      2      3          4
}
exports.prefixedRegex = prefixedRegex;
function extractNumberFromPrefixedMatch(match) {
    const [, , number] = match;
    return Number(number);
}
exports.extractNumberFromPrefixedMatch = extractNumberFromPrefixedMatch;
function suffixedRegex(suffix, periodValue) {
    return new RegExp(`([0-9]+)(?: )+(${periodValue})(?: )*(${suffix})`, 'i');
    // groups:             0      1         2           3         4
}
exports.suffixedRegex = suffixedRegex;
function extractNumberFromSuffixedMatch(match) {
    const [number] = match;
    return Number(number);
}
exports.extractNumberFromSuffixedMatch = extractNumberFromSuffixedMatch;
