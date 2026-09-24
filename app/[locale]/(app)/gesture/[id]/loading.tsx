import { RecordDetailSkeleton } from '@/components/ui/page-skeletons';

/**
 * A gesture record while it renders on the server.
 * The skeleton keeps the page's shape (the site's content edge, the record at
 * a reading width), so nothing moves when it arrives.
 */
export default function GestureLoading() {
  return <RecordDetailSkeleton shell="data" align="start" sections={[3, 2, 2]} />;
}
