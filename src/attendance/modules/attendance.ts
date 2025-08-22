import { Timestamp } from "firebase-admin/firestore"

export enum Status {
    PRESENT = 'P',
    ABSENT = 'AB',
    WEEKOFF = 'W',
    HOLIDAY = 'H',
    LEAVE = 'L',
    HALFDAY = 'HD'
}

export interface Attendance {
    id: string
    empCode: string,
    status: Status
    date: Date | Timestamp,
    year: number
}

export interface AddAttendance {
    empCode: string,
    date: Date,
    inTime: string,
    outTime: string
}

export interface AttendanceRecord {
  ["Date (dd/mm/yy)"]: string;
  ["Employee Code"]: string;
  ["Holiday ID"]?: string;
  ["Hours"]?: string | number | null;
  ["Leaves ID"]?: string | null;
  ["Notes"]?: string;
  ["Type"]?: string | null;
  ["Unpaid Leaves"]?: string | number;
  id?: number;
}