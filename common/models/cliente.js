'use strict';

module.exports = function(Cliente) {
	Cliente.validatesLengthOf('dni_ruc', {min: 8});
	Cliente.validatesLengthOf('nombre', {min: 5});
	// Cliente.validatesLengthOf('email', {min: 8});
	Cliente.validatesLengthOf('telefono', {min: 6});
};
