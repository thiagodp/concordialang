import alasql from 'alasql';

// @ts-ignore
export class AlaSqlDatabase extends alasql.Database { // declare as a type does not work

	exec( cmd: string, params?: any, cb?: any ) {
		return super.exec( cmd, params, cb );
	}

}
