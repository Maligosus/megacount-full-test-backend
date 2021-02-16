import { PGErrors } from "./constants";

export interface AppError{
    code:number;
    message:string;
}

export const LOGIN_ALREADY_EXISTS_ERROR:AppError={
    code : parseInt(PGErrors.UNIQUE_VIOLATION),
    message:"LOGIN ALLREADY EXISTS"
};

export const UNKNOWN_ERROR:AppError={
    code:-1,
    message:"unknown error "
};