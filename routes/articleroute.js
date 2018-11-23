const express=require('express');
const route=express.Router();
const {generateUUID}=require('../services/userId'); 
const {User, UserDetails, Article, Tags}= require('../index.js')
const {encryptPassword, isValidPassword}=require('../services/bcrypt')
const {generateToken, getIdFromToken}=require('../services/token')
var Slug =require('slug')

route.get('/articles', async(req,res)=>{
   const articles= Article.findAll()
   return res.status(201).json({
    articles
   })

})
route.get('/tags', async(req,res)=>{
    const tags=Tags.findAll()
    return res.status(201).json({
        tags
    })
})
route.get('/article/:slug',async (req,res)=>{
    const Slug=req.params.slug
    const article=await Article.findOne({
        where:{
            slug:Slug
        }
    })
    
    const articleUser=await User.findById(article.userUserId);
   
    const token=req.headers.token;
    let isFollow=false;
    const user_id=await getIdFromToken(token)
    console.log("user_id"+user_id);
    const userDetails=await UserDetails.findOne({
        where:{
            user_id:user_id
        }
    })
    if(user_id!=null)
    {
        const user=await User.findByPrimary(user_id)
       
       isFollow= await articleUser.hasFollower(user);
        console.log(isFollow)
    }
    if(article)
    {
        let tagsObjectList = await article.getTags();

        let tagsList = [];

        for(let i=0; i<tagsObjectList.length; i++) {
            tagsList.push(tagsObjectList[i].tagName);
        }
        res.status(200).json({
            article: {
                slug: article.slug,
                title: article.title,
                description: article.description,
                body: article.body,
                tagList: tagsList,
                createdAt: article.createdAt,
                updatedAt: article.updatedAt,
                favoritesCount: article.favoritesCount,
                author: {
                    username: userDetails.username,
                    bio: userDetails.bio,
                    image: userDetails.image,
                    following: isFollow
                }
            }
        })
    }
    else{
        return res.status(404).json({
            errors: {
                message: "Article not found"
            }
        })
    }
})
route.put('/article/:slug', async(req, res)=>{

    let originalSlug=req.params.slug;
    try{
    let originalArticle=await Article.findOne({
        where:{
            slug: req.params.slug
        }
    });
   
    
    const author=await UserDetails.findOne({
        where:{
           user_id:originalArticle.userUserId
        }
    }
    )
   
    const token=req.headers.token;
    
    const user_id=await getIdFromToken(token)
    if(token)
    {
        if(req.body.article.title) {
            originalArticle.title = req.body.article.title;
            const newSlug = await Slug(req.body.article.title);
            originalArticle.slug = newSlug;
        }
        if(req.body.article.description) {
            originalArticle.description = req.body.article.description;
        }
        if(req.body.article.body) {
            originalArticle.body = req.body.article.body;
        }
        const updatedArticle = await originalArticle.save();
        

        let tagsObjectList = await updatedArticle.getTags();

        let tagsList = [];

        for(let i=0; i<tagsObjectList.length; i++) {
            tagsList.push(tagsObjectList[i].tagName);
        }

        return res.status(200).json({
            article: {
                slug: updatedArticle.slug,
                title: updatedArticle.title,
                description: updatedArticle.description,
                body: updatedArticle.body,
                tagList: tagsList,
                createdAt: updatedArticle.createdAt,
                updatedAt: updatedArticle.updatedAt,
                favorited: false,
                favoritesCount: updatedArticle.favoritesCount,
                author: {
                    username: author.username,
                    bio: author.bio,
                    image: author.image,
                    following: false
                }
            }
        })

    } 
    
    else
    {
        return res.status(401).json(
            {
              errors:{
                message:["Unauthorized User"]
              }
            }
          )
    }
    }
    catch(err)
    {
        return res.status(500).json({
           errors:{
               message:["Internal Server error"]
           } 
        })
    }
})
route.get('/articles/feed', async (req, res)=>{
    try{
    const token=req.headers.token
    console.log("token"+token)
    const user_id =await getIdFromToken(token)
    console.log("user_id"+user_id);
    
    if(user_id)
    {
       let feedArticles=[]
       const articles = await Article.findAll();

    let currentUser = await User.findByPrimary(user_id);
    
    for(let i=0; i<articles.length; i++) {
        let authorId = articles[i].dataValues.userUserId;
        let author = await User.findByPrimary(authorId);
        let isFollowing = await author.hasFollower(currentUser);
        if(isFollowing) {
            let tagsObjectList = await articles[i].getTags();

            let tagsList = [];

            for(let i=0; i<tagsObjectList.length; i++) {
                tagsList.push(tagsObjectList[i].tagName);
            }

            let creatorDetails = await UserDetail.findOne({
                where: {
                    userId: authorId
                }
            });

            let article = {
                slug: articles[i].slug,
                title: articles[i].title,
                description: articles[i].description,
                body: articles[i].body,
                tagList: tagsList,
                createdAt: articles[i].createdAt,
                updatedAt: articles[i].updatedAt,
                favoritesCount: articles[i].favoritesCount,
                author: {
                    username: creatorDetails.username,
                    bio: creatorDetails.bio,
                    image: creatorDetails.image,
                    following: isFollowing
                }
            }
            feedArticles.push(article);
        }
    }
    return res.status(200).json({
        articles: feedArticles
    })
}
    else
    {
        return res.status(401).json(
            {
              errors:{
                message:["Unauthorized User"]
              }
            }
          )
    }
    }
    catch(err)
    {
        return res.status(500).json({
            errors:{
                message:["Internal Server Error"+ err]
            }
        })
    }
})
route.delete('/article/:slug', async(req, res)=>{
    const token=req.headers.token
    if(token)
    {
        const Slug=req.params.slug
        const article=await Article.findOne({
            where:{
                slug:Slug
            }
        })
        if(article)
       { await article.destroy();
        return res.sendStatus(202);
       }
       else
       {
        return res.status(404).json(
            {
              errors:{
                message:["Article not available"]
              }
            }
          )
    
       }
    }else{
        return res.status(401).json(
            {
              errors:{
                message:["Unauthorized User"]
              }
            }
          )
    }
})
route.post('/article',async (req,res)=>{
    const token=req.headers.token
    const user_id= await getIdFromToken(token)
    
    const user= await UserDetails.findOne({
        where: {
      user_id: user_id
        }
  })
    
    if(user!=null)
 {try{
   const articl= await Article.create({
        slug:Slug(req.body.article.title),
        title:req.body.article.title,
        description:req.body.article.description,
        body:req.body.article.body,
        favoritesCount:0
    })
    articl.setUser(user_id);
    articl.setTags(req.body.article.tagList);

   
    let profile = { username: user.username,
         bio: user.bio,
          image: user.image, 
          following: 'false' }

    let article = { slug: articl.slug, 
        title: articl.title, 
        description: articl.description,
         body: articl.body, 
         favoritedCount: articl.favoritesCount, 
         createdAt: articl.createdAt, 
         updatedAt: articl.updatedAt,
          tagList: req.body.article.tagList,
           author: profile }
           console.log( req.body.article.tagList)
    tagArray = req.body.article.tagList
    for (i = 0; i < tagArray.length; i++) {
       
       await Tags.findOrCreate({
           where:{ tagName:tagArray[i]}
        })
   }
    return res.status(201).json({
        article
    })
 } catch(err) {
    res.status(500).json({
      errors: {
        message: ["Something went wrong"+err]
      }
    })
  }}
 else{
    res.status(404).json({ 
        message: 'The requested User does not exist' })
 }
})
route.post('/articles/:slug/favorite', async(req, res)=>{
    const token=req.headers.token
    const user_id=await getIdFromToken(token)
    const currentUser=await User.findById(user_id);
    let slugVal=req.params.slug
    let article=Article.findOne({
        where:{
            slug:slugVal
        }
    })
    if(article==null||currentUser==null)
    {
        return res.status(500).json({
            errors:
            {
                message:["Internal Server Error"]
            }
        })
    }
    console.log(article.__proto__);
        await article.addFavouritedBy(currentUser);
      article.favoritedCount++;
     let updatedArticle= article.save(); 
     let tagsList = [];
     for(let i=0; i<tagsObjectList.length; i++) {
         tagsList.push(tagsObjectList[i].tagName);
     }
     

     const authorUser = await User.findById(updatedArticle.userUserId);

     const author = await UserDetail.findOne({
         where: {
             userId: updatedArticle.userUserId
         }
     });

     const isFollowing = await authorUser.hasFollower(currentUser);

     return res.status(200).json({
         article: {
             slug: updatedArticle.slug,
             title: updatedArticle.title,
             description: updatedArticle.description,
             body: updatedArticle.body,
             tagList: tagsList,
             createdAt: updatedArticle.createdAt,
             updatedAt: updatedArticle.updatedAt,
             favorited: true,
             favoritesCount: updatedArticle.favoritesCount,
             author: {
                 username: author.username,
                 bio: author.bio,
                 image: author.image,
                 following: isFollowing
             }
         }
     })


    
})

module.exports=route