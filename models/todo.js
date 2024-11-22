"use strict";
const { Model } = require("sequelize");
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
