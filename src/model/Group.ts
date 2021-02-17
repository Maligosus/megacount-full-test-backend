import { GroupData } from '../interfaces/GroupData';
import connection from '../helpers/pg-connection';
import { QueryResult } from 'pg';
import e from 'express';
import { UserData } from '../interfaces/UserData';

export class GroupModel{
    public static async getGroupsByOwner(ownerId:number):Promise<GroupData[]>{
        const queryString:string =`SELECT * FROM "Groups" WHERE "Groups"."ownerId"=$1`;
                    const result = await connection.query(queryString,[ownerId]);
                    const newGroupData:GroupData[] = [];
                    result.rows.map(group=>{
                        newGroupData.push({
                            groupName: group.name,
                            ownerId: group.ownerId,
                            groupMembers:[],
                            id: group.id
                        });
                    });
                    return newGroupData;
    }
    public static async createGroupByOwner(groupName:string,ownerId:number):Promise<number>{
        const queryString:string = `INSERT INTO "Groups" (name,"ownerId") VALUES($1,$2) RETURNING *`;
            const result = await connection.query(queryString,[groupName,ownerId]);
            console.log(result);
            return result.rows.length;
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
                                  ` ON "Users"."roleId" = "UserRoles".id`+
                                  ` WHERE "GroupMembers"."groupId" = $1`;

        const result = await connection.query(queryString,[groupId]);
        const newUserData:UserData[] = [];
        result.rows.map(user=>{
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
}   