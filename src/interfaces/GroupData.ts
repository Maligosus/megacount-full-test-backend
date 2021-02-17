import { UserData } from "./UserData";


export interface GroupData{
    id?:number;
    groupName:string;
    ownerId:number;
    groupMembers?:UserData[];
};