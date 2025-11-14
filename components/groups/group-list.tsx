import GroupCard from './group-card'

interface GroupListProps {
  groups: Array<{
    id: string
    name: string
    description: string | null
    destination: string
    start_date: string
    end_date: string
    cover_image: string | null
    member_count?: number
    user_role?: 'leader' | 'member'
  }>
}

export default function GroupList({ groups }: GroupListProps) {
  if (groups.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  )
}
