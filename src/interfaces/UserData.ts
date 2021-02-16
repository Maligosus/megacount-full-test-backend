import { UserRole } from "./UserRole";


export interface UserData{
    id?:number;
    login:string;
    password:string;
    role?:UserRole;
}

