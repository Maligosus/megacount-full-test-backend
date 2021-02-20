import { UserData } from "../interfaces/UserData";
import { UserRole,UserRoleConstants } from "../interfaces/UserRole";
import connection from '../helpers/pg-connection';
import md5 from 'md5';
import pg from 'pg';
import jwt from "jsonwebtoken";
import { HttpStatus } from "../helpers/http-status";




export class UserModel{
    static secretSignature="254-Megacount-5481";
    public static async userDataQuery(userId:number):Promise<UserData>
    {
      const result = await connection.query(`select * from "Users" inner join "UserRoles" on "`+
                            `Users"."roleId" = "UserRoles".id`+ `
                            WHERE "Users".id=$1`,[userId]);
        return new Promise((resolve,reject)=>{
            if (result.rowCount)
                resolve({
                    login : result.rows[0].id,
                    id: result.rows[0].id,
                    password : result.rows[0].password,
                    role :{
                        roleId: result.rows[0].roleId,
                        roleName: result.rows[0].roleName
                    }
                });
                else
                    reject({
                        code : HttpStatus.NOT_FOUND,
                        message:"User not found"
                    });
        });

    }
    public static async userRoleQuery(userId:number):Promise<UserRole>
    {
      const result = await connection.query(`select "UserRoles".id,"UserRoles"."roleName" from "UserRoles" `+
                            `left join "Users" on "UserRoles".id="Users"."roleId" `+
                            `where "Users".id=$1`,[userId]);
       return {
                    roleId:result.rows[0].id,
                    roleName: result.rows[0].roleName
            };
                        
    }
    public static async registerUser(login:string,password:string):Promise<void>
    {
            if (password.length > 0 && login.length >0){
                try{
                    const queryString:string=`insert into "Users" (login,password,"roleId") values ($1,$2,$3) `; 
                    await connection.query(queryString,[login,md5(password),UserRoleConstants.USER]);
                }catch(err){
                    return Promise.reject(err);
                }
            }
            else
                throw new Error("password or login must not be empty");
    }
    public static async loginUser(login:string,
                            password:string):Promise<UserData>
    {
        const result = await connection.query(`select * from "Users" 
                        inner join "UserRoles" ON "Users"."roleId" = "UserRoles"."roleId" 
                        where login=$1 and password=$2`,
                            [login,md5(password)]);
        if (!result.rows.length)
                return Promise.reject({
                    code : HttpStatus.NOT_FOUND,
                    message : "Incorrect password or login"
                })
        const accessToken:string=jwt.sign({
            id : result.rows[0].id,
            roleId: result.rows[0].roleId,
            login: result.rows[0].login,
            roleName: result.rows[0].roleName
        },this.secretSignature);
        return {
                id : result.rows[0].id,
                login: result.rows[0].login,
                role: {
                    roleId : result.rows[0].roleId,
                    roleName: result.rows[0].roleName
                },
                accessToken 
        };
    }
    public static verifyUser(accessToken:string):Promise<UserData>{
        return new Promise((resolve,reject)=>{
            jwt.verify(accessToken,this.secretSignature,(err,decode:any)=>{
                if (err){
                    console.log(err.message);
                    reject(err);
                }
                else if (decode){
                    resolve({
                        id : decode.id,
                        login: decode.login,
                        role :{
                            roleId : decode.roleId,
                            roleName : decode.roleName,
                        }
                    })
                };
            });
        })
    }
}