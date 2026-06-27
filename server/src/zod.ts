import { z } from "zod";
import { isValidGSTIN, validateGSTIN } from "gstin-toolkit";


export const gstinSchema = z.string().superRefine((val, ctx) => {
  if (!isValidGSTIN(val)) {
    const { errors } = validateGSTIN(val);
    const code = errors[0] ?? "INVALID_GSTIN";
    ctx.addIssue({
      code: "custom",
      message: `Invalid GSTIN: ${code}`,
    });
  }
});


export const optionalGstinSchema = z.string().superRefine((val, ctx) => {
  if (val === "") {
    return; 
  }
  
  if (!isValidGSTIN(val)) {
    const { errors } = validateGSTIN(val);
    const code = errors[0] ?? "INVALID_GSTIN";
    ctx.addIssue({
      code: "custom",
      message: `Invalid GSTIN: ${code}`,
    });
  }
});