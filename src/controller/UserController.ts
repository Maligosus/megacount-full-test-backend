import jwt from 'jsonwebtoken';
import { UserData } from '../interfaces/UserData';
import { UserModel} from '../model/User';
import express,{ Request,Response,RequestHandler} from 'express';
import { HttpStatus } from '../helpers/http-status';
import { PGErrors } from '../helpers/constants';
import { LOGIN_ALREADY_EXISTS_ERROR, UNKNOWN_ERROR } from '../helpers/app-errors';
import { UserRoleConstants } from '../interfaces/UserRole';


export class UserController{
    public static async loginUser(req:Request,res:Response):Promise<void>{
        console.log("login");
        const { login,password } = req.body;
        if (login && password && login.length>0 && password.length>0)
                try{
                        const loginResult = await UserModel.loginUser(login,password);
                        console.log(loginResult);
                        res.status(HttpStatus.OK).send(loginResult);
                }
                catch(err){
                    if (err.code === HttpStatus.NOT_FOUND)
                        res.sendStatus(HttpStatus.FORBIDDEN);
                    else
                        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
                }
        else{
            console.log("NO CONTENT");
            res.status(HttpStatus.NO_CONTENT).send({
                code : HttpStatus.NO_CONTENT,
                message: " User or password must be non-empty"
            });
        }
    }
    public static async verifyUser(req:Request,res:Response):Promise<void>{
        const { authorization } = req.headers;
        if (authorization)
            try{
                const token:string = authorization.split(' ')[1];
                const user = await UserModel.verifyUser(token);
                res.status(HttpStatus.OK).send(user);
            }
            catch(err){
                res.sendStatus(HttpStatus.UNAUTHORIZED);
            }
        else
            res.sendStatus(HttpStatus.UNAUTHORIZED);
    }
    public static registryUser(req:Request,res:Response):void{
        console.log("registry");
        const { login,password,confirmPassword } =req.body;
        console.log(req.body);
        if (password!=confirmPassword){
            res.sendStatus(HttpStatus.FORBIDDEN);
            return;
        }
        if (login && password && login.length>0 && password.length>0)
            UserModel.registerUser(login,password)
            .then(()=>{
                res.sendStatus(HttpStatus.OK);
            })
            .catch(err=>{
                if (err.code === PGErrors.UNIQUE_VIOLATION)
                    res.sendStatus(HttpStatus.CONFLICT);
                else
                    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            });
        else if (login.length===0 || password.length===0)
            res.sendStatus(HttpStatus.NO_CONTENT);    
    }

}