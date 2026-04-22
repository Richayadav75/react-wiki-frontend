import { fetchTopicList } from '@/lib/github';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const topics = await fetchTopicList();
  return <HomeClient topics={topics} />;
}
