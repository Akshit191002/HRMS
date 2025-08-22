
export interface Employee {
    id?: string;
    generalId?: string;
    professionalId?: string,
    bankDetailId?: string,
    pfId?: string,
    previousJobId?: string,
    loanId?: string[],
    projectId?: string[],
    isDeleted: boolean
}

export interface EmpCode {
    empCode: string,
    fname: string,
    lname:string
    emp_id: string,
    isDeleted:boolean
}