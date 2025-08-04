export enum Status{
  ACTIVE = "1",
  INACTIVE = "2",
}
export interface Department{
    id?:string;
    depName:string;
    code:string;
    description?:string;
    status?:Status;
}