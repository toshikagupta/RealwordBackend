const Sequelize = require('sequelize');
const DT = Sequelize.DataTypes;

const ArticleModel = {
    articleId: {
        type: DT.UUID,
        primaryKey: true,
        defaultValue: DT.UUIDV1
    },
    slug: {
        type: DT.STRING(45),
        unique: true,
        allowNull: false
    },
    title: {
        type: DT.STRING(45),
        allowNull: false,
        validate: {
            notEmpty: true,
            min: 1
        }
    },
    description: {
        type: DT.STRING(45),
        allowNull: false,
        validate: {
            notEmpty: true,
            min: 1
        }
    },
    body: {
        type: DT.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    favoritesCount: {
        type: DT.INTEGER
    },
    author: DT.UUID
}

module.exports = {
    ArticleModel
}
