import { format } from 'date-fns'
import { enUS, enGB, pt, ptBR } from "date-fns/locale";

const localeMap = {
    'en': enUS,
    'en-US': enUS,
    'en-GB': enGB,

    'pt': ptBR,
    'pt-BR': ptBR,
    'pt-PT': pt
};

export function formatLocale( locale: string ): string {
    const [ lang, country ] = locale.split( '-' );
    if ( ! country ) {
        return lang.toLowerCase();
    }
    return lang.toLowerCase() + '-' + country.toUpperCase();
}

export function isLocaleSupported( locale: string ): boolean {
    return !! localeMap[ locale ];
}

export function fallbackToLanguage( locale: string ): string | null {
    const loc = formatLocale( locale );
    if ( isLocaleSupported( loc ) ) {
        return loc;
    }
    const [ lang ] = loc.split( '-' );
    if ( isLocaleSupported( lang ) ) {
        return lang;
    }
    return null;
}

export function formatDateByLocale( locale: string, date: Date ): string {
    // 'P' means long localized date
    return format( date, 'P', { locale: localeMap[ locale ] } );
}

export function formatTimeByLocale( locale: string, time: Date ): string {
    // 'HH:mm' uses 24 hour format
    return format( time, 'HH:mm', { locale: localeMap[ locale ] } );
}

export function formatDateTimeByLocale( locale: string, dateTime: Date ): string {
    const dateStr = formatDateByLocale( locale, dateTime );
    const timeStr = formatTimeByLocale( locale, dateTime );
    return dateStr + ' ' + timeStr;
}
