import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

/**
 * A reusable React Hook wrapper for react-hook-form + zod resolver.
 *
 * @param {object} schema - Zod validation schema
 * @param {object} defaultValues - Initial default form values
 * @param {string} [mode="all"] - Validation trigger mode
 */
export function useZodForm({ schema, defaultValues, mode = "all" }) {
  return useForm({
    resolver: zodResolver(schema),
    mode,
    defaultValues,
  });
}
