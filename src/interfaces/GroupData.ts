import { UserData } from "./UserData";


export interface GroupData{
    id?:number;
    name:string;
    owner?:UserData;
    groupMembers?:UserData[];
};