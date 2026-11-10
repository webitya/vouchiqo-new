"use client";

import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FormInput = forwardRef(function FormInput(
  {
    name,
    label,
    icon: Icon,
    type = "text",
    placeholder,
    required = false,
    error,
    hint,
    prefix: Prefix,
    suffix: Suffix,
    className,
    ...rest
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  // Retrieve error message safely from Zod error object or string
  const errorMessage =
    error?.message || (typeof error === "string" ? error : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full font-sans", className)}>
      {label && (
        <Label
          htmlFor={name}
          className="text-xs font-heading font-semibold text-[#35104A] flex items-center gap-1.5"
        >
          {Icon && <Icon className="w-3.5 h-3.5 text-[#007F79]" />}
          <span>{label}</span>
          {required && (
            <span className="text-[#FF2E63] font-medium ml-0.5">*</span>
          )}
        </Label>
      )}

      <div className="relative flex items-center">
        {Prefix && (
          <span className="absolute left-3 text-[#6B4C82]/70 pointer-events-none">
            <Prefix className="w-4 h-4" />
          </span>
        )}
        <Input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          ref={ref}
          aria-required={required}
          aria-describedby={
            errorMessage ? `${name}-error` : hint ? `${name}-hint` : undefined
          }
          aria-invalid={!!errorMessage}
          className={cn(
            "text-base md:text-sm h-10 border-[#EADBCE] bg-white text-[#35104A] placeholder:text-[#6B4C82]/50 focus-visible:ring-[#007F79]/20 focus-visible:border-[#007F79] rounded-xl w-full transition-colors",
            Prefix && "pl-9",
            (Suffix || isPassword) && "pr-9",
            errorMessage &&
              "border-[#FF2E63] focus-visible:border-[#FF2E63] focus-visible:ring-[#FF2E63]/20",
          )}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-[#6B4C82] hover:text-[#35104A] p-1 focus:outline-none cursor-pointer border-0 bg-transparent transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        ) : (
          Suffix && (
            <span className="absolute right-3 text-[#6B4C82]/70 pointer-events-none">
              <Suffix className="w-4 h-4" />
            </span>
          )
        )}
      </div>

      {errorMessage && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-xs text-[#FF2E63] font-medium flex items-center gap-1 mt-0.5 animate-in fade-in-50 font-sans"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
      {!errorMessage && hint && (
        <p
          id={`${name}-hint`}
          className="text-[11px] text-slate-400 dark:text-slate-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = "FormInput";

export default FormInput;
