export enum Status{
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}
export enum Gender{
  MALE='Male',
  FEMALE='Female'
}
export enum MaritalStatus {
  SINGLE = "Single",
  MARRIED = "Married",
  DIVORCED = "Divorced",
  WIDOWED = "Widowed",
  OTHER = "Other"
}
export interface Address {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
}
export interface Phone{
  code:string;
  num:string
}
export interface LoginDetails{
  username:string;
  password:string;
  loignEnable:boolean;
  accLocked:boolean;
}
export enum Title{
  MR='MR',
  MRS='MRS',
}
export interface Name{
  title:Title;
  first:string;
  last?:string;
}

export interface General{
  id?:string
  profile?:string;
  name:Name;
  empCode:string;
  status:Status;
  dob?:string;
  gender:Gender;
  phoneNum:Phone;
  maritalStatus?:MaritalStatus;
  primaryEmail:string;
  secondaryEmail?:string;
  panNum?:string;
  adharNum?:string;
  currentAddress?: Address;
  permanentAddress?: Address;
  experience?:number;
  loginDetails?:LoginDetails
}
