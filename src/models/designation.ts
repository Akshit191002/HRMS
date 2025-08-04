export enum Status{
  ACTIVE = "1",
  INACTIVE = "2",
}
export interface Designation{
    id?:string;
    desName:string;
    depName?:string;
    code:string;
    description?:string;
    status?:Status;
}