import jwt from 'jsonwebtoken';
import { UserData } from '../interfaces/UserData';
import { UserModel} from '../model/User';
import express,{ Request,Response,RequestHandler} from 'express';
import { HttpStatus } from '../helpers/http-status';
import { PGErrors } from '../helpers/constants';
import { LOGIN_ALREADY_EXISTS_ERROR, UNKNOWN_ERROR } from '../helpers/app-errors';


export class UserController{
    public static loginUser(req:Request,res:Response):void{
        const { login,password } = req.body as UserData;
        if (login && password && login.length>0 && password.length>0)
            UserModel.loginUser(login,password,(err,result)=>{
                if (err)
                    res.sendStatus(HttpStatus.NOT_IMPLEMENTED);
                else
                    if (result)
                        res.status(HttpStatus.OK).send(result);
                    else
                        res.status(HttpStatus.FORBIDDEN);

            })
        else
            res.sendStatus(HttpStatus.NO_CONTENT);
    }
    public static verifyUser(req:Request,res:Response):void{
        const { authorization } = req.headers;
        if (authorization){
            const accessToken:string=authorization.split(' ')[1];
            UserModel.verifyUser(accessToken,(err,decode)=>{
                if (err)
                    res.status(HttpStatus.UNAUTHORIZED);
                else
                    res.status(HttpStatus.OK).send(decode);
            });
        }
        else
            res.status(HttpStatus.UNAUTHORIZED);
    }
    public static registryUser(req:Request,res:Response):void{
        console.log("registry");
        const { login,password } =req.body;
        if (login && password && login.length>0 && password.length>0)
            UserModel.registerUser({login,password},(err,result) =>{
                if (err){
                    if (err.code === PGErrors.UNIQUE_VIOLATION)
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(LOGIN_ALREADY_EXISTS_ERROR);
                    else
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
                }
                else
                    res.status(HttpStatus.OK).send({
                        "message" : "OK"
                    });
                
        });
        else
            res.status(HttpStatus.NO_CONTENT);
    }

}