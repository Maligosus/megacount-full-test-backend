import express,{Express,Request,Response} from 'express';
import { UserModel} from './model/User';
import userRouter from './router/UserRouter';
import { GroupModel } from './model/Group';

const app:Express=express();

app.use(express.urlencoded({
    limit:"64mb",
    extended:true
}));

app.use(express.json({
    limit:"64mb"
}));

app.use("/auth",userRouter);


app.listen(8080,()=>{
    /*login()
      verify*/
});