import { UserModel } from '../model/User';
import {NextFunction,Request,Response} from 'express';
import { HttpStatus } from '../helpers/http-status';
import { UserData } from '../interfaces/UserData';

export async function AuthMiddleware(req:Request,res:Response,next:NextFunction):Promise<void>{
    const { authorization } =req.headers;
    if (authorization){
        try{
                const accessToken:string = authorization.split(' ')[1];
                const user:UserData = await UserModel.verifyUser(accessToken);
                req.body.user = user;
                req.body.token = accessToken;
                next();
        }
        catch(err){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
        }
    }
    else
        res.sendStatus(HttpStatus.UNAUTHORIZED);
}

export  function checkUserRole(currentRoleId:number){
    return  (req:Request,res:Response,next:NextFunction)=>{
        const { user } = req.body;
        if  (user.role.roleId === currentRoleId)
            next();
        else
            res.sendStatus(HttpStatus.FORBIDDEN);

    }
}