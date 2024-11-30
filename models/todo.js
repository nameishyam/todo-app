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
      Todo.belongsTo(models.User, {
        foreignKey: `userId`,
      });
    }

    static async getAllTodos(userId) {
      return await this.findAll({
        where: {
          userId: userId,
        },
      });
    }
    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title,
        dueDate,
        completed: false,
        userId,
      });
    }
    static async deleteTodo(id, userId) {
      await this.destroy({
        where: {
          id,
          userId,
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
