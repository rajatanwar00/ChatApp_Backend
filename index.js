const express= require('express');
const http=require('http')
const {Server}=require('socket.io')
const cors=require('cors')

const Port=3000;

const app=express();
const server= http.createServer(app);
const io=new Server(server,{
    cors:{
        origin: "*",
        methods: ["GET","POST"]
    }
});

app.use(cors());



app.get('/',(req,res)=>{
    res.send("Server is active");
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