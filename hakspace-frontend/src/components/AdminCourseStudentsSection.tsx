import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { toast } from 'react-toastify'
import { Award, CheckCircle2, CircleDashed, ExternalLink, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface StudentCourse {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  courseId: number
  courseName: string
  groupId: number
  groupName: string
  enrollmentDate: string
  completionStatus: 'IN_PROGRESS' | 'COMPLETED'
  completionDate: string | null
  certificateId: string | null
}

export default function AdminCourseStudentsSection({ courseId }: { courseId: number }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const { data: students, isLoading } = useQuery<StudentCourse[]>({
    queryKey: ['enrolledStudents', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/admin/courses/${courseId}/students`)
      return res.data
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiClient.put(`/api/admin/student-courses/${id}/status`, { status })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolledStudents', courseId] })
      toast.success(t('leads.update_success'))
    },
    onError: () => {
      toast.error(t('leads.update_error'))
    }
  })

  if (isLoading) {
    return (
      <div className="py-8 text-center text-zinc-500 animate-pulse">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-6 border-t border-zinc-900 mt-12">
      <h2 className="text-2xl font-bold border-b border-zinc-800 pb-3 flex items-center gap-2">
        <Award className="text-brand-500" size={22} />
        {t('certificate.enrolled_students')}
      </h2>

      {!students || students.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-850 rounded-xl p-8 text-center text-zinc-500 text-sm">
          {t('certificate.no_students')}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">{t('certificate.student_name')}</th>
                <th className="py-3 px-4">{t('certificate.group')}</th>
                <th className="py-3 px-4">{t('certificate.enrollment_date')}</th>
                <th className="py-3 px-4">{t('certificate.completion_status')}</th>
                <th className="py-3 px-4 text-right">{t('certificate.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-zinc-800/50 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white">{student.studentName}</p>
                    <p className="text-xs text-zinc-500">{student.studentEmail}</p>
                  </td>
                  <td className="py-3 px-4 text-zinc-300">
                    {student.groupName}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 text-xs">
                    {new Date(student.enrollmentDate).toLocaleDateString(
                      i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {student.completionStatus === 'COMPLETED' ? (
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold tracking-wider uppercase border border-green-500/20 mb-1">
                          <CheckCircle2 size={12} /> {t('certificate.completed_status')}
                        </span>
                        {student.certificateId && (
                           <p className="text-[10px] text-zinc-500 font-mono mt-1">{student.certificateId}</p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold tracking-wider uppercase border border-amber-500/20">
                        <CircleDashed size={12} /> {t('certificate.in_progress_status')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {student.completionStatus === 'COMPLETED' && student.certificateId && (
                        <>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(student.certificateId!)
                              toast.success('Certificate ID copied!')
                            }}
                            className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition flex items-center border border-zinc-700"
                            title="Copy ID"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => window.open(`/verify-certificate?id=${student.certificateId}`, '_blank')}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-brand-400 text-xs font-semibold rounded-lg transition flex items-center gap-1 border border-zinc-700"
                          >
                            <ExternalLink size={12} /> {t('certificate.view_cert')}
                          </button>
                        </>
                      )}
                      {student.completionStatus === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: student.id, status: 'COMPLETED' })}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                        >
                          {t('certificate.mark_completed')}
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: student.id, status: 'IN_PROGRESS' })}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition border border-zinc-700 disabled:opacity-50"
                        >
                          {t('certificate.mark_in_progress')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
