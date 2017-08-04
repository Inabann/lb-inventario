'use strict';

module.exports = function(Producto) {
	
	Producto.stock = function(cb) {
	Producto.getDataSource().connector.connect(function(err, db) {
	  let productoCollection = db.collection('Producto');
	  productoCollection.aggregate([
	    { $group: {
	      _id: { modelo: "$modelosId", tipo: "$tiposId", marca: "$marcasId", color: "$colorsId" },
	     cantidad: { $sum: "$cantidad_res" }
	    }}
		  ], function(err, data) {
		    if (err) cb(err); //return callback(err);
		    cb(null, data); //return callback(null, data);
		  });
		});
	}

	Producto.remoteMethod('stock', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });

	Producto.reducir = function(venta, cb){
		let porReducir = venta.cantidad;
		Producto.find({order: 'fecha_ingreso ASC', where: { and: [{modelosId: venta.modelo}, {colorsId: venta.color}, {tiposId: venta.tipo}, {marcasId: venta.marca}] }}, 
			function(err, data){
				if(err) cb(err);
				data.forEach(producto => {
					if(producto.cantidad_res >= porReducir){//si la cantidad por reducir es menor q la cantidad restante
						producto.cantidad_res -= porReducir;
						Producto.upsertWithWhere({where: {id: producto.id}}, producto, (err, res) => {
							if(err) return;
							//ya q es menor o igual.. porReducir se vuelve 0, porq va a reducir todo de un solo producto
							porReducir = 0;
						})
					} else if (producto.cantidad_res < porReducir){
						porReducir -= producto.cantidad_res;
						producto.cantidad_res = 0;
						Producto.upsertWithWhere({where: {id: producto.id}}, producto, (err, res) => {
							if(err) return;
							return;
						})
					} else if(porReducir = 0){
						return;
					}
				})
				cb(null, data);
			})
	}

	Producto.remoteMethod('reducir', {
		accepts: {arg: 'venta', type: 'object'},
		returns: {arg: 'data', type: ['object'], root: true}
	})


};
