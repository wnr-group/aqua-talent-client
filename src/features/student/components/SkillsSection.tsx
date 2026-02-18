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
  w-full px-4 py-3 rounded-xl bg-ocean-dark/50 border transition-all text-foreground
  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-glow-cyan/50 focus:border-glow-cyan
  border-border hover:border-glow-cyan/30
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
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-glow-cyan/10 border border-glow-cyan/30">
          <Tag className="w-5 h-5 text-glow-cyan" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Skills & Tools</h3>
          <p className="text-sm text-muted-foreground">Add keywords recruiters look for. Press Enter to add.</p>
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
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep font-semibold hover:opacity-90 transition"
          >
            Add
          </button>
        </div>
        {error && <p className="text-sm text-coral">{error}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {field.value?.length ? (
          field.value.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-ocean-dark/60 text-foreground border border-border/70"
            >
              {skill}
              <button type="button" onClick={() => handleRemoveSkill(index)} className="hover:text-coral">
                <X className="w-4 h-4" />
              </button>
            </span>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No skills added yet.</p>
        )}
      </div>
    </section>
  )
}
