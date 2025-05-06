import { OAuth2Client } from 'google-auth-library';
import { middleware, socketMiddleware } from './middleware.js';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http'
import {Server} from 'socket.io'
import cors from 'cors'
import jwt from 'jsonwebtoken';

dotenv.config();

const Port=process.env.PORT;
const clientID=process.env.CLIENT_ID;
const client = new OAuth2Client(clientID);
const SECRET_KEY=process.env.JWT_KEY;
//console.log("from index ", SECRET_KEY)

const app=express();
const server= http.createServer(app);
const io=new Server(server,{
    cors:{
        origin: "*",
        methods: ["GET","POST"]
    }
});

app.use(express.json());
app.use(cors());
app.use(middleware);
io.use(socketMiddleware); 


app.get('/',(req,res)=>{
    res.send("Server is active");
})

app.post('/login',async (req,res)=>{
    //console.log(req.body)
    const googleToken=req.body.authToken;

    try{
        const ticket=await client.verifyIdToken({
            idToken:googleToken,
            audience:clientID
        });

        const payload = ticket.getPayload();
        console.log("Payload Fetched");
        const {name,email,picture,sub}=payload;

        const serverToken=jwt.sign({name,email,picture,sub},SECRET_KEY,{expiresIn:'1d'});
        res.status(200).json({serverToken,message:"Authentication Successful"});
    }
    catch(error){
        console.log("GoogleToken Handling Error,", error);
        res.status(401).json({ error: 'Invalid ID token' });
    }

})

app.get('/user',(req,res)=>{
    const name=req.user.name;
    const picture=req.user.picture;
    const userObject={name,picture};

    res.status(201).send(userObject);
})

io.on("connect",(socket)=>{
    console.log("Websocket connected: ",socket.id);

    socket.on("msg",(data)=>{
        io.emit("chat message",data)
    })

    socket.on("disconnect",()=>{
        console.log("User Disconnected ",socket.id);
    })
})

server.listen(Port,()=>{
    console.log(`Server is running on Port ${Port}`);
})