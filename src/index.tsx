import express,{Express,Request,Response} from 'express';
import { UserModel} from './model/User';
import userRouter from './router/UserRouter';
import groupRouter from './router/GroupRouter';
import { GroupModel } from './model/Group';
import { AuthMiddleware } from './middlewares/user-middleware';
import cors from 'cors';

const app:Express=express();


app.use(cors({methods:["GET","POST","PUT","DELETE"]}));


app.use(express.urlencoded({
    limit:"64mb",
    extended:true
}));

app.use(express.json({
    limit:"64mb"
}));

app.use("/auth",userRouter);

app.use("/api/group",groupRouter);


app.listen(8080,()=>{
    /*login()
      verify*/
});