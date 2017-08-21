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
		// Venta.getDataSource().connector.connect(function(err, db) {
	 //  let ventaCollection = db.collection('Venta');
	  Detalleventa.getDataSource().connector.connect((err, db) => {
			let detalleVentaCollection = db.collection('DetalleVenta');
			let date = new Date();
		  let y = date.getFullYear();
		  let m = date.getMonth() +1;
		  // if (m<10) m = '0'+m.toString()
		  let d = date.getDate();
		  // let newdate = new Date(y+"-"+m+"-"+d+"T00:00:00Z");
			detalleVentaCollection.aggregate([
		  	{ $project: { 
		  		total: 1,
		  		fecha_venta: 1, 
	        month: { $month: "$fecha_venta" },
	        year: { $year: "$fecha_venta" }
	    	}},
	    	{ $match : { year : y, month: m } }
			], (err, data) => {
				let totalHoy = 0
	  		data.forEach(item => {
	  			if(item.fecha_venta.getDate()+1 == d) totalHoy += Number(item.total)
	  		})
	  		let newData = {}
	  		newData.fecha = y+ "-"+m+"-"+d
	  		newData.total = totalHoy
	  		cb(null, newData)
	  	})
		})
	}

	Detalleventa.remoteMethod('totalHoy', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });



};
