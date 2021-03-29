const express=require('express')
const https=require('https')
const http=require('http')
const path=require('path')
const fs=require('fs')
const ws=require('ws')
const app=express()
const morgan=require('morgan')
const {sequelize,users,Chat}=require('./models')
const utilPromisifyall = require('util-promisifyall')
const crypto= require('crypto')
const bycrpt=utilPromisifyall(require('bcrypt'))
function validatePassword(password) {
  return (
    typeof password == "string" &&
    /\w/.test(password) &&
    /\d/.test(password) &&
    password.length >= 8
  );
}
app.use(morgan('combined'))
app.use(express.json())
app.post('/user/register',async(req,res)=>{
    var {username,secret,pid,password}=req.body;
    try{
      if(await users.findOne({where:{username}}))
      {
        throw {mesg:"user already exist"}
      }
      else if(! validatePassword(password))
        throw {mesg:"password is weak"}
      else 
      {
        var saltedpass=await bycrpt.hash(password,12)
        var user=await users.create({username,secret,pid,password:saltedpass})
        return res.json(user)
      }
    }
    catch(e)
    {
      return res.json({...e,success:false})
    }
})
app.post('/user/login',async(req,res)=>{
    var {username,password}=req.body;
    try{
      var user=await users.findOne({username})
      if(user===null || (!await bycrpt.compare(password,user.password)))
        throw {mesg:"username and password does not match any registry"}
      else return res.json(user)
    }
    catch(e)
    {
      res.json({...e,success:false})
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
      return res.json(e)
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
      return res.json(e)
    }
})
app.get('/user/:uuid?',async(req,res)=>{
    var uuid=req.params.uuid;
    var query=uuid?{uuid}:{}
    try{
      var user=await users.findAll({where:query})
      return res.json(user)
    }
    catch(e)
    {
      return res.json(e)
    }
})
async function main()
{
  await  sequelize.sync()
}
var options = {
  key: fs.readFileSync(path.join(__dirname,'key.pem')),
  cert: fs.readFileSync(path.join(__dirname,'cert.pem')),
  passphrase:'1234'
};

var server=http.createServer(app)
const io = require('socket.io')(server);

function verifysignature(text,sign,publicKeybase64)
{
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.update(text, 'ascii')
  const publicKeyBuf = Buffer.from(publicKeybase64, 'base64')
  const signatureBuf = Buffer.from(sign, 'base64')
  return verifier.verify(publicKeyBuf,signatureBuf)
}
function createSignature(text,privateKeyBase64Locked)
{
  let sign = crypto.createSign('RSA-SHA256')
  sign.update(text,'ascii')
  return sign.sign({key:Buffer.from(privateKeyBase64Locked.key,'base64'),passphrase:privateKeyBase64Locked.passphrase}, 'base64')
}
function authenticateClient(client){
  return new Promise((res,rej)=>{
  const payload=Math.random().toString().slice(2)
      client.emit('auth-request',{type:'auth-request',payload},async (response)=>
    {  console.log("acked",response);
        var user=await users.findOne({where:{username:client.handshake.auth.username}})
        if(verifysignature(payload,response,user.pid))
          {
            console.log('client varified')
            res(user)
          }
        else rej(null)

})})
}

io.use(async function(socket, next){
  console.log('before connection');
  next()
})
io.on('connection',async client => {
  console.log('connected!')
  var user=await authenticateClient(client);
  client.join(user.uuid)
  client.session={user,listenFrom: new Set()}
  client.on('listen-from',(useruuid)=>{
    client.session.listenFrom.add(useruuid)
  })
  client.on('stop-listen-from',(useruuid)=>{
    client.session.listenFrom.delete(useruuid)
  })
  client.on('chat-message',async (message)=>{
    var room=io.in(user.uuid)
    var sids=(await room.allSockets())
    for(let sid of sids)
    {
      let socket=io.sockets.sockets.get(sid)
      if (socket.session.listenFrom.has(user.uuid))
        socket.emit('chat-message',message)
    }
    // if(room?.listenFrom?.has(message.from))
    // room.emit(message)
  })
  client.on('save-new-keys',async (message,ack)=>{
      await user.update({secret:message.payload.secret,pid:message.payload.secret})
      ack({success:true})
  })
  client.on('disconnect', () => {  });
});
server.listen(8080,async()=>{
  await main()
  console.log("http://localhost:8080/")
})