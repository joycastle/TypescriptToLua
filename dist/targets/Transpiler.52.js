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
var Transpiler_51_1 = require("./Transpiler.51");
var ts = require("typescript");
var LuaTranspiler52 = /** @class */ (function (_super) {
    __extends(LuaTranspiler52, _super);
    function LuaTranspiler52() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** @override */
    LuaTranspiler52.prototype.transpileLoopBody = function (node) {
        this.loopStack.push(this.genVarCounter);
        this.genVarCounter++;
        var result = this.indent + "do\n";
        this.pushIndent();
        result += this.transpileStatement(node.statement);
        this.popIndent();
        result += this.indent + "end\n";
        result += this.indent + ("::__continue" + this.loopStack.pop() + "::\n");
        return result;
    };
    /** @override */
    LuaTranspiler52.prototype.transpileContinue = function (node) {
        return this.indent + ("goto __continue" + this.loopStack[this.loopStack.length - 1] + "\n");
    };
    /** @override */
    LuaTranspiler52.prototype.transpileUnaryBitOperation = function (node, operand) {
        switch (node.operator) {
            case ts.SyntaxKind.TildeToken:
                return "bit32.bnot(" + operand + ")";
        }
    };
    /** @override */
    LuaTranspiler52.prototype.transpileBitOperation = function (node, lhs, rhs) {
        switch (node.operatorToken.kind) {
            case ts.SyntaxKind.AmpersandToken:
                return "bit32.band(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.BarToken:
                return "bit32.bor(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.CaretToken:
                return "bit32.bxor(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.LessThanLessThanToken:
                return "bit32.lshift(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.GreaterThanGreaterThanToken:
                return "bit32.rshift(" + lhs + "," + rhs + ")";
            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                return "bit32.arshift(" + lhs + "," + rhs + ")";
        }
    };
    return LuaTranspiler52;
}(Transpiler_51_1.LuaTranspiler51));
exports.LuaTranspiler52 = LuaTranspiler52;
//# sourceMappingURL=Transpiler.52.js.map