const Sequelize = require('sequelize')
const {UserModel, UserDetailModel}=require('./model/userdetails.js')
const{ArticleModel} =require('./model/article.js')
const{TagModel}=require('./model/tag.js')
const db = new Sequelize({
  dialect: 'sqlite',
  /* server based databases
  username: '...',
  database: '...',
  password: '...',
  host: 'abcd.server.com',
  port: 3333,
   */
  storage: __dirname + '/test.db',
})

 db.authenticate()
    .then(function () {
        console.log("CONNECTED!");
    })
    .catch(function (err) {
        console.log(err);
    })
    .done();

    const User=db.define('user',UserModel);
    const UserDetails=db.define('userdetail',UserDetailModel);
    UserDetails.belongsTo(User,{foreignKey:'user_id'});
    User.hasOne(UserDetails,{foreignKey:'user_id'});


    User.belongsToMany(User,{as:'follower', foriegnKey:'followingId', through:'UserMapping'});
    User.belongsToMany(User,{as:'following', foreignKey:'followerId', through:'UserMapping'});

    const Article=db.define('article', ArticleModel);    

    Article.belongsTo(User, {sourceKey: 'author'});
    User.hasMany(Article, {foreignKey: 'author'});
    
    Article.belongsToMany(User, {as: 'favouritedBy', foreignKey: 'articleId', through: 'FavouriteArticle'});
    User.belongsToMany(Article, {as: 'favourites', foreignKey: 'userId', through: 'FavouriteArticle'});
    

    const Tags = db.define('tags', TagModel);

    Tags.belongsToMany(Article, {foreignKey: 'tagName', through: 'ArticleTags'});
    Article.belongsToMany(Tags, {foreignKey: 'articleId', through: 'ArticleTags'}); 
   
    db.sync()
   
    module.exports= {
        db,
        User,
        UserDetails,
        Article,
        Tags
        
    }
