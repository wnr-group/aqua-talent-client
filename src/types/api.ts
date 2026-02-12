import { UserType, CompanyStatus } from './enums'
import { Company, Student } from './entities'

export interface ApiError {
  message: string
  code?: string
}

export interface AuthResponse {
  id: string
  username: string
  userType: UserType
  status?: CompanyStatus
  company?: Company | null
  student?: Student | null
}

export interface AdminStats {
  pendingCompanies: number
  totalCompanies: number
  pendingJobs: number
  activeJobs: number
  totalJobs: number
  totalStudents: number
  totalApplications: number
  totalHires: number
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface JobSearchParams extends PaginationParams {
  search?: string
  location?: string
}
