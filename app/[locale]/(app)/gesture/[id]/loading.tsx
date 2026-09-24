import { RecordDetailSkeleton } from '@/components/ui/page-skeletons';

/**
 * A gesture record while it renders on the server.
 * The skeleton keeps the page's shape, so nothing moves when it arrives.
 */
export default function GestureLoading() {
  return <RecordDetailSkeleton shell="detail" sections={[3, 2, 2]} />;
}
