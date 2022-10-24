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
var Transpiler_52_1 = require("./Transpiler.52");
var ts = require("typescript");
var LuaTranspilerJIT = /** @class */ (function (_super) {
    __extends(LuaTranspilerJIT, _super);
    function LuaTranspilerJIT() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** @override */
    LuaTranspilerJIT.prototype.transpileUnaryBitOperation = function (node, operand) {
        switch (node.operator) {
            case ts.SyntaxKind.TildeToken:
                return "bit.bnot(" + operand + ")";
        }
    };
    /** @override */
    LuaTranspilerJIT.prototype.transpileBitOperation = function (node, lhs, rhs) {
        switch (node.operatorToken.kind) {
            case ts.SyntaxKind.AmpersandToken:
                return "bit.band(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.BarToken:
                return "bit.bor(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.CaretToken:
                return "bit.bxor(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.LessThanLessThanToken:
                return "bit.lshift(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.GreaterThanGreaterThanToken:
                return "bit.rshift(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                return "bit.arshift(" + lhs + "," + rhs + ")";
        }
    };
    return LuaTranspilerJIT;
}(Transpiler_52_1.LuaTranspiler52));
exports.LuaTranspilerJIT = LuaTranspilerJIT;
//# sourceMappingURL=Transpiler.JIT.js.map