import { MavenChat } from '../components/maven-chat'

// The Maven chat as a page of its own, which is where the home tile sends a
// phone (desktop opens the chat in a panel beside the content instead). The
// page isn't in the nav, so its back button stays at every width rather than
// only on mobile like the other pages' do.
export function AdminMavenPage() {
  return <MavenChat onBack={() => window.history.back()} className="flex-1" />
}
