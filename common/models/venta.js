'use strict';

module.exports = function(Venta) {
	Venta.porMes = function(cb) {
	Venta.getDataSource().connector.connect(function(err, db) {
	  let ventaCollection = db.collection('Venta');
	  ventaCollection.aggregate([
	  	{ $project: { 
        month: { $month: "$fecha_venta" },
        year: { $year: "$fecha_venta" }
    	}},
	    { $group: {
	      _id: { year: "$year", month: "$month" },
	    	total: { $sum: 1 }
	    }}
		  ], function(err, data) {
		    if (err) cb(err); //return callback(err);
		    cb(null, data); //return callback(null, data);
		  });
		});
	}

	Venta.remoteMethod('porMes', {
    //accepts: {arg: 'filter', type: 'object', description: '{"where:{...}, "groupBy": "field"}'},
    returns: {arg:'data', type:['object'], root:true}
  });

};
