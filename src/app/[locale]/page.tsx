import { getAvailableEvents } from '@/lib/eventsService';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
  // Fetch events data from Neon DB
  const events = await getAvailableEvents();

  return <HomePageClient events={events || []} />;
}
