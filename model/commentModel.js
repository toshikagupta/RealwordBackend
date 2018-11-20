const Sequelize = require('sequelize');
const DT = Sequelize.DataTypes;

const CommentModel = {
    commentId: {
        type: DT.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    body: {
        type: DT.TEXT,
        allowNull: false
    }
}

module.exports = {
    CommentModel
}