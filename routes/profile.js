const express=require('express');
const route=express.Router();
const {generateUUID}=require('../services/userId'); 
const {User, UserDetails}= require('../index.js')
const {encryptPassword, isValidPassword}=require('../services/bcrypt')
const {generateToken, getIdFromToken}=require('../services/token')

route.get('/profiles/:username', async (req, res)=>{
    const username=req.params.username
    
    const userProfileDetails=await UserDetails.findOne({
        where:{
            username:username
        }
    })
    const profile_userId=userProfileDetails.user_id
    if(!req.headers.token)
    {
        return res.status(201).json({
            profile: {
                username: userProfile.username,
                bio: userProfile.bio,
                image: userProfile.image,
                following: false
            }
          })
    }
    else{
        const user_id=getIdFromToken(req.headers.token)
        if(user_id!=null)
        {
const userProfile=await User.findByPrimary(profile_userId)            
const userLoggedIn= await User.findByPrimary(user_id)
console.log(userLoggedIn.__proto__);
isFollowing=await userProfile.hasFollowing(userLoggedIn)
console.log(isFollowing)
return res.status(201).json({
    profile: {
      username: userProfileDetails.username,
      bio: userProfileDetails.bio,
      image: userProfileDetails.image,
     following:isFollowing
    }
 })
        }
        else{
            return res.status(401).json({
                errors:{
                    body:["UnAuthorised User"]
                }
            })
        }

    }

})

route.post('/profiles/:username/follow', async (req,res)=>{

    const username=req.params.username
    
    const userProfileDetails=await UserDetails.findOne({
        where:{
            username:username
        }
    })
    const profile_userId=userProfileDetails.user_id
    const token=req.headers.token
    const user_id=getIdFromToken(req.headers.token)
    if(token&&user_id)
    {
        const userProfile=await User.findByPrimary(profile_userId)            
        const userLoggedIn= await User.findByPrimary(user_id)
        console.log(userLoggedIn.__proto__);
        isFollowing=await userProfile.hasFollowing(userLoggedIn)
        userProfileDetails.following=true
        return res.status(201).json({
            profile: {
              username: userProfileDetails.username,
              bio: userProfileDetails.bio,
              image: userProfileDetails.image,
             following:userProfileDetails.following

            }
        })
     
    }else{
        return res.status(401).json({
            errors:{
                body:["UnAuthorised User"]
            }
        })
    }

})

route.post('/profiles/:username/unfollow', async (req,res)=>{

    const username=req.params.username
    
    const userProfileDetails=await UserDetails.findOne({
        where:{
            username:username
        }
    })
    const profile_userId=userProfileDetails.user_id
    const token=req.headers.token
    const user_id=getIdFromToken(req.headers.token)
    if(token&&user_id)
    {
        const userProfile=await User.findByPrimary(profile_userId)            
        const userLoggedIn= await User.findByPrimary(user_id)
        console.log(userLoggedIn.__proto__);
        isFollowing=await userProfile.hasFollowing(userLoggedIn)
        userProfileDetails.following=false
        return res.status(201).json({
            profile: {
              username: userProfileDetails.username,
              bio: userProfileDetails.bio,
              image: userProfileDetails.image,
             following:userProfileDetails.following

            }
        })
     
    }else{
        return res.status(401).json({
            errors:{
                body:["UnAuthorised User"]
            }
        })
    }

})
module.exports=route

