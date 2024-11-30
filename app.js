/* eslint-disable no-undef */

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const localStrategy = require("passport-local");
const session = require("express-session");
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

app.use(
  session({
    secret: `its my application`,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new localStrategy(
    {
      usernameField: `email`,
      passwordField: `password`,
    },
    (username, password, done) => {
      User.findOne({ where: { email: username, password: password } })
        .then((user) => {
          return done(null, user);
        })
        .catch((error) => {
          return error;
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(`Serializing user in session`, user.id);
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

app.get(`/`, async (request, response) => {
  const getTodos = await Todo.getAllTodos();
  if (request.accepts(`html`)) {
    response.render(`index`, {
      getTodos,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      getTodos,
    });
  }
});

app.get(
  `/todos`,
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const getTodos = await Todo.getAllTodos();
    if (request.accepts(`html`)) {
      response.render(`todos`, {
        getTodos,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        getTodos,
      });
    }
  }
);

app.get(`/todos`, async (request, response) => {
  console.log(`Todo list`);
  try {
    const todos = await Todo.getAllTodos();
    return response.status(200).json(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json({ error: error.message });
  }
});

app.get(`/signup`, (request, response) => {
  response.render(`signup`, { csrfToken: request.csrfToken() });
});

app.post(`/users`, async (request, response) => {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedPwd);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
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
  passport.authenticate(`local`, { failureRedirect: `/login` }),
  (request, response) => {
    console.log(request.user);
    response.redirect(`/todos`);
  }
);

app.post(`/todos`, async (request, response) => {
  console.log(`Todo created`, request.body);
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    return response.redirect(`/`);
  } catch (error) {
    console.log(error);
    return response.status(422).json({ error: error.message });
  }
});

app.put(`/todos/:id/markAsCompleted`, async (request, response) => {
  console.log(`Todo marked as complete`, request.params.id);
  try {
    const todo = await Todo.findByPk(request.params.id);
    const updatedTodo = await todo.markAsCompleted();
    return response.status(200).json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json({ error: error.message });
  }
});

app.delete(`/todos/:id`, async (request, response) => {
  console.log(`Todo deleted`, request.params.id);
  try {
    await Todo.deleteTodo(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(422).json({ error: error.message });
  }
});

module.exports = app;
