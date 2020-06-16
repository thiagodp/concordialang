import { formatValueToUseInASentence } from "../../modules/testscenario/value-formatter";
import { ValueType } from "../../modules/util";
import { LocaleContext } from "../../modules/testscenario/LocaleContext";
import { createDefaultLocaleMap } from "../../modules/testscenario/locale";
import { LocalDate } from "@js-joda/core";

describe( 'value-formatter', () => {

    it( 'date considers language "en" and locale "en-US"', async () => {
        const r: string = await formatValueToUseInASentence(
            ValueType.DATE,
            new LocaleContext( 'en', 'en-US', createDefaultLocaleMap() ),
            LocalDate.of( 2020, 12, 31 ),
            true
        );
        expect( r ).toEqual( '12/31/2020' );
    } );

    it( 'date considers language "en" and locale "pt-BR"', async () => {
        const r: string = await formatValueToUseInASentence(
            ValueType.DATE,
            new LocaleContext( 'en', 'pt-BR', createDefaultLocaleMap() ),
            LocalDate.of( 2020, 12, 31 ),
            true
        );
        expect( r ).toEqual( '31/12/2020' );
    } );

    it( 'date considers language "pt" and locale "pt-BR"', async () => {
        const r: string = await formatValueToUseInASentence(
            ValueType.DATE,
            new LocaleContext( 'pt', 'pt-BR', createDefaultLocaleMap() ),
            LocalDate.of( 2020, 12, 31 ),
            true
        );
        expect( r ).toEqual( '31/12/2020' );
    } );

} );
