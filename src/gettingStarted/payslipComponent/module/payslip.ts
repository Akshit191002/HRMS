export interface OtherSetting{
    taxable:boolean,
    leaveBased:boolean,
    CTC:boolean,
    adjustmentBalanced:boolean
}

export enum CalculationType{
    FIXED='fixed',
    FORMULA='formula'
}

export interface SalaryStructure{
    id?:string,
    groupName:string,
    code:string,
    description:string,
    salaryComponent?:string[],
    isDeleted:boolean
}



export interface Component{
    id?:string,
    groupId?:string,
    type:string,
    showOnPayslip:boolean
    name:string,
    code:string,
    otherSetting:OtherSetting,
    calculationType:CalculationType,
    value:string,
    minValue?:string,
    maxValue?:string,
    testAmount:string,
    isDeleted?:boolean,
    isDefault?:boolean,
}

