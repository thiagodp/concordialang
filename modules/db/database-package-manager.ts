import { DirSearcher, DirSearchOptions } from "../util/file";
import { makeDatabasePackageNameFor, makePackageInstallCommand, makePackageUninstallCommand, PackageManager } from "../util/package-installation";
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

export async function installDatabases(
	databasesOrPackageNames: string[],
	tool: PackageManager
): Promise< number > {
	const packages = databasesOrPackageNames.map( makeDatabasePackageNameFor );
	const cmd = makePackageInstallCommand( packages.join( ' ' ), tool );
	return await runCommand( cmd );
}

export async function uninstallDatabases(
	databasesOrPackageNames: string[],
	tool: PackageManager
): Promise< number > {
	const packages = databasesOrPackageNames.map( makeDatabasePackageNameFor );
	const cmd = makePackageUninstallCommand( packages.join( ' ' ), tool );
	return await runCommand( cmd );
}
