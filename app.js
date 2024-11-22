/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path");
const { Todo } = require("./models");
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get(`/`, async (request, response) => {
  const getTodos = await Todo.getAllTodos();
  if (request.accepts(`html`)) {
    response.render(`index`, {
      getTodos,
    });
  } else {
    response.json({
      getTodos,
    });
  }
});

app.use(express.static(path.join(__dirname, `public`)));

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

app.post(`/todos`, async (request, response) => {
  console.log(`Todo created`, request.body);
  try {
    const todo = await Todo.addTodo({
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
    const remainingTodos = await Todo.findAll();
    return response.status(200).json(remainingTodos);
  } catch (error) {
    console.log(error);
    return response.status(422).json({ error: error.message });
  }
});

module.exports = app;
