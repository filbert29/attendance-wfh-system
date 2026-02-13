export interface EmployeeCreateInterface {
  email: string;
  password: string;
  type: string;
  created_by: string;
}

export interface EmployeeUpdateInterface {
  email: string;
  type: string;
  modified_by: string;
  modified_date: Date;
}

export interface AuthRequestUser {
  userId: number;
  type: string;
}
