"use client";

import { CreditCard, FileText, User } from "lucide-react";
import { FormInput, FormSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const ACCOUNT_TYPES = [
  { value: "current", label: "Current Account" },
  { value: "savings", label: "Savings Account" },
];

export default function Step4Bank({ register, setValue, watch, errors }) {
  const bankAccountType = watch("bankAccountType");

  return (
    <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5 text-left font-sans">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>4. Settlement Bank Particulars &amp; Documentation</span>
        </h3>
        <Badge
          variant="outline"
          className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          Step 4 of 4
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Account Holder Name"
          icon={User}
          placeholder="Legal name in bank passbook"
          {...register("bankHolderName")}
          error={errors.bankHolderName}
        />

        <FormSelect
          label="Account Type"
          icon={CreditCard}
          options={ACCOUNT_TYPES}
          value={bankAccountType || "current"}
          onValueChange={(val) =>
            setValue("bankAccountType", val, { shouldValidate: true })
          }
          error={errors.bankAccountType}
        />

        <FormInput
          label="Account Number"
          icon={CreditCard}
          maxLength={18}
          placeholder="9 to 18 digits account number"
          {...register("bankAccountNumber")}
          error={errors.bankAccountNumber}
          className="font-mono font-bold"
        />

        <FormInput
          label="Bank IFSC Code"
          icon={FileText}
          maxLength={11}
          placeholder="e.g. HDFC0000123"
          {...register("bankIfsc")}
          onChange={(e) =>
            setValue("bankIfsc", e.target.value.toUpperCase(), {
              shouldValidate: true,
            })
          }
          error={errors.bankIfsc}
          className="font-mono uppercase font-bold"
        />
      </div>
    </Card>
  );
}
