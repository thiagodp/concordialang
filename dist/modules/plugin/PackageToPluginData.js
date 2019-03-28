"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PackageToPluginData {
    constructor(_packageProperty) {
        this._packageProperty = _packageProperty;
    }
    convert(pkg) {
        const prop = pkg[this._packageProperty];
        if (!prop) {
            return; // undefined
        }
        let data = {
            // From the package object
            name: pkg.name,
            description: pkg.description,
            version: pkg.version,
            // authors: this.packageAuthorToAuthors( pkg.author ).concat( this.packageContributorsToAuthors( pkg.contributors ) ),
            authors: this.packageAuthorToAuthors(pkg.author),
            file: pkg.main,
            // From the custom property
            isFake: prop.isFake,
            targets: prop.targets,
            class: prop.class,
            install: prop.install,
            uninstall: prop.uninstall,
            serve: prop.serve
        };
        return data;
    }
    packageAuthorToAuthors(author) {
        const authorStr = this.packageAuthorToString(author);
        if (!authorStr) {
            return [];
        }
        return [authorStr];
    }
    // public packageContributorsToAuthors( contributors: any[] ): string[] {
    //     if ( ! contributors ) {
    //         return [];
    //     }
    //     return contributors.map( c => this.packageAuthorToString( c ) );
    // }
    packageAuthorToString(author) {
        if (!author) {
            return; // undefined
        }
        switch (typeof author) {
            case 'string': return author;
            case 'object': {
                const email = !author.email ? '' : (' <' + author.email + '>');
                return (author.name || '') + email;
            }
            default: return; // undefined
        }
    }
}
exports.PackageToPluginData = PackageToPluginData;
