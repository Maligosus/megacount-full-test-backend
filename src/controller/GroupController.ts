import { GroupModel } from '../model/Group';
import {NextFunction, Request,Response} from 'express';
import { HttpStatus } from '../helpers/http-status';
import { PGErrors } from '../helpers/constants';
import { UserModel } from '../model/User';
import { GroupData } from '../interfaces/GroupData';
import { UserData } from '../interfaces/UserData';
import { UserRoleConstants } from '../interfaces/UserRole';


export class GroupController{
    public static async getGroupsByOwner(req:Request,res:Response):Promise<void>{
        const { user } = req.body;
        try{
            const groups:GroupData[] = await GroupModel.getGroupsByOwner(user.id);
            res.status(HttpStatus.OK).send(groups);
        }
        catch(err){
            console.log(err);
            res.sendStatus(HttpStatus.FORBIDDEN);
        }
    };
    public static async createGroupByUser(req:Request,res:Response):Promise<void>{
        const { groupName, user } = req.body;
        try{
            await GroupModel.createGroupByOwner(groupName,user.id);
            res.sendStatus(HttpStatus.OK);
        }
        catch(err){
            if (err.code === PGErrors.UNIQUE_VIOLATION)
                res.sendStatus(HttpStatus.CONFLICT);
            else
                res.sendStatus(HttpStatus.FORBIDDEN);
        }
    }
    public static async getAllUserGroups(req:Request,res:Response):Promise<void>{
        const { user } = req.body;
        try{
            const result = await GroupModel.getAllUserGroups(user.id);
            res.status(HttpStatus.OK).send(result);
        }
        catch(err){
            console.log(err.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }
    public static deleteAllGroupsByOwner(req:Request,res:Response):void{
        const { ownerId } = req.body;
        GroupModel.deleteAllGroupsByOwner(ownerId)
        .then(()=>res.sendStatus(HttpStatus.OK))
        .catch(()=>res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
    }
    public static async deleteUserGroup(req:Request,res:Response):Promise<void>{
        const { groupId, user } = req.body;
        console.log("DELETE GROUP");
        try{
                const owner:UserData = await GroupModel.getGroupOwner(groupId);
                if (owner.id === user.id || user.role.roleId===UserRoleConstants.ADMIN){
                        const countAffected:number = await GroupModel.deleteGroupById(groupId);
                        if (countAffected > 0)
                            res.sendStatus(HttpStatus.OK);
                        else
                            res.sendStatus(HttpStatus.NOT_FOUND);
                }
                else
                    res.sendStatus(HttpStatus.FORBIDDEN);
        }
        catch(err){
                console.log(err);
                res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    public static async enterUserToGroup(req:Request,res:Response):Promise<void>{
        const { groupId, user } = req.body;
        try{
                await GroupModel.addUserToGroup(user.id,groupId);
                res.sendStatus(HttpStatus.OK);
        }
        catch(err){
            if (err.code === PGErrors.UNIQUE_VIOLATION)
                res.sendStatus(HttpStatus.CONFLICT);
            else
                res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    public static leaveUserFromGroup(req:Request,res:Response):void{
        const { groupId } = req.body ;
        const { id } =req.body.user;
        GroupModel.removeUserFromGroup(id,groupId)
        .then(result=>{
                if (result > 0)
                    res.sendStatus(HttpStatus.OK)
                else
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .send({
                        code : HttpStatus.NOT_FOUND,
                        message: "Вы не являетесь членом этой группы"
                    });
        })
        .catch(err=>res.sendStatus(HttpStatus.FORBIDDEN));
    }
    public static getAllGroupMembers(req:Request,res:Response):void{
        const { groupId } = req.params;
        GroupModel.getAllGroupMembers(parseInt(groupId))
        .then(result=>res.status(HttpStatus.OK).send(result))
        .catch(()=>res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
    }
    public static getAllGroups(req:Request,res:Response):void{
        GroupModel.getAllGroups()
        .then(result=>res.status(HttpStatus.OK).send(result))
        .catch((err)=>{
            console.log(err.message);
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR)});
    }
    public static async removeUserFromGroup(req:Request,res:Response):Promise<void>{
        const { userId ,user,groupId } = req.body;
        try{
            const owner:UserData = await GroupModel.getGroupOwner(groupId);
            if (user.id === owner.id || user.role.roleId === UserRoleConstants.ADMIN){
               const countAffected:number = await GroupModel.removeUserFromGroup(userId,groupId);
               if (countAffected>0){
                    const newGroupMembers:UserData[] = await GroupModel.getAllGroupMembers(groupId);
                    res.status(HttpStatus.OK).send(newGroupMembers);
               }
                else
                    res.sendStatus(HttpStatus.NOT_FOUND);
            }
            else
                res.sendStatus(HttpStatus.FORBIDDEN);
        }
        catch(err){
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


