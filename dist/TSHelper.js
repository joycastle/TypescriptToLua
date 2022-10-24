"use strict";
exports.__esModule = true;
var ts = require("typescript");
var TSHelper = /** @class */ (function () {
    function TSHelper() {
    }
    // Reverse lookup of enum key by value
    TSHelper.enumName = function (needle, haystack) {
        for (var name_1 in haystack) {
            if (haystack[name_1] === needle) {
                return name_1;
            }
        }
        return "unknown";
    };
    // Breaks down a mask into all flag names.
    TSHelper.enumNames = function (mask, haystack) {
        var result = [];
        for (var name_2 in haystack) {
            if ((mask & haystack[name_2]) !== 0 && mask >= haystack[name_2]) {
                result.push(name_2);
            }
        }
        return result;
    };
    TSHelper.containsStatement = function (statements, kind) {
        return statements.some(function (statement) { return statement.kind === kind; });
    };
    TSHelper.getExtendedType = function (node, checker) {
        if (node.heritageClauses) {
            for (var _i = 0, _a = node.heritageClauses; _i < _a.length; _i++) {
                var clause = _a[_i];
                if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                    var superType = checker.getTypeAtLocation(clause.types[0]);
                    if (!this.isPureAbstractClass(superType, checker)) {
                        return superType;
                    }
                }
            }
        }
        return undefined;
    };
    TSHelper.isFileModule = function (sourceFile) {
        if (sourceFile) {
            // Vanilla ts flags files as external module if they have an import or
            // export statement, we only check for export statements
            return sourceFile.statements.some(function (statement) {
                return (ts.getCombinedModifierFlags(statement) & ts.ModifierFlags.Export) !== 0
                    || statement.kind === ts.SyntaxKind.ExportAssignment
                    || statement.kind === ts.SyntaxKind.ExportDeclaration;
            });
        }
        return false;
    };
    TSHelper.isInDestructingAssignment = function (node) {
        return node.parent && ts.isVariableDeclaration(node.parent) && ts.isArrayBindingPattern(node.parent.name);
    };
    TSHelper.isStringType = function (type) {
        return (type.flags & ts.TypeFlags.String) !== 0
            || (type.flags & ts.TypeFlags.StringLike) !== 0
            || (type.flags & ts.TypeFlags.StringLiteral) !== 0;
    };
    TSHelper.isArrayType = function (type, checker) {
        var typeNode = checker.typeToTypeNode(type);
        return typeNode && (typeNode.kind === ts.SyntaxKind.ArrayType || typeNode.kind === ts.SyntaxKind.TupleType);
    };
    TSHelper.isCompileMembersOnlyEnum = function (type, checker) {
        return type.symbol
            && ((type.symbol.flags & ts.SymbolFlags.Enum) !== 0)
            && type.symbol.getDocumentationComment(checker)[0] !== undefined
            && this.hasCustomDecorator(type, checker, "!CompileMembersOnly");
    };
    TSHelper.isPureAbstractClass = function (type, checker) {
        return type.symbol
            && ((type.symbol.flags & ts.SymbolFlags.Class) !== 0)
            && this.hasCustomDecorator(type, checker, "!PureAbstract");
    };
    TSHelper.isExtensionClass = function (type, checker) {
        return type.symbol
            && ((type.symbol.flags & ts.SymbolFlags.Class) !== 0)
            && this.hasCustomDecorator(type, checker, "!Extension");
    };
    TSHelper.isPhantom = function (type, checker) {
        return type.symbol
            && ((type.symbol.flags & ts.SymbolFlags.Namespace) !== 0)
            && this.hasCustomDecorator(type, checker, "!Phantom");
    };
    TSHelper.isTupleReturnCall = function (node, checker) {
        if (ts.isCallExpression(node)) {
            var type = checker.getTypeAtLocation(node.expression);
            return this.isTupleReturnFunction(type, checker);
        }
        else {
            return false;
        }
    };
    TSHelper.isTupleReturnFunction = function (type, checker) {
        return type.symbol
            && ((type.symbol.flags & ts.SymbolFlags.Function) !== 0
                || (type.symbol.flags & ts.SymbolFlags.Method) !== 0)
            && this.hasCustomDecorator(type, checker, "!TupleReturn");
    };
    TSHelper.hasCustomDecorator = function (type, checker, decorator) {
        if (type.symbol) {
            var comments = type.symbol.getDocumentationComment(checker);
            var decorators = comments.filter(function (comment) { return comment.kind === "text"; })
                .map(function (comment) { return comment.text.trim(); })
                .filter(function (comment) { return comment[0] === "!"; });
            return decorators.indexOf(decorator) > -1;
        }
        return false;
    };
    // Search up until finding a node satisfying the callback
    TSHelper.findFirstNodeAbove = function (node, callback) {
        var current = node;
        while (current.parent) {
            if (callback(current.parent)) {
                return current.parent;
            }
            else {
                current = current.parent;
            }
        }
        return null;
    };
    TSHelper.hasGetAccessor = function (node, checker) {
        if (ts.isPropertyAccessExpression(node)) {
            var name_3 = node.name.escapedText;
            var type = checker.getTypeAtLocation(node.expression);
            if (type && type.symbol && type.symbol.members) {
                var field = type.symbol.members.get(name_3);
                return field && (field.flags & ts.SymbolFlags.GetAccessor) !== 0;
            }
        }
        return false;
    };
    TSHelper.hasSetAccessor = function (node, checker) {
        if (ts.isPropertyAccessExpression(node)) {
            var name_4 = node.name.escapedText;
            var type = checker.getTypeAtLocation(node.expression);
            if (type && type.symbol && type.symbol.members) {
                var field = type.symbol.members.get(name_4);
                return field && (field.flags & ts.SymbolFlags.SetAccessor) !== 0;
            }
        }
        return false;
    };
    TSHelper.isBinaryAssignmentToken = function (token) {
        switch (token) {
            case ts.SyntaxKind.BarEqualsToken:
                return [true, ts.SyntaxKind.BarToken];
            case ts.SyntaxKind.PlusEqualsToken:
                return [true, ts.SyntaxKind.PlusToken];
            case ts.SyntaxKind.CaretEqualsToken:
                return [true, ts.SyntaxKind.CaretToken];
            case ts.SyntaxKind.MinusEqualsToken:
                return [true, ts.SyntaxKind.MinusToken];
            case ts.SyntaxKind.SlashEqualsToken:
                return [true, ts.SyntaxKind.SlashToken];
            case ts.SyntaxKind.PercentEqualsToken:
                return [true, ts.SyntaxKind.PercentToken];
            case ts.SyntaxKind.AsteriskEqualsToken:
                return [true, ts.SyntaxKind.AsteriskToken];
            case ts.SyntaxKind.AmpersandEqualsToken:
                return [true, ts.SyntaxKind.AmpersandToken];
            case ts.SyntaxKind.AsteriskAsteriskEqualsToken:
                return [true, ts.SyntaxKind.AsteriskAsteriskToken];
            case ts.SyntaxKind.LessThanLessThanEqualsToken:
                return [true, ts.SyntaxKind.LessThanLessThanToken];
            case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
                return [true, ts.SyntaxKind.GreaterThanGreaterThanToken];
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
                return [true, ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken];
        }
        return [false, null];
    };
    return TSHelper;
}());
exports.TSHelper = TSHelper;
//# sourceMappingURL=TSHelper.js.map