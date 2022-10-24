#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var ts = require("typescript");
var CommandLineParser_1 = require("./CommandLineParser");
var Transpiler_51_1 = require("./targets/Transpiler.51");
var Transpiler_52_1 = require("./targets/Transpiler.52");
var Transpiler_53_1 = require("./targets/Transpiler.53");
var Transpiler_JIT_1 = require("./targets/Transpiler.JIT");
var Transpiler_1 = require("./Transpiler");
function compile(fileNames, options) {
    if (!options.luaTarget) {
        options.luaTarget = Transpiler_1.LuaTarget.LuaJIT;
    }
    var program = ts.createProgram(fileNames, options);
    var checker = program.getTypeChecker();
    // Get all diagnostics, ignore unsupported extension
    var diagnostics = ts.getPreEmitDiagnostics(program).filter(function (diag) { return diag.code !== 6054; });
    diagnostics.forEach(function (diagnostic) {
        if (diagnostic.file) {
            var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
            var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            console.log(diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message);
        }
        else {
            console.log("" + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
        }
    });
    // If there are errors dont emit
    if (diagnostics.filter(function (diag) { return diag.category === ts.DiagnosticCategory.Error; }).length > 0) {
        console.log("Stopping compilation process because of errors.");
        process.exit(1);
    }
    program.getSourceFiles().forEach(function (sourceFile) {
        if (!sourceFile.isDeclarationFile) {
            try {
                var rootDir = options.rootDir;
                // Transpile AST
                var lua = createTranspiler(checker, options, sourceFile).transpileSourceFile();
                var outPath = sourceFile.fileName;
                if (options.outDir !== options.rootDir) {
                    var relativeSourcePath = path.resolve(sourceFile.fileName)
                        .replace(path.resolve(rootDir), "");
                    outPath = path.join(options.outDir, relativeSourcePath);
                }
                // change extension or rename to outFile
                if (options.outFile) {
                    if (path.isAbsolute(options.outFile)) {
                        outPath = options.outFile;
                    }
                    else {
                        // append to workingDir or outDir
                        outPath = path.resolve(options.outDir, options.outFile);
                    }
                }
                else {
                    var fileNameLua = path.basename(outPath, path.extname(outPath)) + ".lua";
                    outPath = path.join(path.dirname(outPath), fileNameLua);
                }
                // Write output
                ts.sys.writeFile(outPath, lua);
            }
            catch (exception) {
                /* istanbul ignore else: Testing else part would require to add a bug/exception to our code */
                if (exception.node) {
                    var pos = ts.getLineAndCharacterOfPosition(sourceFile, exception.node.pos);
                    // Graciously handle transpilation errors
                    console.error("Encountered error parsing file: " + exception.message);
                    console.error(sourceFile.fileName + " line: " + (1 + pos.line) + " column: " + pos.character + "\n" +
                        exception.stack);
                    process.exit(1);
                }
                else {
                    throw exception;
                }
            }
        }
    });
    // Copy lualib to target dir
    fs.copyFileSync(path.resolve(__dirname, "../dist/lualib/typescript.lua"), path.join(options.outDir, "typescript_lualib.lua"));
}
exports.compile = compile;
function createTranspiler(checker, options, sourceFile) {
    var luaTargetTranspiler;
    switch (options.luaTarget) {
        case Transpiler_1.LuaTarget.LuaJIT:
            luaTargetTranspiler = new Transpiler_JIT_1.LuaTranspilerJIT(checker, options, sourceFile);
            break;
        case Transpiler_1.LuaTarget.Lua51:
            luaTargetTranspiler = new Transpiler_51_1.LuaTranspiler51(checker, options, sourceFile);
            break;
        case Transpiler_1.LuaTarget.Lua52:
            luaTargetTranspiler = new Transpiler_52_1.LuaTranspiler52(checker, options, sourceFile);
            break;
        case Transpiler_1.LuaTarget.Lua53:
            luaTargetTranspiler = new Transpiler_53_1.LuaTranspiler53(checker, options, sourceFile);
            break;
        default:
            // should not happen
            throw Error("No luaTarget Specified please ensure a target is set!");
    }
    return luaTargetTranspiler;
}
exports.createTranspiler = createTranspiler;
function execCommandLine(argv) {
    argv = argv ? argv : process.argv.slice(2);
    var commandLine = CommandLineParser_1.parseCommandLine(argv);
    compile(commandLine.fileNames, commandLine.options);
}
exports.execCommandLine = execCommandLine;
execCommandLine();
//# sourceMappingURL=Compiler.js.map