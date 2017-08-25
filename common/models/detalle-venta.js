'use strict';

module.exports = function(Detalleventa) {
	//dinero vendido por mes
	Detalleventa.VendidoporMes = function(cb){
		Detalleventa.getDataSource().connector.connect((err, db) => {
			let detalleVentaCollection = db.collection('DetalleVenta');
			detalleVentaCollection.aggregate([
		  	{ $project: { 
		  		total: 1,
		  		fecha_venta: 1,
	        month: { $month: "$fecha_venta" },
	        year: { $year: "$fecha_venta" }
	    	}},
	    	{ $group: {
		      _id: { year: "$year", month: "$month" },
		    	vendido: { $sum: "$total" },
		    	fecha: { $first: "$fecha_venta"}
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
					cantidad.push(venta.vendido)	
				})
				let newData = {};
				newData.meses = meses;
				newData.cantidad = cantidad;
		    cb(null, newData);
			})
		})
	}

	Detalleventa.remoteMethod('VendidoporMes', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });

	//cantidad vendida hoy
	Detalleventa.totalHoy = function(cb) {
	  Detalleventa.getDataSource().connector.connect((err, db) => {
			let detalleVentaCollection = db.collection('DetalleVenta');
			let date = new Date();
		  let y = date.getFullYear();
		  let m = date.getMonth() +1;
		  let d = date.getDate();
			detalleVentaCollection.aggregate([
		  	{ $project: { 
		  		total: 1,
		  		fecha_venta: 1,
		  		tipo: 1, 
	        month: { $month: "$fecha_venta" },
	        year: { $year: "$fecha_venta" },
	        day: { $dayOfMonth: "$fecha_venta" }
	    	}},
	    	{ $match : { year : y, month: m , day: d} }
			], (err, data) => {
				let totalHoy = 0
				let creditoHoy = 0
	  		data.forEach(item => {
  				if(item.tipo == 'credito') creditoHoy += Number(item.total)
  				totalHoy += Number(item.total) 
	  		})
	  		let newData = {}
	  		newData.fecha = y+ "-"+m+"-"+d
	  		newData.total = totalHoy
	  		newData.credito = creditoHoy
	  		cb(null, newData)
	  	})
		})
	}

	Detalleventa.remoteMethod('totalHoy', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });

//vendido los ultimos 7 dias
	Detalleventa.Vendidopor7Dias = function(cb){
		Detalleventa.getDataSource().connector.connect((err, db) => {
			let detalleVentaCollection = db.collection('DetalleVenta')
			detalleVentaCollection.aggregate([
				{ $project: { 
		  		total: 1,
		  		fecha_venta: 1
	    	}},
	    	{ $group: {
		      _id : { month: { $month: "$fecha_venta" }, day: { $dayOfMonth: "$fecha_venta" }, year: { $year: "$fecha_venta" } },
		    	vendido: { $sum: "$total" },
		    	fecha: { $first: "$fecha_venta"}
		    }}
			], (err, data) => {
				data.sort(function(a, b){
			    var keyA = new Date(a.fecha),
			        keyB = new Date(b.fecha);
			    // Compare the 2 dates
			    if(keyA < keyB) return -1;
			    if(keyA > keyB) return 1;
			    return 0;
				});
				data = data.slice(-7)
				let label = []
				let cantidad = []
				data.forEach( item => {
					label.push(item._id.month+'/'+item._id.day)
					cantidad.push(item.vendido)
				})
				let newData = {}
				newData.label = label
				newData.cantidad = cantidad
				cb(null, newData)
			})
		})
	}

	Detalleventa.remoteMethod('Vendidopor7Dias', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });

  Detalleventa.mejorCliente = function(fecha, cb) {
	Detalleventa.getDataSource().connector.connect(function(err, db) {
	  let detalleVentaCollection = db.collection('DetalleVenta');
	  let d = undefined
	  if( fecha ) {
	  	d = new Date(fecha);
	  } else {
	  	d = new Date();
	  }
	  let mes = d.getMonth() +1
		let y = d.getFullYear()
	  detalleVentaCollection.aggregate([
	  	{ $project: { 
	  		total: 1,
        month: { $month: "$fecha_venta" },
        year: { $year: "$fecha_venta" },
        clienteId: 1
    	}},
    	{ $match : { year : y, month: mes } },
	    { $group: {
	      _id: { cliente: "$clienteId"},
	    	total: { $sum: "$total" },
	    }},
	    {
	    	$lookup: {
          from: "Cliente",
          localField: "_id.cliente",
          foreignField: "_id",
          as: "cliente_nombre"
        }
	    },
	    { $limit : 7 },
	    {
	  		$sort : { total: -1}
	  	}
		  ], function(err, data) {
		    if (err) cb(err); //return callback(err);
		    let clientes = [];
		    data.forEach(item => {
					clientes.push({nombre: item.cliente_nombre[0].nombre, dni_ruc: item.cliente_nombre[0].dni_ruc, total: item.total})
				})
				let newData = [];
				newData = clientes;
		    cb(null, newData); //return callback(null, data);
		  });
		});
	}

	Detalleventa.remoteMethod('mejorCliente', {
    accepts: {arg: 'fecha', type: 'string' },
    returns: {arg:'data', type:['object'], root:true}
  });

//detalleVenta por mes y año
  Detalleventa.GenerarExcel = function(fecha, cb) {
	Detalleventa.getDataSource().connector.connect(function(err, db) {
	  let detalleVentaCollection = db.collection('DetalleVenta');
	  let d = undefined
	  if( fecha ) {
	  	d = new Date(fecha);
	  } else {
	  	d = new Date();
	  }
	  let mes = d.getMonth() +1
		let y = d.getFullYear()
	  detalleVentaCollection.aggregate([
	  	{ $project: { 
	  		total: 1,
        month: { $month: "$fecha_venta" },
        year: { $year: "$fecha_venta" },
        clienteId: 1,
        fecha_venta: 1,
        costo_envio: 1,
        direccion: 1
    	}},
    	{ $match : { year : y, month: mes } },
	    {
	    	$lookup: {
          from: "Cliente",
          localField: "clienteId",
          foreignField: "_id",
          as: "cliente_nombre"
        }
	    },
	    {
	  		$sort : { fecha_venta: 1}
	  	}
		  ], function(err, data) {
		    if (err) cb(err); //return callback(err);
		    cb(null, data); //return callback(null, data);
		  });
		});
	}

	Detalleventa.remoteMethod('GenerarExcel', {
    accepts: {arg: 'fecha', type: 'string' },
    returns: {arg:'data', type:['object'], root:true}
  });

};
