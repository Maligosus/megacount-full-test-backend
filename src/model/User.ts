import { UserData } from "../interfaces/UserData";
import { UserRole,UserRoleConstants } from "../interfaces/UserRole";
import connection from '../helpers/pg-connection';
import md5 from 'md5';
import pg from 'pg';
import jwt from "jsonwebtoken";




export class UserModel{
    static secretSignature="254-Megacount-5481";
    public static userDataQuery(userId:number,
                                callback:(err:Error|null,result:any)=>void):void
    {
        connection.query(`select * from "Users" inner join "UserRoles" on "`+
                            `Users"."roleId" = "UserRoles".id`+ `
                            WHERE "Users".id=$1`,[userId],(err,res)=>{
                                    if (err)
                                        callback(err,null);
                                    else
                                        callback(null,{
                                            id: res.rows[0].id,
                                            login: res.rows[0].login,
                                            password: res.rows[0].password,
                                            role :{
                                                roleId : res.rows[0].roleId,
                                                roleName: res.rows[0].roleName
                                            }
                                        });
        });

    }
    public static userRoleQuery(userId:number,
                                callback:(err:Error|null,result:UserRole|null)=>void):void
    {
        connection.query(`select "UserRoles".id,"UserRoles"."roleName" from "UserRoles" `+
                            `left join "Users" on "UserRoles".id="Users"."roleId" `+
                            `where "Users".id=$1`,[userId],(err,res)=>{
                                if (err)
                                    callback(err,null);
                                else
                                    callback(null,{
                                        roleId: res.rows[0].id,
                                        roleName: res.rows[0].roleName
                                    })
                                
                            });
                        
    }
    public static registerUser(newUser:UserData,
                                callback:(err:Error|null|any,result:any|null)=>void):void
    {
        if (newUser.password)
        connection.query(`insert into "Users" (login,password,"roleId") values($1,$2,$3) RETURNING "id"`
                        ,[newUser.login,md5(newUser.password),UserRoleConstants.USER],(err,res)=>{
                                if (err){
                                    console.log(err);
                                    callback(err,null);
                                }
                                else
                                    callback(null,res.rows[0].id);
                        });
        else
                callback(null,null);
    }
    public static loginUser(login:string,
                            password:string,
                            callback:(err:Error|null|any,result:any)=>void):void
    {
        connection.query(`select * from "Users" 
                        inner join "UserRoles" ON "Users"."roleId" = "UserRoles".id 
                        where login=$1 and password=$2`,
                            [login,md5(password)],(err,res)=>{
                                if (err)
                                    callback(err,null);
                                else{
                                    if (res.rows.length !==0)
                                    {
                                        console.log(res.rows);
                                        const accessToken:string=jwt.sign({
                                            id : res.rows[0].id,
                                            roleId: res.rows[0].roleId,
                                            login: res.rows[0].login,
                                            roleName: res.rows[0].roleName
                                        },this.secretSignature,{
                                            expiresIn:"14h",
                                        });
                                        callback(null,{
                                            id : res.rows[0].id,
                                            login: res.rows[0].login,
                                            role:{
                                                roleId: res.rows[0].roleId,
                                                roleName: res.rows[0].roleName
                                            },
                                            accessToken
                                        });
                                    }
                                    else{
                                        console.log("NOT RESULT");
                                        callback(null,null);
                                    }
                                }
                            });
    }
    public static verifyUser(accessToken:string,callback:(err:Error|null,result:UserData|null)=>void):void{
        console.log("VERIFY");
        console.log("VERIFY_TOKEN="+accessToken);
        jwt.verify(accessToken,this.secretSignature ,(err,decode)=>{
            if (err)
                callback(err,null);
            else{
                console.log(decode);
                callback(null,decode as UserData);
            }
        })
    }
}