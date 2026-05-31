import { MessageCircle } from 'lucide-react'
export default function WhatsAppButton() {
  return (
    <button onClick={() => window.open('https://wa.me/1234567890', '_blank')} 
      className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
      <MessageCircle size={28} />
    </button>
  )
}