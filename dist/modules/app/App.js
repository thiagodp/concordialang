import { TestScriptGenerationOptions, } from 'concordialang-plugin';
import { CompilerFacade } from '../compiler/CompilerFacade';
import { PackageBasedPluginFinder } from '../plugin/PackageBasedPluginFinder';
import { PluginManager } from '../plugin/PluginManager';
import { JSONTestReporter } from '../report/JSONTestReporter';
import { AbstractTestScriptGenerator } from '../testscript/AbstractTestScriptGenerator';
import { TestResultAnalyzer } from '../testscript/TestResultAnalyzer';
import { FSDirSearcher, FSFileHandler } from '../util/fs';
import { hasSomeOptionThatRequiresAPlugin } from './app-options';
/**
 * Application facade
 *
 * @author Thiago Delgado Pinto
 */
export class App {
    constructor(_fs, _path, _promisify) {
        this._fs = _fs;
        this._path = _path;
        this._promisify = _promisify;
    }
    async start(options, listener) {
        const fs = this._fs;
        const path = this._path;
        const promisify = this._promisify;
        const fileHandler = new FSFileHandler(fs, promisify, options.encoding);
        // Load plug-in
        let plugin = null;
        if (hasSomeOptionThatRequiresAPlugin(options) && options.plugin) {
            const dirSearcher = new FSDirSearcher(fs, promisify);
            const pluginManager = new PluginManager(options.packageManager, listener, new PackageBasedPluginFinder(options.processPath, fileHandler, dirSearcher), fileHandler);
            try {
                const pluginData = await pluginManager.pluginWithName(options.plugin);
                if (!pluginData) {
                    listener.announcePluginNotFound(options.plugin);
                    return { success: false };
                    ;
                }
                plugin = await pluginManager.load(pluginData);
            }
            catch (err) {
                listener.showException(err);
                return { success: false };
            }
            if (!plugin) { // needed?
                listener.announcePluginCouldNotBeLoaded(options.plugin);
                return { success: false };
                ;
            }
            // can continue
        }
        if (!plugin &&
            (options.script || options.run || options.result)) {
            listener.announceNoPluginWasDefined();
            return { success: false };
            ;
        }
        // Compile
        let hasErrors = false;
        let spec = null;
        listener.announceOptions(options);
        if (options.spec) {
            const compiler = new CompilerFacade(fs, promisify, listener, listener);
            try {
                [spec,] = await compiler.compile(options);
            }
            catch (err) {
                hasErrors = true;
                listener.showException(err);
            }
            if (null === spec && options.file.length > 0) {
                return { success: !hasErrors };
            }
        }
        // Abstract test scripts
        let abstractTestScripts = [];
        let generatedTestScriptFiles = [];
        let tseo;
        if (spec && options.script) { // Requires spec and a plugin
            let docs = spec.docs;
            const atsGenerator = new AbstractTestScriptGenerator();
            abstractTestScripts = atsGenerator.generate(docs, spec);
            if (!!plugin.generateCode && !!abstractTestScripts && abstractTestScripts.length > 0) {
                const startTime = Date.now();
                let errors = [];
                try {
                    const r = await plugin.generateCode(abstractTestScripts, new TestScriptGenerationOptions(options.plugin, options.dirScript, options.directory));
                    generatedTestScriptFiles = r?.generatedFiles || [];
                    errors = r?.errors || [];
                }
                catch (err) {
                    hasErrors = true;
                    listener.showException(err);
                }
                const durationMS = Date.now() - startTime;
                listener.showGeneratedTestScriptFiles(options.dirScript, generatedTestScriptFiles, durationMS);
                listener.showTestScriptGenerationErrors(errors);
            }
        }
        let executionResult = null;
        const shouldExecuteScripts = !!plugin && !!plugin.executeCode &&
            (options.run &&
                (options.scriptFile?.length > 0 ||
                    generatedTestScriptFiles.length > 0 ||
                    ('string' === typeof options.dirResult && options.dirResult != '')));
        if (shouldExecuteScripts) { // Execution requires a plugin, but NOT a spec
            // console.log( '>>>', 'generatedTestScriptFiles', generatedTestScriptFiles );
            const scriptFiles = options.scriptFile?.length > 0
                ? options.scriptFile.join(',')
                : generatedTestScriptFiles.length > 0
                    ? generatedTestScriptFiles.join(',')
                    : undefined;
            tseo = {
                dirScript: options.dirScript,
                dirResult: options.dirResult,
                file: scriptFiles || undefined,
                grep: options.scriptGrep || undefined,
                target: options.target || undefined,
                headless: options.headless || undefined,
                instances: options.instances || undefined,
            };
            listener.announceTestScriptExecutionStarted();
            try {
                executionResult = await plugin.executeCode(tseo);
            }
            catch (err) {
                hasErrors = true;
                listener.announceTestScriptExecutionError(err);
            }
            listener.announceTestScriptExecutionFinished();
        }
        if (!hasErrors && (executionResult?.total?.failed > 0 || executionResult?.total?.error > 0)) {
            hasErrors = true;
        }
        if (options.result &&
            !!plugin.defaultReportFile &&
            !!plugin.convertReportFile) { // Requires a plugin
            let reportFile;
            if (!executionResult) {
                const defaultReportFile = path.join(options.dirResult, await plugin.defaultReportFile());
                if (!fs.existsSync(defaultReportFile)) {
                    listener.announceReportFileNotFound(defaultReportFile);
                    return { success: false, spec };
                }
                reportFile = defaultReportFile;
            }
            else {
                reportFile = executionResult.sourceFile;
            }
            if (reportFile) {
                listener.announceReportFile(reportFile);
                try {
                    executionResult = await plugin.convertReportFile(reportFile);
                }
                catch (err) {
                    hasErrors = true;
                    listener.showException(err);
                }
            }
        }
        if (executionResult) {
            try {
                const reportedResult = (new TestResultAnalyzer()).adjustResult(executionResult, abstractTestScripts);
                // @ts-ignore
                if (!!plugin?.beforeReport) {
                    // @ts-ignore
                    await plugin.beforeReport(reportedResult, tseo);
                }
                listener.showTestScriptAnalysis(reportedResult);
                // Save report to file
                const reporter = new JSONTestReporter(fileHandler);
                await reporter.report(reportedResult, { directory: options.dirResult, useTimestamp: false });
                // ---
                // @ts-ignore
                if (!!plugin?.afterReport) {
                    // @ts-ignore
                    await plugin.afterReport(reportedResult, tseo);
                }
                if (!hasErrors && (reportedResult?.total?.failed > 0 || reportedResult?.total?.error > 0)) {
                    hasErrors = true;
                }
            }
            catch (err) {
                hasErrors = true;
                listener.showException(err);
            }
        }
        return { success: !hasErrors, spec };
    }
}
