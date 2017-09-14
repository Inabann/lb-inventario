module.exports = function(app) {
  let created = true; //para q no se repita otra vez "true", cuando ya se ha creaedo un admin
  if (!created) {
    var User = app.models.usuario;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    User.create([
      {username: 'almacen',email: 'almacen@gmail.com', password: 'admin'}
    ], function(err, users) {
      if (err) throw err;

      console.log('Created admin:', users);
     
      //create the admin role
      Role.create({
        name: 'admin'
      }, function(err, role) {
        if (err) throw err;

        console.log('Created role:', role);

        //make an admin
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: users[0].id
        }, function(err, principal) {
          if (err) throw err;
          console.log('Created principal:', principal);
        });
      });
    });
  }

  
};

// 59b4413783ef363708753ff4 