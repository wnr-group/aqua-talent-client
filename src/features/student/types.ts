export interface EducationFormValue {
  institution: string
  degree: string
  field: string
  startYear: string
  endYear: string
}

export interface ExperienceFormValue {
  company: string
  title: string
  startDate: string
  endDate: string
  description: string
}

export interface StudentProfileFormValues {
  fullName: string
  email: string
  profileLink?: string
  bio?: string
  location?: string
  availableFrom?: string
  introVideoUrl?: string
  skills: string[]
  education: EducationFormValue[]
  experience: ExperienceFormValue[]
}

export interface ProfileCompletenessData {
  percentage: number
  missingItems: string[]
}
