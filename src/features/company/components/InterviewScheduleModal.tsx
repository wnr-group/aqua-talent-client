import { useEffect, useState } from 'react'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { CalendarDays } from 'lucide-react'

interface InterviewScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (interviewDate: string, interviewNotes: string) => Promise<void> | void
  jobTitle?: string
  applicantName?: string
  isSubmitting?: boolean
}

export default function InterviewScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  applicantName,
  isSubmitting = false,
}: InterviewScheduleModalProps) {
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setInterviewDate('')
      setInterviewNotes('')
    }
  }, [isOpen])

  const handleConfirm = async () => {
    if (!interviewDate) return
    // datetime-local gives "YYYY-MM-DDTHH:mm" — convert to full ISO 8601 string
    // so the backend receives a valid UTC datetime (e.g. "2026-02-24T10:00:00.000Z")
    const isoDate = new Date(interviewDate).toISOString()
    await onConfirm(isoDate, interviewNotes)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Interview"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Schedule interview for <span className="font-medium text-gray-900">{applicantName || 'this applicant'}</span>
          {jobTitle ? <> on <span className="font-medium text-gray-900">{jobTitle}</span></> : null}.
        </p>

        <Input
          label="Interview Date & Time"
          type="datetime-local"
          value={interviewDate}
          onChange={(event) => setInterviewDate(event.target.value)}
          leftIcon={<CalendarDays className="w-4 h-4" />}
          min={new Date().toISOString().slice(0, 16)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Instructions</label>
          <textarea
            value={interviewNotes}
            onChange={(event) => setInterviewNotes(event.target.value)}
            rows={4}
            placeholder="Add meeting link, preparation instructions, or any interview details..."
            className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none transition-colors duration-150 resize-y"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!interviewDate || isSubmitting}
            isLoading={isSubmitting}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  )
}
