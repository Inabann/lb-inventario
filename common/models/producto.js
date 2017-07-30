'use strict';

module.exports = function(Producto) {
	
	Producto.stock = function(cb) {
		Producto.getDataSource().connector.connect(function(err, db) {
	  let productoCollection = db.collection('Producto');
	  productoCollection.aggregate([
	    { $group: {
	      _id: { modelo: "$modelosId", tipo: "$tiposId", marca: "$marcasId", color: "$colorsId" },
	     cantidad: { $sum: "$cantidad" }
	    }}
		  ], function(err, data) {
		    if (err) cb(err); //return callback(err);
		    console.log(data);
		    cb(null, data); //return callback(null, data);
		  });
		});
	}

	Producto.remoteMethod('stock', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });



};
