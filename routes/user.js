const express=require('express');
const route=express.Router();
const {generateUUID}=require('../services/userId'); 
const {User, UserDetails}= require('../index.js')
const {encryptPassword, isValidPassword}=require('../services/bcrypt')
const {generateToken, getIdFromToken}=require('../services/token')



route.post('/users',async (req, res) => {
    const userId=await generateUUID();
    const hashedpassword=await encryptPassword(req.body.user.password);

    try{
        const newUser=await User.create({
            email:req.body.user.email,
            password:hashedpassword,
            user_id:userId
        })
        const newUserDetails = await UserDetails.create({
            user_id: userId,
            username: req.body.user.username
          })
      
      const token=await generateToken(userId);
      
      res.status(201).json({
        user: {
          token: token,
          email: newUser.email,
          username: newUserDetails.username,
          bio: null,
          image: null
        }
      })
                
    }
    
    catch(err) {
        res.status(500).json({
          errors: {
            message: ["Something went wrong"]
          }
        })
      }
  })
  route.post('/users/login', async(req, res)=>{

    let email=req.body.user.email
   
   
   const user=await User.findOne({
  		where: {
        email: email
  		}
    })
   
    if(user==null)
    {
      return res.status(400).json(
        {
          errors:{
            message:["Incorrect Email"]
          }
        }
      )
    }
    let decryptedPassword=isValidPassword(req.body.user.password,user.dataValues.password);
    if(decryptedPassword)
  {   return res.status(201).json({
    success:{
      message:["successful"]
    }
  })
    

    
  }
    else
    {
      return res.status(401).json(
        {
          errors:{
            message:["Incorrect Password"]
          }
        }
      )
    }
  })

  route.put('/user', async(req,res)=>{
    let email=req.body.user.email;
    let token=req.headers.token;
    
    const id=getIdFromToken(token)
    console.log("id "+id)
    if(token)
   { 
     
    const user=await User.findOne({
  		where: {
        email: email,
        user_id:id
  		}
    })
    console.log("user"+user);
    if(user!=null)
   { const userDetails=await UserDetails.findOne({
      where:{
        user_id:id

      }
    })
    userDetails.bio=req.body.user.bio
    userDetails.image=req.body.user.image
    userDetails.username=req.body.user.username
    userDetails.save();
    user.email=req.body.user.email
    user.password=req.body.user.password
    user.save();
 
}
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
})

  route.get('/user',async (req,res)=>{
   let user_id;
    if(req.headers.token)
    {
      user_id=getIdFromToken(req.headers.token);
      console.log(user_id);
    try{
      const user = await User.findByPrimary(user_id);


      const userDetail = await UserDetails.findOne({
        where: {
          user_id: user_id
        }
      })

      console.log(user)

     return res.status(201).json({
        user: {
          token: req.headers.token,
          email: user.dataValues.email,
          username: userDetail.dataValues.username
        }
      })

    }catch(err) {
     return res.status(500).json({
        errors: {
          message: ["Something went wrong"]
        }
      })

    }
  }
  else{
    return res.status(401).json({
      errors:{
        message:["Unauthorized"]
      }
    })
  }
  })

  module.exports = route;