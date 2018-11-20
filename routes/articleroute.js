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
route.get('/article/:slug',async (req,res)=>{
    const slug=req.params.slug
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
        console.log("tag"+tagArray[i]);
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
module.exports=route