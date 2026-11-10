import AdminPageSkeleton from "@/components/shared/skeletons/AdminPageSkeleton";

export default function AdminLoading() {
  return (
    <div className="w-full p-[7px]">
      <AdminPageSkeleton cardsCount={4} rowsCount={8} hasTabs={true} />
    </div>
  );
}
