import { useEffect, useState } from "react";
import {
  adminApproveCoupon,
  adminFetchPendingCoupons,
  adminRejectCoupon,
} from "@/lib/api-helpers";

export default function useCouponModeration() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection modal state
  const [rejectCouponId, setRejectCouponId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  useEffect(() => {
    const fetchPendingCoupons = async () => {
      try {
        setLoading(true);
        const data = await adminFetchPendingCoupons();
        setCoupons(data);
      } catch (err) {
        console.error("Error fetching pending coupons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingCoupons();
  }, []);

  const handleApprove = async (couponId) => {
    try {
      setActionLoading(true);
      await adminApproveCoupon(couponId);
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
    } catch (err) {
      console.error("Error approving coupon:", err);
      alert("Failed to approve coupon.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (couponId) => {
    setRejectCouponId(couponId);
    setRejectionReason("");
    setIsRejectOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      setActionLoading(true);
      await adminRejectCoupon(rejectCouponId, rejectionReason.trim());
      setCoupons((prev) => prev.filter((c) => c._id !== rejectCouponId));
      setIsRejectOpen(false);
    } catch (err) {
      console.error("Error rejecting coupon:", err);
      alert("Failed to reject coupon.");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    coupons,
    loading,
    actionLoading,
    rejectionReason,
    setRejectionReason,
    isRejectOpen,
    setIsRejectOpen,
    handleApprove,
    handleRejectClick,
    handleRejectSubmit,
  };
}
