import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NoteEditor from '@/components/notes/note-editor'
import NoteCard from '@/components/notes/note-card'
import { FileText, StickyNote, Users } from 'lucide-react'

export default async function GroupNotesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: groupId } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return notFound()
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'

  // Fetch notes
  const { data: notes, error } = await supabase
    .from('group_notes')
    .select(`
      *,
      creator:users!created_by (
        id,
        full_name,
        avatar_url
      ),
      editor:users!last_edited_by (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
  }

  // Calculate stats
  const totalNotes = notes?.length || 0
  const totalWords = notes?.reduce(
    (acc, note) =>
      acc + note.content.split(/\s+/).filter((word: string) => word.length > 0).length,
    0
  ) || 0
  const uniqueContributors = new Set(
    notes?.flatMap((note) => [note.created_by, note.last_edited_by]) || []
  ).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collaborative Notes</h1>
          <p className="text-gray-600 mt-1">
            Share ideas, plans, and information with your group
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <StickyNote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900">{totalNotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Words</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalWords.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Contributors</p>
              <p className="text-2xl font-bold text-gray-900">
                {uniqueContributors}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Note */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Note</h2>
        <NoteEditor groupId={groupId} mode="create" />
      </div>

      {/* Notes List */}
      {notes && notes.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All Notes ({notes.length})
          </h2>
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                groupId={groupId}
                currentUserId={user.id}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <StickyNote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No notes yet
          </h3>
          <p className="text-gray-600">
            Create your first note using the editor above
          </p>
        </div>
      )}
    </div>
  )
}
