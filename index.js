const {sequelize,users,Chat}=require('./models')
const express=require('express')
const app=express()

app.use(express.json())
app.post('/user',async(req,res)=>{
    var {username}=req.body;
    try{
      var user=await users.create({username})
      return res.json(user)
    }
    catch(e)
    {
      return res.status(400).json(e)
    }
})
app.post('/message',async(req,res)=>{
    var {toid,fromid,message}=req.body;
    try{
      var message=await Chat.create({toid,fromid,message})
      return res.json(message)
    }
    catch(e)
    {
      return res.status(400).json(e)
    }
})
app.get('/message',async(req,res)=>{
    var {toid,fromid}=req.query;
    var query=toid? {toid}:{}
    query=fromid? {...query,fromid}:query
    try{
      var message=await Chat.findAll({where:query})
      return res.json(message)
    }
    catch(e)
    {
      return res.status(400).json(e)
    }
})
app.get('/user/:uuid',async(req,res)=>{
    var uuid=req.params.uuid;
    try{
      var user=await users.findAll({where:{uuid}})
      return res.json(user)
    }
    catch(e)
    {
      return res.status(400).json(e)
    }
})
async function main()
{
  await  sequelize.sync()
}
app.listen(8080,async()=>{
  await main()
  console.log("http://localhost:8080/")
})