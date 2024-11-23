/* eslint-disable no-unused-vars */
"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static async getAllTodos() {
      return this.findAll();
    }
    static addTodo({ title, dueDate }) {
      return this.create({
        title,
        dueDate,
        completed: false,
      });
    }
    static async deleteTodo(id) {
      await this.destroy({
        where: {
          id: id,
        },
      });
    }

    displayPrintableTodos() {
      return `${this.title} - ${this.dueDate} - ${this.completed}`;
    }

    markAsCompleted() {
      return this.completed
        ? this.update({ completed: false })
        : this.update({ completed: true });
    }

    static async dueToday() {
      const dueTodayTodos = await this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toISOString().split("T")[0],
          },
        },
      });
      return dueTodayTodos;
    }

    static async dueLater() {
      const dueLaterTodos = await this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toISOString().split("T")[0],
          },
        },
      });
      return dueLaterTodos;
    }

    static async dueBefore() {
      const dueBeforeTodos = await this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().split("T")[0],
          },
        },
      });
      return dueBeforeTodos;
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
