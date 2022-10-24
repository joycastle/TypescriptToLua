"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var ts = require("typescript");
var yargs = require("yargs");
var CLIError = /** @class */ (function (_super) {
    __extends(CLIError, _super);
    function CLIError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CLIError;
}(Error));
exports.CLIError = CLIError;
var optionDeclarations = {
    addHeader: {
        alias: ["ah", "header"],
        "default": true,
        describe: "Specify if a header will be added to compiled files.",
        type: "boolean"
    },
    dontRequireLuaLib: {
        "default": false,
        describe: "Dont require lua library that enables advanced Typescipt/JS functionality.",
        type: "boolean"
    },
    luaTarget: {
        alias: "lt",
        choices: ["JIT", "5.3", "5.2", "5.1"],
        "default": "JIT",
        describe: "Specify Lua target version.",
        type: "string"
    }
};
/**
 * Pares the supplied arguments.
 * The result will include arguments supplied via CLI and arguments from tsconfig.
 */
function parseCommandLine(args) {
    var parsedArgs = yargs
        .usage("Syntax: tstl [options] [files...]\n\n" +
        "In addition to the options listed below you can also pass options" +
        "for the typescript compiler (For a list of options use tsc -h).\n" +
        "Some tsc options might have no effect.")
        .example("tstl path/to/file.ts [...]", "Compile files")
        .example("tstl -p path/to/tsconfig.json", "Compile project")
        .wrap(yargs.terminalWidth())
        .options(optionDeclarations)
        .fail(function (msg, err) {
        throw new CLIError(msg);
    })
        .parse(args);
    var commandLine = ts.parseCommandLine(args);
    // Run diagnostics to check for invalid tsc/tstl options
    runDiagnostics(commandLine);
    // Add TSTL options from CLI
    addTSTLOptions(commandLine, parsedArgs);
    // Load config
    if (commandLine.options.project) {
        findConfigFile(commandLine);
        var configPath = commandLine.options.project;
        var configContents = fs.readFileSync(configPath).toString();
        var configJson = ts.parseConfigFileTextToJson(configPath, configContents);
        commandLine = ts.parseJsonConfigFileContent(configJson.config, ts.sys, path.dirname(configPath), commandLine.options);
    }
    // Add TSTL options from tsconfig
    addTSTLOptions(commandLine);
    // Run diagnostics again to check for errors in tsconfig
    runDiagnostics(commandLine);
    if (commandLine.options.project && !commandLine.options.rootDir) {
        commandLine.options.rootDir = path.dirname(commandLine.options.project);
    }
    if (!commandLine.options.rootDir) {
        commandLine.options.rootDir = process.cwd();
    }
    if (!commandLine.options.outDir) {
        commandLine.options.outDir = commandLine.options.rootDir;
    }
    return commandLine;
}
exports.parseCommandLine = parseCommandLine;
function addTSTLOptions(commandLine, additionalArgs, forceOverride) {
    additionalArgs = additionalArgs ? additionalArgs : commandLine.raw;
    // Add compiler options that are ignored by TS parsers
    if (additionalArgs) {
        for (var arg in additionalArgs) {
            // dont override, this will prioritize CLI over tsconfig.
            if (optionDeclarations[arg] && (!commandLine.options[arg] || forceOverride)) {
                commandLine.options[arg] = additionalArgs[arg];
            }
        }
    }
}
/** Check the current state of the ParsedCommandLine for errors */
function runDiagnostics(commandLine) {
    var tsInvalidCompilerOptionErrorCode = 5023;
    if (commandLine.errors.length !== 0) {
        // Generate a list of valid option names and aliases
        var optionNames_1 = [];
        for (var _i = 0, _a = Object.keys(optionDeclarations); _i < _a.length; _i++) {
            var key = _a[_i];
            optionNames_1.push(key);
            var alias = optionDeclarations[key].alias;
            if (alias) {
                if (typeof alias === "string") {
                    optionNames_1.push(alias);
                }
                else {
                    optionNames_1.push.apply(optionNames_1, alias);
                }
            }
        }
        commandLine.errors.forEach(function (err) {
            var ignore = false;
            // Ignore errors caused by tstl specific compiler options
            if (err.code === tsInvalidCompilerOptionErrorCode) {
                for (var _i = 0, optionNames_2 = optionNames_1; _i < optionNames_2.length; _i++) {
                    var optionName = optionNames_2[_i];
                    if (err.messageText.toString().indexOf(optionName) !== -1) {
                        ignore = true;
                    }
                }
                if (!ignore) {
                    throw new CLIError("error TS" + err.code + ": " + err.messageText);
                }
            }
        });
    }
}
/** Find configFile, function from ts api seems to be broken? */
function findConfigFile(commandLine) {
    if (!commandLine.options.project) {
        throw new CLIError("error no base path provided, could not find config.");
    }
    var configPath;
    /* istanbul ignore else: Testing else part is not really possible via automated tests */
    if (path.isAbsolute(commandLine.options.project)) {
        configPath = commandLine.options.project;
    }
    else {
        // TODO check if commandLine.options.project can even contain non absolute paths
        configPath = path.join(process.cwd(), commandLine.options.project);
    }
    if (fs.statSync(configPath).isDirectory()) {
        configPath = path.join(configPath, "tsconfig.json");
    }
    else if (fs.statSync(configPath).isFile() && path.extname(configPath) === ".ts") {
        // Search for tsconfig upwards in directory hierarchy starting from the file path
        var dir = path.dirname(configPath).split(path.sep);
        for (var i = dir.length; i > 0; i--) {
            var searchPath = dir.slice(0, i).join("/") + path.sep + "tsconfig.json";
            // If tsconfig.json was found, stop searching
            if (ts.sys.fileExists(searchPath)) {
                configPath = searchPath;
                break;
            }
        }
    }
    commandLine.options.project = configPath;
}
exports.findConfigFile = findConfigFile;
//# sourceMappingURL=CommandLineParser.js.map