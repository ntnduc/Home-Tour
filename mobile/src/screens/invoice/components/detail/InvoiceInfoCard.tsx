import DisplayField from "@/components/DisplayField";
import FormSection from "@/components/FormSection";
import { tokens } from "@/theme";
import { InvoiceDetailResponse } from "@/types/invoice";
import { formatDate } from "@/utils/dateUtil";
import React from "react";

interface InvoiceInfoCardProps {
  invoice: InvoiceDetailResponse;
  isLate: boolean;
}

/**
 * Contract + billing facts as two titled FormSection cards.
 *
 * ```
 * ▣ Thông tin hợp đồng          (reader-outline)
 * ─────────────────────────────
 * Phòng                  Phòng 101
 * Người thuê             Nguyễn A
 * Tòa nhà                Tòa A
 *
 * ▣ Thông tin thanh toán        (calendar-outline · error tone when late)
 * ─────────────────────────────
 * Kỳ thanh toán          01/09/2026 - 30/09/2026
 * Hạn thanh toán         01/10/2026   (error + strong when late)
 * Ngày tạo               25/09/2026   (only when createdAt)
 * ```
 */
const InvoiceInfoCard = ({ invoice, isLate }: InvoiceInfoCardProps) => {
  const period =
    invoice.billingPeriodStart && invoice.billingPeriodEnd
      ? `${formatDate(invoice.billingPeriodStart.toString())} - ${formatDate(invoice.billingPeriodEnd.toString())}`
      : "-";

  return (
    <>
      <FormSection title="Thông tin hợp đồng" icon="reader-outline">
        <DisplayField
          label="Phòng"
          value={invoice.roomName || "-"}
          strong
          compact
        />
        <DisplayField
          label="Người thuê"
          value={invoice.clientName || "-"}
          compact
        />
        <DisplayField
          label="Tòa nhà"
          value={invoice.propertyName || "-"}
          compact
        />
      </FormSection>

      <FormSection
        title="Thông tin thanh toán"
        icon="calendar-outline"
        iconTone={isLate ? "error" : "primary"}
      >
        <DisplayField label="Kỳ thanh toán" value={period} compact />
        <DisplayField
          label="Hạn thanh toán"
          value={invoice.dueDate ? formatDate(invoice.dueDate.toString()) : "-"}
          strong={isLate}
          valueStyle={isLate ? { color: tokens.colors.error } : undefined}
          compact
        />
        {invoice.createdAt ? (
          <DisplayField
            label="Ngày tạo"
            value={formatDate(invoice.createdAt)}
            compact
          />
        ) : null}
      </FormSection>
    </>
  );
};

export default InvoiceInfoCard;
