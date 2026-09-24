import { ProfileSkeleton } from '@/components/ui/page-skeletons';

/**
 * A participant's profile while it renders on the server.
 * The skeleton keeps the page's shape, so nothing moves when it arrives.
 */
export default function UserProfileLoading() {
  return <ProfileSkeleton />;
}
