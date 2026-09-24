import { RecordDetailSkeleton } from '@/components/ui/page-skeletons';

/**
 * An anchor action record while it renders on the server.
 * The skeleton keeps the page's shape, so nothing moves when it arrives.
 */
export default function AnchorActionLoading() {
  return <RecordDetailSkeleton width="max-w-5xl" sections={[3, 2, 2]} />;
}
