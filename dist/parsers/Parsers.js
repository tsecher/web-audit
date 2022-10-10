"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parsers = void 0;
/**
 * Parser Manager.
 */
class ParserManagerClass {
    constructor(_list = {}) {
        this._list = _list;
    }
    add(parser) {
        if (!this._list[parser.getId()]) {
            this._list[parser.getId()] = parser;
        }
        return this;
    }
    get(id) {
        return this._list[id] || null;
    }
    forEach(callback) {
        Object.values(this._list).forEach(callback);
    }
}
exports.Parsers = new ParserManagerClass();
