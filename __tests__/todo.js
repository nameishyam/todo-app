const request = require("supertest");
const db = require("../models/index");
const app = require("../app");
var cheerio = require("cheerio");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("sign up", async () => {
    let res = await agent.get(`/signup`);
    const csrfToken = extractCsrfToken(res);
    res = await agent.post(`/users`).send({
      fname: "Test",
      lname: "User",
      email: "user.a@test.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("create a new todo", async () => {
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Mark a todo as incomplete", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    let res = await agent.get("/todos"); //step1
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    let groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    let parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    let dueTodayCount = parsedGroupedResponse.dueToday.length;
    let latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    let markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: "updateCompleted",
    });
    let parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
    // expect(markCompleteResponse.statusCode).toBe(302);

    groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    let completedCount = parsedGroupedResponse.completed.length;
    latestTodo = parsedGroupedResponse.completed[completedCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: "updateCompleted",
    });
    parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(false);
    // expect(markCompleteResponse.statusCode).toBe(302);
  });
});
