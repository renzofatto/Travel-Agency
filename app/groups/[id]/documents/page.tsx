import { FileText } from 'lucide-react'

export default function GroupDocumentsPage() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 mb-4">
        <FileText className="w-8 h-8 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents Coming Soon</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        The document management feature is under development. You'll soon be able to
        upload and share tickets, reservations, and other travel documents.
      </p>
    </div>
  )
}
