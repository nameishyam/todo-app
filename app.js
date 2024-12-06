const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const localStrategy = require("passport-local");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
var csrf = require("csurf");
var cookieParser = require("cookie-parser");
const { Todo, User } = require("./models");

const saltRounds = 10;

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser("im the ceo, bitch!"));
app.use(csrf({ cookie: true }));
app.use(express.static(path.join(__dirname, `public`)));
app.use(flash());

app.use(
  session({
    secret: `its my application`,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new localStrategy(
    {
      usernameField: `email`,
      passwordField: `password`,
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async function (user) {
          if (!user) {
            return done(null, false, { message: "User does not exist" });
          }
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, `views`));

app.get(`/`, async (request, response) => {
  if (request.accepts(`html`)) {
    response.render(`index`, {
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({});
  }
});

app.get(
  `/todos`,
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    const getTodos = await Todo.getAllTodos(loggedInUser);
    const firstName = request.user.fname;
    const lastName = request.user.lname;
    if (request.accepts(`html`)) {
      response.render(`todos`, {
        getTodos,
        firstName,
        lastName,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        getTodos,
      });
    }
  }
);

app.get(`/signup`, (request, response) => {
  response.render(`signup`, { csrfToken: request.csrfToken() });
});

app.post(`/users`, async (request, response) => {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  try {
    const user = await User.create({
      fname: request.body.firstName,
      lname: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (error) => {
      if (error) {
        console.log(error);
      }
      response.redirect(`/todos`);
    });
  } catch (error) {
    console.log(error);
  }
});

app.get(`/login`, async (request, response) => {
  response.render(`login`, { csrfToken: request.csrfToken() });
});

app.post(
  `/session`,
  passport.authenticate(`local`, {
    failureRedirect: `/login`,
    failureFlash: true,
  }),
  function (request, response) {
    response.redirect(`/todos`);
  }
);

app.get(`/signout`, (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect(`/`);
  });
});

app.get(
  `/deleteConformation`,
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    response.render(`delete`, {
      csrfToken: request.csrfToken(),
    });
  }
);

app.get(
  `/delete`,
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    const user = await User.findByPk(loggedInUser);
    const tasks = await Todo.findAll({
      where: {
        userId: loggedInUser,
      },
    });
    try {
      await Promise.all(
        tasks.map(async (task) => {
          await task.destroy();
        })
      );
      await user.destroy();
      response.redirect(`/`);
    } catch (error) {
      console.log(error);
      return response.status(422).json({ error: error.message });
    }
  }
);

app.post(
  `/todos`,
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log(request.user.id);
    try {
      await Todo.addTodo({
        title: request.body.title,
        description: request.body.description,
        dueDate: request.body.dueDate,
        dueTime: request.body.dueTime,
        userId: request.user.id,
      });
      return response.redirect(`/todos`);
    } catch (error) {
      console.log(error);
      return response.status(422).json({ error: error.message });
    }
  }
);

app.post(
  `/todos/:id/description`,
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const todo = await Todo.findByPk(request.params.id);
      const updatedTodo = request.body.description;
      todo.description = updatedTodo;
      await todo.save();
      return response.redirect(`/todos`);
    } catch (error) {
      console.log(error);
      return response.status(422).json({ error: error.message });
    }
  }
);

app.put(
  `/todos/:id/markAsCompleted`,
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const todo = await Todo.findByPk(request.params.id);
      const updatedTodo = await todo.markAsCompleted();
      return response.status(200).json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json({ error: error.message });
    }
  }
);

app.delete(
  `/todos/:id`,
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    try {
      await Todo.deleteTodo(request.params.id, loggedInUser);
      return response.json({ success: true });
    } catch (error) {
      console.log(error);
      return response.status(422).json({ error: error.message });
    }
  }
);

module.exports = app;
