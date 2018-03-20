// WARNING: this file must be removed after EnumUtil have the `toEnumValue` method added.
// @see https://github.com/AnyhowStep/enum-util/issues/4

import { getValues } from 'enum-util';

export function toEnumValue( val, ValueType ) {
    return getValues( ValueType ).find( v => v === val ) || null;
}