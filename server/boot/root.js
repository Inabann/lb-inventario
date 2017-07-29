'use strict';

module.exports = function(server) {
  // Install a `/` route that returns server status
  // var router = server.loopback.Router();
  // router.get('/', server.loopback.status());
  // server.use(router);
  let Producto = server.models.Producto;
  //var productoCollection = Producto.getDataSource().connector.collection(Producto.modelName);
  //console.log(productoCollection);


  Producto.getDataSource().connector.connect(function(err, db) {
  let productoCollection = db.collection('Producto');
  productoCollection.aggregate([
    { $group: {
      _id: "$modelosId",
     cantidad: { $sum: "$cantidad" }
    }}
	  ], function(err, data) {
	    if (err) console.log(err); //return callback(err);
	    console.log(data); //return callback(null, data);
	  });
	});
};
