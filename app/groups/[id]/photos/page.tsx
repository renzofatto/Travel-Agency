import { Image } from 'lucide-react'

export default function GroupPhotosPage() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-50 mb-4">
        <Image className="w-8 h-8 text-pink-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Photos Coming Soon</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        The photo gallery feature is under development. You'll soon be able to share and
        comment on trip photos with your group.
      </p>
    </div>
  )
}
