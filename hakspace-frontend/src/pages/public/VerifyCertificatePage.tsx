import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import { Award, CheckCircle, Search, ArrowLeft, Printer, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'

interface Certificate {
  certificateId: string
  studentName: string
  courseName: string
  issueDate: string
}

export default function VerifyCertificatePage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const urlId = searchParams.get('id')

  useEffect(() => {
    if (urlId) {
      setInputVal(urlId)
      fetchCertificate(urlId)
    }
  }, [urlId])

  const fetchCertificate = async (id: string) => {
    if (!id.trim()) return
    setLoading(true)
    setErrorMsg('')
    setCertificate(null)
    try {
      const res = await apiClient.get(`/api/certificates/${id.trim()}`)
      setCertificate(res.data)
    } catch (err: any) {
      setErrorMsg(t('certificate.not_found'))
      toast.error(t('certificate.not_found'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputVal.trim()) {
      setSearchParams({ id: inputVal.trim() })
      fetchCertificate(inputVal)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col print:bg-white print:text-black">
      {/* Hide Navbar when printing */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 pt-28 pb-16 flex-grow flex flex-col justify-start print:pt-0 print:pb-0">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-sm font-semibold text-zinc-400 hover:text-white transition flex items-center gap-2 group print:hidden"
        >
          <ArrowLeft size={16} className={`transition-transform ${i18n.language === 'ar' ? 'group-hover:translate-x-1 rotate-180' : 'group-hover:-translate-x-1'}`} /> 
          {i18n.language === 'ar' ? 'الرئيسية' : 'Home'}
        </button>

        {/* Input Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mb-8 print:hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
          
          <div className="text-center max-w-lg mx-auto mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
              {t('certificate.title')}
            </h1>
            <p className="text-zinc-400 text-sm">
              {t('certificate.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={t('certificate.input_placeholder')}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={18} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('certificate.verify_button')
              )}
            </button>
          </form>

          {errorMsg && (
            <p className="text-red-400 text-sm text-center mt-4 font-semibold">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Certificate Display Area */}
        {certificate && (
          <div className="space-y-6">
            {/* Print trigger */}
            <div className="flex justify-end gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 border border-zinc-700"
              >
                <Printer size={16} />
                {i18n.language === 'ar' ? 'طباعة / حفظ كـ PDF' : 'Print / Save PDF'}
              </button>
            </div>

            {/* Certificate Premium Card */}
            <div className="bg-stone-50 border-[12px] border-amber-800 rounded-2xl p-8 md:p-16 shadow-2xl text-stone-900 font-serif relative overflow-hidden min-h-[500px] flex flex-col justify-between print:border-[8px] print:shadow-none print:bg-white print:my-0">
              
              {/* Filigree corner styling */}
              <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-amber-800/40" />
              <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-amber-800/40" />
              <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-amber-800/40" />
              <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-amber-800/40" />

              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <Award size={400} className="text-stone-900" />
              </div>

              {/* Top part: Brand & Verified Badge */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-900 text-brand-500 rounded-xl flex items-center justify-center font-sans font-black text-xl shadow">
                    HS
                  </div>
                  <div>
                    <h4 className="font-sans font-black text-sm tracking-widest uppercase text-stone-800">HAKSPACE</h4>
                    <p className="font-sans text-[10px] text-stone-500 tracking-wider">ACADEMY & TECHNOLOGY</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-sans font-bold shadow-sm print:bg-transparent print:border-green-800 print:text-green-800">
                  <ShieldCheck size={14} />
                  <span>{t('certificate.verified_badge')}</span>
                </div>
              </div>

              {/* Middle: Certificate Content */}
              <div className="text-center my-8 space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-amber-900 tracking-wide uppercase font-sans">
                  {t('certificate.cert_title')}
                </h2>
                
                <p className="text-stone-500 italic text-sm md:text-base">
                  {t('certificate.cert_presented')}
                </p>

                <h3 className="text-2xl md:text-4xl font-extrabold text-stone-850 border-b-2 border-stone-300 pb-2 max-w-md mx-auto font-sans">
                  {certificate.studentName}
                </h3>

                <p className="text-stone-500 italic text-sm md:text-base">
                  {t('certificate.cert_body')}
                </p>

                <h4 className="text-xl md:text-2xl font-bold text-stone-900 font-sans">
                  {certificate.courseName}
                </h4>
              </div>

              {/* Bottom: Signatures and Metadata */}
              <div className="border-t border-stone-200 pt-8 mt-4 grid grid-cols-2 md:grid-cols-3 gap-6 items-end text-sm text-stone-600 font-sans">
                <div>
                  <span className="text-stone-400 block text-xs uppercase tracking-wider">{t('certificate.cert_id')}</span>
                  <strong className="text-stone-800 font-mono text-sm">{certificate.certificateId}</strong>
                </div>

                <div className="text-center hidden md:block">
                  <div className="w-20 h-20 mx-auto bg-green-50/50 rounded-full flex items-center justify-center border border-green-100/50 text-green-700 opacity-60">
                    <CheckCircle size={36} />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-stone-400 block text-xs uppercase tracking-wider">{t('certificate.issue_date')}</span>
                  <strong className="text-stone-800">
                    {new Date(certificate.issueDate).toLocaleDateString(
                      i18n.language === 'ar' ? 'ar-EG' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </strong>
                </div>

                <div className="col-span-2 md:col-span-3 border-t border-stone-150 pt-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-stone-400 block mb-1">{t('certificate.academy_signature')}</span>
                    <span className="font-serif italic text-amber-800 font-bold text-lg">Mostafa Eid</span>
                  </div>
                  <div className="w-16 h-1 bg-amber-800/20" />
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
