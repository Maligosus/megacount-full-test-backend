import { GroupModel } from '../model/Group';
import { NextFunction,Request,Response } from 'express';
import { HttpStatus } from '../helpers/http-status';
import { UserModel } from '../model/User';


/* jsonwebtoken для него типы написаны коряво */


export  function  checkGroupOwnerMiddleWare(req:Request,res:Response,next:NextFunction){
    const { authorization } = req.headers;
    const { id } = req.body;
    if (authorization){
        const accessToken:string=authorization.split(' ')[1];
        UserModel.verifyUser(accessToken)
        .then(user=>{
            GroupModel.getGroupOwner(id)
            .then(owner=>{
                if (owner.id === user.id){
                    next();
                }
                else
                    res.sendStatus(HttpStatus.FORBIDDEN);
            })
            .catch(err=>res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err));
        })
        .catch(err=>res.sendStatus(HttpStatus.UNAUTHORIZED));
    }
    else
        res.sendStatus(HttpStatus.UNAUTHORIZED);
}
