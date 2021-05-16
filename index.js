const express = require('express')
const mongoose = require('mongoose');
const session = require('express-session')
const redis = require('redis')
const cors = require('cors')
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP ,MONGO_PORT, REDIS_URL, SESSION_SECRET, REDIS_PORT} = require('./config/config');

let redisStore = require('connect-redis')(session)
let redisClient = redis.createClient({
    host : REDIS_URL,
    port : REDIS_PORT
})
const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")
const app = express()

const connectWithRetry = () => {

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`


mongoose
.connect(mongoURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false
})
.then(()=> console.log(' successfully connected to DB'))
.catch((e)=> console.log(e));

//setTimeout(connectWithRetry,5000);

}
connectWithRetry();
app.enable("trust proxy");
app.use(session({
    store : new redisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie:{
        secure:false,
        resave:false,
        saveUninitialized:false,
        httpOnly:true,
        maxAge:30000,
    }
}))
app.use(express.json())
app.use(cors({}))
app.get('/api/v1' , (req,res) =>{
    console.log(' very well')
} );


app.use("/api/v1/posts",postRouter);
app.use("/api/v1/users", userRouter)

const port = process.env.PORT  || 3000;

app.listen(port,()=>console.log(` listening on port ${port}`))