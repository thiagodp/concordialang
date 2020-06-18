import { DirSearcher, DirSearchOptions } from "../util/file";
import { makePackageInstallCommand, makePackageUninstallCommand } from "../util/package-installation";
import { runCommand } from "../util/run-command";


export async function allInstalledDatabases(
	baseDirectory: string,
	dirSearcher: DirSearcher
	): Promise< string[] > {

	const options: DirSearchOptions = {
		directory: baseDirectory,
		recursive: false,
		regexp: /database\-js\-(.+)$/
	};

	const directories = await dirSearcher.search( options );
	if ( directories.length < 1 ) {
		return [];
	}

	const extractName = dir => options.regexp.exec( dir )[ 1 ];
	return directories.map( extractName );
}

export async function installDatabases( databasesOrPackageNames: string[] ): Promise< number > {
	const packages = databasesOrPackageNames.map( databasePackageNameFor );
	const cmd = makePackageInstallCommand( packages.join( ' ' ) );
	return await runCommand( cmd );
}

export async function uninstallDatabases( databasesOrPackageNames: string[]  ): Promise< number > {
	const packages = databasesOrPackageNames.map( databasePackageNameFor );
	const cmd = makePackageUninstallCommand( packages.join( ' ' ) );
	return await runCommand( cmd );
}

export function databasePackageNameFor( databaseOrPackageName: string ): string {
	const prefix = 'database-js-';
	return databaseOrPackageName.startsWith( prefix )
		? databaseOrPackageName
		: prefix + databaseOrPackageName;
}
