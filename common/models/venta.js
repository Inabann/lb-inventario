'use strict';

module.exports = function(Venta) {
	Venta.porMes = function(cb) {
	Venta.getDataSource().connector.connect(function(err, db) {
	  let ventaCollection = db.collection('Venta');
	  ventaCollection.aggregate([
	  	{
	  		$sort : { fecha_venta: -1}
	  	},
	  	{ $project: { 
	  		cantidad: 1,
        month: { $month: "$fecha_venta" },
        year: { $year: "$fecha_venta" }
    	}},
	    { $group: {
	      _id: { year: "$year", month: "$month" },
	    	total: { $sum: "$cantidad" }
	    }}
		  ], function(err, data) {
		    if (err) cb(err); //return callback(err);
		    let meses = [];
		    let cantidad = [];
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
					cantidad.push(venta.total)	
				})
				let newData = {};
				newData.meses = meses;
				newData.cantidad = cantidad;
		    cb(null, newData); //return callback(null, data);
		  });
		});
	}

	Venta.remoteMethod('porMes', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });

  //producto mas vendido por mes
  Venta.porProducto = function(cb) {
	Venta.getDataSource().connector.connect(function(err, db) {
	  let ventaCollection = db.collection('Venta');
	  let d = new Date();
	  let mes = d.getMonth() +1
	  let y = d.getFullYear()
	  ventaCollection.aggregate([
	  	{ $project: { 
	  		cantidad: 1,
        month: { $month: "$fecha_venta" },
        year: { $year: "$fecha_venta" },
        modelosId: 1,
        colorsId: 1
    	}},
    	{ $match : { year : y, month: mes } },
	    { $group: {
	      _id: { modelo: "$modelosId", color: "$colorsId"},
	    	total: { $sum: "$cantidad" }
	    }},
	    {
	  		$sort : { total: -1}
	  	}
		  ], function(err, data) {
		    if (err) cb(err); //return callback(err);
		    let labels = [];
		    let cantidad = [];
		    data.forEach(item => {
					labels.push(item._id.modelo +' '+item._id.color)
					cantidad.push(item.total)	
				})
				let newData = {};
				newData.labels = labels;
				newData.cantidad = cantidad;
		    cb(null, newData); //return callback(null, data);
		  });
		});
	}

	Venta.remoteMethod('porProducto', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });

};

