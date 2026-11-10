import { addJob, analyticsQueue } from "@/lib/queue";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { JOB_NAMES } from "@/utils/constants";

/**
 * POST /api/analytics/event
 *
 * Public client-side event ingestion endpoint.
 * Accepts impressions, clicks, copy code events, banner clicks, and store views.
 * Offloads processing to BullMQ background queue — never blocks client UI.
 *
 * Body: { eventType: string, couponId?: string, merchantId?: string, source?: string }
 */
export const POST = asyncHandler(async (request) => {
  const body = await request.json().catch(() => ({}));
  const { eventType, couponId, merchantId, source } = body;

  if (!eventType) {
    return ok({ success: false, message: "Missing eventType" }, 400);
  }

  const payload = { couponId, merchantId, source };

  switch (eventType) {
    case "impression":
      addJob(analyticsQueue, JOB_NAMES.RECORD_IMPRESSION, payload);
      break;
    case "click":
      addJob(analyticsQueue, JOB_NAMES.RECORD_CLICK, payload);
      break;
    case "copy_code":
      addJob(analyticsQueue, JOB_NAMES.RECORD_COPY_CODE, payload);
      break;
    case "store_view":
      addJob(analyticsQueue, JOB_NAMES.RECORD_STORE_VIEW, payload);
      break;
    case "banner_click":
      addJob(analyticsQueue, JOB_NAMES.RECORD_BANNER_CLICK, payload);
      break;
    case "unique_code_gen":
      addJob(analyticsQueue, JOB_NAMES.RECORD_UNIQUE_CODE_GEN, payload);
      break;
    default:
      break;
  }

  return ok({ queued: true });
});
