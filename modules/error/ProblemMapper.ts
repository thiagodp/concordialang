import { LocatedException } from "./LocatedException";

/** Key for generic errors */
export const GENERIC_ERROR_KEY: string = '*';

export class ProblemInfo {
    constructor(
        public errors: LocatedException[] = [],
        public warnings: LocatedException[] = [],
    ) {
    }

    hasErrors(): boolean {
        return this.errors.length > 0;
    }

    hasWarnings(): boolean {
        return this.warnings.length > 0;
    }

    isEmpty(): boolean {
        return ! this.hasErrors() && ! this.hasWarnings();
    }

}

/**
 * Maps a key to a `ProblemInfo`.
 *
 * Note: `GENERIC_ERROR_KEY` is used for generic errors.
 */
export class ProblemMapper {

    private readonly _map:  Map< string, ProblemInfo > = new  Map< string, ProblemInfo >();

    constructor(
        private readonly _needsToConvertKey: boolean = false
        ) {
    }

    protected convertKey( key: string ): string {
        return key;
    }

	/**
	 * Add one or more errors.
	 *
	 * @param key Usually the file path.
	 * @param errors Errors to add.
	 */
    addError( key: string, ... errors: LocatedException[] ): void {
        let target: ProblemInfo = this.get( key, true );
        target.errors.push.apply( target.errors, errors );
    }

    addGenericError( ...errors: LocatedException[] ): void {
        this.addError( GENERIC_ERROR_KEY, ...errors );
    }

	/**
	 * Add one or more warnings.
	 *
	 * @param key Usually the file path.
	 * @param errors Errors to add.
	 */
    addWarning( key: string, ... errors: LocatedException[] ): void {
        let target: ProblemInfo = this.get( key, true );
        target.warnings.push.apply( target.warnings, errors );
    }

    addGenericWarning( ...errors: LocatedException[] ): void {
        this.addWarning( GENERIC_ERROR_KEY, ...errors );
    }

    get( key: string, assureExists: boolean = true ): ProblemInfo | undefined {
        const cKey: string = this._needsToConvertKey ? this.convertKey( key ) : key;
        let target: ProblemInfo | undefined = this._map.get( cKey );
        if ( assureExists && ! target ) {
            target = new ProblemInfo();
            this._map.set( cKey, target );
        }
        return target;
    }

    getGeneric( assureExists: boolean = true ): ProblemInfo | undefined {
        return this.get( GENERIC_ERROR_KEY, assureExists );
    }

    getErrors( key: string ): LocatedException[] {
        const target: ProblemInfo | undefined = this.get( key, false );
        if ( ! target ) {
            return [];
        }
        return target.errors;
    }

    getGenericErrors(): LocatedException[] {
        return this.getErrors( GENERIC_ERROR_KEY );
    }

    getAllErrors(): LocatedException[] {
        const errors: LocatedException[] = [];
        for ( const [ , value ] of this._map ) {
            errors.push.apply( errors, value.errors );
        }
        return errors;
    }

    getWarnings( key: string ): LocatedException[] {
        const target: ProblemInfo | undefined = this.get( key, false );
        if ( ! target ) {
            return [];
        }
        return target.warnings;
    }

    getGenericWarnings(): LocatedException[] {
        return this.getWarnings( GENERIC_ERROR_KEY );
    }

    getAllWarnings(): LocatedException[] {
        const warnings: LocatedException[] = [];
        for ( const [ , value ] of this._map ) {
            warnings.push.apply( warnings, value.warnings );
        }
        return warnings;
    }

    nonGeneric(): Map< string, ProblemInfo > {
        const mapClone = new Map< string, ProblemInfo >( this._map );
        mapClone.delete( GENERIC_ERROR_KEY );
        return mapClone;
    }

    remove( key: string ): void {
        const cKey: string = this._needsToConvertKey ? this.convertKey( key ) : key;
        this._map.delete( cKey );
    }

    clear(): void {
        this._map.clear();
    }

    isEmpty(): boolean {
        return 0 === this._map.size;
    }

    count(): number {
        return this._map.size;
    }

}

