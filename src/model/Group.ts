import { GroupData } from '../interfaces/GroupData';
import connection from '../helpers/pg-connection';
import { QueryResult } from 'pg';
import e from 'express';
import { UserData } from '../interfaces/UserData';
import { HttpStatus } from '../helpers/http-status';

export class GroupModel{
    public static async getGroupsByOwner(ownerId:number):Promise<GroupData[]>{
        const queryString:string =`SELECT * FROM "Groups"  WHERE "Groups"."ownerId"=$1`;
        const result = await connection.query(queryString,[ownerId]);
        const newGroupData:GroupData[] = [];
        await Promise.all(result.rows.map(async row=>{
            newGroupData.push({
                name : row.name,
                owner : await this.getGroupOwner(row.groupId),
                groupMembers : await this.getAllGroupMembers(row.groupId),
                id : row.groupId
            })
        }));
        return newGroupData;
    }
    public static async createGroupByOwner(groupName:string,ownerId:number):Promise<void>{
            const queryString:string = `INSERT INTO "Groups" (name,"ownerId") VALUES($1,$2) RETURNING *`;
            await connection.query(queryString,[groupName,ownerId]);
    }
    public static async deleteAllGroupsByOwner(ownerId:number):Promise<number>{
        const queryString:string=`DELETE FROM "Groups" WHERE "ownerId"=$1 returning *`;
            const result= await connection.query(queryString,[ownerId]);
            console.log(result);
            return result.rows.length;
    }
    public static async deleteGroupById(groupNumber:number):Promise<number>{
        const queryString:string=`DELETE FROM "Groups" WHERE id=$1 returning *`;
            const result = await connection.query(queryString,[groupNumber]);
            console.log(result);
            return result.rows.length;
    }
    public static async addUserToGroup(userId:number,groupId:number):Promise<number>{
        const queryString:string=`INSERT INTO "GroupMembers" ("userId","groupId") VALUES($1,$2) returning *` ;
        const result = await connection.query(queryString,[userId,groupId]);
        return result.rows.length;
    }
    public static async removeUserFromGroup(userId:number,groupId:number):Promise<number>{
        const queryString:string=`DELETE FROM "GroupMembers" WHERE "userId"=$1 AND "groupId"=$2 returning *`;
        const result = await connection.query(queryString,[userId,groupId]);
        return result.rows.length;
    }
    public static async getAllGroupMembers(groupId:number):Promise<UserData[]>{
        const queryString:string=`SELECT "Users".id,`+ 
                                  `"Users".login,`+
                                  `"Users"."roleId",`+
                                  `"UserRoles"."roleName"`+ 
                                  ` FROM "GroupMembers" JOIN "Users"`+ 
                                  ` ON "GroupMembers"."userId" = "Users".id JOIN "UserRoles"`+
                                  ` ON "Users"."roleId" = "UserRoles"."roleId"`+
                                  ` WHERE "GroupMembers"."groupId" = $1`;

        const result = await connection.query(queryString,[groupId]);
        const newUserData:UserData[] = [];
        result.rows.forEach(user=>{
            newUserData.push({
                login: user.login,
                id: user.id,
                role:{
                    roleId : user.roleId,
                    roleName: user.roleName
                }
            });
        });;
        return newUserData;
    }
    public static async getAllGroups():Promise<GroupData[]>{
        const queryString:string=`SELECT "Groups".*,"Users".id,"Users".login,"Users"."roleId",`+
        ` "UserRoles"."roleName"`+
        ` FROM "Groups" JOIN "Users"`+
        ` ON "Groups"."ownerId" ="Users".id JOIN "UserRoles"`+
        ` ON "Users"."roleId" = "UserRoles"."roleId"`;
        const result = await connection.query(queryString);
        const newGroupData:GroupData[] = [];
        await Promise.all(result.rows.map(async row=>{
            newGroupData.push({
                name : row.name,
                owner : {
                    id : row.ownerId,
                    role : {
                        roleId : row.roleId,
                        roleName : row.roleName,                      
                    },
                    login : row.login,
                },
                groupMembers : await this.getAllGroupMembers(row.groupId),
                id : row.groupId
            })
        }));
        return newGroupData;
    }
    public static async getGroupOwner(groupId:number):Promise<UserData>{
        const queryString:string =`SELECT "Users".* FROM "Groups"`+
        ` RIGHT JOIN "Users" ON "Groups"."ownerId" = "Users".id`+
        ` WHERE "Groups"."groupId"=$1`;
        const result = await connection.query(queryString,[groupId]);
        if (!result.rowCount) {
            return Promise.reject({
                code : HttpStatus.NOT_FOUND,
                message: "Group not found"
            })
        }

        return {
            login : result.rows[0].login,
            role : {
                roleId : result.rows[0].id,
                roleName : result.rows[0].roleName
            },
            id : result.rows[0].id
        };
    }
    public static async getAllUserGroups(userId:number) : Promise<GroupData[]>{
        const queryString:string = `SELECT "Groups".* FROM "GroupMembers" RIGHT JOIN "Groups"` +
                                    ` ON "GroupMembers"."groupId" = "Groups"."groupId"`+
                                    ` WHERE "GroupMembers"."userId" =$1`;
        const newGroupData:GroupData[]=[];
        const result = await connection.query(queryString,[userId]);
        await Promise.all(result.rows.map(async row=>{
            newGroupData.push({
                name : row.name,
                owner : await this.getGroupOwner(row.groupId),
                groupMembers : await this.getAllGroupMembers(row.groupId),
                id: row.groupId
            });
        }));
        return newGroupData;
    }
}   