import { useState, KeyboardEvent } from 'react'
import { Control, useController } from 'react-hook-form'
import { Tag, X } from 'lucide-react'
import type { StudentProfileFormValues } from '@/features/student/types'

interface SkillsSectionProps {
  control: Control<StudentProfileFormValues>
  maxSkills?: number
  error?: string
}

const inputClasses = `
  w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all text-gray-900
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500
  border-gray-200 hover:border-teal-300
`

export default function SkillsSection({ control, maxSkills = 25, error }: SkillsSectionProps) {
  const { field } = useController({ name: 'skills', control })
  const [skillValue, setSkillValue] = useState('')

  const handleAddSkill = () => {
    const trimmed = skillValue.trim()
    if (!trimmed) return
    if (field.value?.some((skill) => skill.toLowerCase() === trimmed.toLowerCase())) {
      setSkillValue('')
      return
    }
    if (field.value && field.value.length >= maxSkills) {
      return
    }
    const updated = [...(field.value ?? []), trimmed]
    field.onChange(updated)
    setSkillValue('')
  }

  const handleRemoveSkill = (index: number) => {
    const updated = field.value?.filter((_, i) => i !== index) ?? []
    field.onChange(updated)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      handleAddSkill()
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-teal-100 border border-teal-200">
          <Tag className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold text-gray-900">Skills & Tools</h3>
          <p className="text-sm text-gray-500">Add keywords recruiters look for. Press Enter to add.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            value={skillValue}
            onChange={(event) => setSkillValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. React, Data Analysis, UX Research"
            className={inputClasses}
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            Add
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {field.value?.length ? (
          field.value.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-900 border border-gray-200"
            >
              {skill}
              <button type="button" onClick={() => handleRemoveSkill(index)} className="hover:text-red-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-500">No skills added yet.</p>
        )}
      </div>
    </section>
  )
}
