import { redirect } from 'next/navigation'

export default function GroupsPage() {
  // Redirect to dashboard where groups are listed
  redirect('/dashboard')
}
