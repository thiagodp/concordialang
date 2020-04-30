import { LocalDate } from "@js-joda/core";

/**
 * Date expressions
 *
 * @author Thiago Delgado Pinto
 *
 * Note: Values must be separated by pipe (`|`).
 *       Example: instead of `"m[êe]s"`, use `"mês|mes"`.
 */
export interface DateExpressions {
    lastYear: string;
    lastSemester: string;
    lastMonth: string;
    lastWeek: string;
    theDayBeforeYesterday: string;
    yesterday: string;
    today: string;
    tomorrow: string;
    theDayAfterTomorrow: string;
    nextWeek: string;
    nextMonth: string;
    nextSemester: string;
    nextYear: string;
}

export interface DateTimeExpressions {
    date: DateExpressions;
    datePeriod: DatePeriod;
    pastModificators: TimeModificators;
    futureModificators: TimeModificators;
}


const PT: DateTimeExpressions = {

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


const EN: DateTimeExpressions =  {

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

export function expressionsOf( language: string ): DateTimeExpressions {
    return DATE_TIME_EXPRESSIONS[ language ] || DATE_TIME_EXPRESSIONS[ 'en' ];
}

export function joinExpressions( expressions: DateExpressions ): string {
    let exp: string[] = [];
    for ( const prop in expressions ) {
        exp.push( expressions[ prop ] );
    }
    return exp.join( '|' );
}

export function propertyByMatch(
    match: string,
    expressions: DateExpressions | { [key: string]: string }
    ): string | null {
    for ( const prop in expressions ) {
        const ok = expressions[ prop ].split( '|' )
            .find( ( value ) => value == match );
        if ( ok ) {
            return prop;
        }
    }
    return null;
}

export function datePropertyToDate( property: string ): LocalDate {
    let date = LocalDate.now();
    switch ( property ) {
        case "lastYear": return date.minusYears( 1 );
        case "lastSemester": return date.minusMonths( 6 );
        case "lastMonth": return date.minusMonths( 1 );
        case "lastWeek": return date.minusDays( 7 );
        case "theDayBeforeYesterday": return date.minusDays( 2 );
        case "yesterday": return date.minusDays( 1 );
        case "today": break;
        case "tomorrow": return date.plusDays( 1 );
        case "theDayAfterTomorrow": return date.plusDays( 2 );
        case "nextWeek": return date.plusDays( 7 );
        case "nextMonth": return date.plusMonths( 1 );
        case "nextSemester": return date.plusMonths( 6 );
        case "nextYear": return date.plusYears( 1 );
    }
    return date;
}

// =====================================

// interface DDE {
//     pastYear: "(?:past)?([0-9]+) years? (?:ago|from today|from now)",
//     pastMonth: "(?:past)?([0-9]+) months? (?:ago|from today|from now)",
// }


interface DynamicDateExpressions {
    pastPrefix: string;
    futurePrefix: string;
    day: string;
    week: string;
    month: string;
    semester: string;
    year: string;
    pastSuffix: string;
    futureSuffix: string;
}

const EN_DYNAMIC_DATE: DynamicDateExpressions = {
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

const PT_DYNAMIC_DATE: DynamicDateExpressions = {
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


export function makePrefixedDDE(
    dde: DynamicDateExpressions,
    prefix: keyof DynamicDateExpressions & 'pastPrefix' | 'futurePrefix',
    period: keyof DynamicDateExpressions
): string {
    return `(${dde[prefix]})([0-9]+)(?: )+(${dde[period]})`;
    // groups:    0            1      2          3
}

export function makeSuffixedDDE(
    dde: DynamicDateExpressions,
    suffix: keyof DynamicDateExpressions & 'pastSuffix' | 'futureSuffix',
    period: keyof DynamicDateExpressions
): string {
    return `([0-9]+)(?: )+(${dde[period]})(?: )*(${dde[suffix]})`;
    // groups:  0     1       2            3          4
}

export function extractPrefixedDDE( match, past: boolean ): LocalDate {
    const [ , number, , period ] = match;
    switch ( period ) {

    }
    return null;
}


// =====================================


interface DatePeriod {
    day: string;
    week: string;
    month: string;
    semester: string;
    year: string;
}

interface TimeModificators {
    prefix: string;
    suffix: string;
}

export function prefixedRegex( prefix: string, periodValue: string ): RegExp {
    return new RegExp( `(${prefix})(?: )+([0-9]+)(?: )+(${periodValue})`, 'i' );
    // groups:               0       1      2      3          4
}

export function extractNumberFromPrefixedMatch( match: RegExpExecArray ): number {
    const [ , , number ] = match;
    return Number( number );
}

export function suffixedRegex( suffix: string, periodValue: string ): RegExp {
    return new RegExp( `([0-9]+)(?: )+(${periodValue})(?: )*(${suffix})`, 'i' );
    // groups:             0      1         2           3         4
}

export function extractNumberFromSuffixedMatch( match: RegExpExecArray ): number {
    const [ number ] = match;
    return Number( number );
}
