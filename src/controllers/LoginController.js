function index(req, res) {
  if (req.session.loggedin) {
    res.redirect('/');
	
  } else {
    res.render('login/index');
  }
}

function register(req, res) {
  res.render('login/register');
}
async function authRegister(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  try {
      const newUser = {
          id: Date.now().toString(),
          username: email,
          passwordHash: password
      };
      const container = await req.cosmosClient.database("User").container("User");
      const { resource } = await container.items.create(newUser);

      res.render("login", { alertMessage: 'Perfecto, ahora inicia sesión.' });

  } catch (error) {
      console.error("Error al registrar el usuario:", error.message);
      res.render('login/register', { alertMessage: 'Error al registrar el usuario.' });
  }
}
async function auth(req, res) {
  let email = req.body.email;
  let password = req.body.password;

  console.log(email, password);

  try {
      const ds = await req.cosmosClient.database("User").container("User");
      const { resources: users } = await ds.items.query({
          query: "SELECT * FROM c"
      }).fetchAll();

      console.log(users);

      const container = await req.cosmosClient.database("User").container("User");
      const { resources } = await container.items.query({
          query: "SELECT * FROM c WHERE c.username = @email",
          parameters: [{ name: "@email", value: email }]
      }).fetchAll();

      if (resources.length > 0) {
          const user = resources[0];
          if (password !== user.passwordHash) {
              console.log('Contraseña incorrecta.');
              res.render('login', { alertMessage: 'Contraseña incorrecta.' });
              return;
          }

          console.log(user);
          req.session.loggedin = true;
          req.session.name = user.username;
          res.redirect('/');
      } else {
          console.log('Usuario no encontrado.');
          res.render('login', { alertMessage: 'Usuario no encontrado.' });
      }
  } catch (error) {
      console.error("Error al consultar en Cosmos DB:", error.message);
      res.render('login', { alertMessage: 'Error al consultar el usuario.' });
  }
}


function logout(req, res) {
  if (req.session.loggedin) {
    req.session.destroy();
  }
  res.redirect('/');
}


module.exports = {
  index: index,
  register: register,
  auth: auth,
  logout: logout,
  authRegister:authRegister
}
