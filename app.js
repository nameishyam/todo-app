/* eslint-disable no-undef */

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
var csrf = require("csurf");
var cookieParser = require("cookie-parser");
const { Todo, User } = require("./models");

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser("im the ceo, bitch!"));
app.use(csrf({ cookie: true }));
app.use(express.static(path.join(__dirname, `public`)));

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
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: request.body.password,
    });
    response.redirect(`/`);
  } catch (error) {
    console.log(error);
  }
});

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
