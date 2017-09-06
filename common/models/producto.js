'use strict';

module.exports = function(Producto) {
	
	Producto.stock = function(cb) {
	Producto.getDataSource().connector.connect(function(err, db) {
	  let productoCollection = db.collection('Producto');
	  productoCollection.aggregate([
	  	{ $match: { cantidad_res: { $gt: 0 } }},
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

  Producto.stockPorUsuario = function(userId,cb) {
	Producto.getDataSource().connector.connect(function(err, db) {
	  let productoCollection = db.collection('Producto');
	  productoCollection.aggregate([
	  	{ $project: { 
	  		precio_uni: 1,
	  		fecha_ingreso: 1,
        cantidad_res: 1,
        usuarioId: 1,
        modelosId: 1, tiposId: 1, marcasId: 1, colorsId: 1
	    }},
	  	{ $match: { cantidad_res: { $gt: 0 }}},
	    { $group: {
	      _id: { modelo: "$modelosId", tipo: "$tiposId", marca: "$marcasId", color: "$colorsId" , usuario: "$usuarioId"},
	     cantidad: { $sum: "$cantidad_res" }
	    }}
		  ], function(err, data) {
		  	let newData = []
		  	data.forEach(item => {
		  		if(item._id.usuario == userId){
		  			newData.push(item)
		  		}
		  	})
		    if (err) cb(err); //return callback(err);
		    cb(null, newData); //return callback(null, data);
		  });
		});
	}

	Producto.remoteMethod('stockPorUsuario', {
    accepts: {arg: 'userId', type: 'string' },
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
						Producto.replaceById(producto.id, producto, (err, res) => {
							if(err) console.log(err);
							//ya q es menor o igual.. porReducir se vuelve 0, porq va a reducir todo de un solo producto
							porReducir = 0;
						})
						porReducir = 0;
					} else if (producto.cantidad_res < porReducir){
						porReducir -= producto.cantidad_res;
						producto.cantidad_res = 0;
						Producto.replaceById(producto.id , producto, (err, res) => {
							if(err) console.log(err);
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
		accepts: { arg: 'venta', type: 'object', http: { source: 'body' } },
		returns: {arg: 'data', type: ['object'], root: true}
	})

	Producto.GastadoporMes = function(cb){
		Producto.getDataSource().connector.connect((err, db) => {
			let productoCollection = db.collection('Producto');
			productoCollection.aggregate([
		  	{ $project: { 
		  		precio_uni: 1,
		  		fecha_ingreso: 1,
	        month: { $month: "$fecha_ingreso" },
	        year: { $year: "$fecha_ingreso" }
	    	}},
	    	{ $group: {
		      _id: { year: "$year", month: "$month" },
		    	gastado: { $sum: "$precio_uni" },
		    	fecha: { $first: "$fecha_ingreso"}
		    }}
			], (err, data) => {
				if (err) cb(err);
				let meses = [];
		    let cantidad = [];
		    data.sort(function(a, b){
			    var keyA = new Date(a.fecha),
			        keyB = new Date(b.fecha);
			    // Compare the 2 dates
			    if(keyA < keyB) return -1;
			    if(keyA > keyB) return 1;
			    return 0;
				});
		    data.forEach(venta => {
					if(venta._id.month == 1) meses.push('Enero')
					else if(venta._id.month == 2) meses.push('Febrero')
					else if(venta._id.month == 3) meses.push('Marzo')
					else if(venta._id.month == 4) meses.push('Abril')
					else if(venta._id.month == 5) meses.push('Mayo')
					else if(venta._id.month == 6) meses.push('Junio')
					else if(venta._id.month == 7) meses.push('Julio')
					else if(venta._id.month == 8) meses.push('Agosto')
					else if(venta._id.month == 9) meses.push('Septiembre')
					else if(venta._id.month == 10) meses.push('Octubre')
					else if(venta._id.month == 11) meses.push('Noviembre')
					else if(venta._id.month == 12) meses.push('Diciembre')
					cantidad.push(venta.gastado)	
				})
				let newData = {};
				newData.label = meses;
				newData.cantidad = cantidad;
		    cb(null, newData);
			})
		})
	}

	Producto.remoteMethod('GastadoporMes', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });

};
