import { Control, FieldErrors, UseFormRegister, useFieldArray } from 'react-hook-form'
import { GraduationCap, Plus, Trash2 } from 'lucide-react'
import type { StudentProfileFormValues } from '@/features/student/types'

interface EducationSectionProps {
  control: Control<StudentProfileFormValues>
  register: UseFormRegister<StudentProfileFormValues>
  errors: FieldErrors<StudentProfileFormValues>
}

const inputClasses = `
  w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all text-gray-900
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500
  border-gray-200 hover:border-teal-300
`

const EMPTY_EDUCATION = {
  institution: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
}

export default function EducationSection({ control, register, errors }: EducationSectionProps) {
  const { fields, append, remove } = useFieldArray({ name: 'education', control })

  const renderError = (index: number, key: keyof (typeof EMPTY_EDUCATION)) => {
    const fieldErrors = errors.education?.[index]
    const message = fieldErrors?.[key]?.message as string | undefined
    return message ? <p className="text-sm text-red-600">{message}</p> : null
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 border border-purple-200">
            <GraduationCap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-gray-900">Education</h3>
            <p className="text-sm text-gray-500">Tell companies where you studied.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => append({ ...EMPTY_EDUCATION })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 bg-gray-50">
          No education added yet. Click "Add Education" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-gray-900">Education #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Institution</label>
                  <input
                    className={inputClasses}
                    {...register(`education.${index}.institution` as const)}
                    placeholder="Stanford University"
                  />
                  {renderError(index, 'institution')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Degree</label>
                  <input
                    className={inputClasses}
                    {...register(`education.${index}.degree` as const)}
                    placeholder="B.S. Computer Science"
                  />
                  {renderError(index, 'degree')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Field of Study</label>
                  <input
                    className={inputClasses}
                    {...register(`education.${index}.field` as const)}
                    placeholder="Software Engineering"
                  />
                  {renderError(index, 'field')}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Start Year</label>
                    <input
                      type="number"
                      className={inputClasses}
                      {...register(`education.${index}.startYear` as const)}
                      placeholder="2019"
                      min="1950"
                      max="2100"
                    />
                    {renderError(index, 'startYear')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">End Year</label>
                    <input
                      type="number"
                      className={inputClasses}
                      {...register(`education.${index}.endYear` as const)}
                      placeholder="2023"
                      min="1950"
                      max="2100"
                    />
                    {renderError(index, 'endYear')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
