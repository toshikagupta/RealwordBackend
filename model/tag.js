
const Sequelize=require('sequelize');
const DT = Sequelize.DataTypes

const TagModel = {
    tagName: {
        type: DT.STRING(20),
        primaryKey: true
    }
} 
module.exports = {
    TagModel
}