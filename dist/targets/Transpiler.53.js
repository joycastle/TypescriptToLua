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
var Transpiler_1 = require("../Transpiler");
var Transpiler_52_1 = require("./Transpiler.52");
var ts = require("typescript");
var LuaTranspiler53 = /** @class */ (function (_super) {
    __extends(LuaTranspiler53, _super);
    function LuaTranspiler53() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** @override */
    LuaTranspiler53.prototype.transpileUnaryBitOperation = function (node, operand) {
        switch (node.operator) {
            case ts.SyntaxKind.TildeToken:
                return "~" + operand;
        }
    };
    /** @override */
    LuaTranspiler53.prototype.transpileBitOperation = function (node, lhs, rhs) {
        switch (node.operatorToken.kind) {
            case ts.SyntaxKind.AmpersandToken:
                return lhs + " & " + rhs;
            case ts.SyntaxKind.BarToken:
                return lhs + " | " + rhs;
            case ts.SyntaxKind.CaretToken:
                return lhs + " ~ " + rhs;
            case ts.SyntaxKind.LessThanLessThanToken:
                return lhs + " << " + rhs;
            case ts.SyntaxKind.GreaterThanGreaterThanToken:
                return lhs + " >> " + rhs;
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                throw new Transpiler_1.TranspileError("Bitwise operator >>> not supported in Lua 5.3", node);
        }
    };
    /** @override */
    LuaTranspiler53.prototype.getValidStringProperties = function () {
        return {
            fromCharCode: "string.char",
            fromCodePoint: "utf8.char"
        };
    };
    return LuaTranspiler53;
}(Transpiler_52_1.LuaTranspiler52));
exports.LuaTranspiler53 = LuaTranspiler53;
//# sourceMappingURL=Transpiler.53.js.map