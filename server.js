const express= require('express')

const {
    db
  } = require('./index.js')

  const app=express();

  app.use(express.json());
  app.use(express.urlencoded({
    extended: true
  }))
  
//   app.get('/',function(req,res){
//       res.send("hello world")
//   })

  app.use('/api',require('./routes/user'))
 app.use('/api', require('./routes/profile'))
 app.use('/api', require('./routes/articleroute'))

 app.listen(3939,() => {
     console.log('server started')
 })