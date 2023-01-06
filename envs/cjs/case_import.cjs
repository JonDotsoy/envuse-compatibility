'use strict';

var envuse = require('envuse');
var assert = require('assert');

function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n.default = e;
	return Object.freeze(n);
}

var envuse__namespace = /*#__PURE__*/_interopNamespaceDefault(envuse);

assert.ok(typeof envuse__namespace === "object", "Expect import envuse to be an object");
