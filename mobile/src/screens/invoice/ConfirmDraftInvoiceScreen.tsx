import { RootStackParamList } from "@/navigation/types";
import CreateInvoice from "@/screens/invoice/components/CreateInvoice";
import React from "react";

type ConfirmDraftInvoiceScreenProps = {
  route: { params: RootStackParamList["ConfirmDraftInvoice"] };
};

const ConfirmDraftInvoiceScreen = ({
  route,
}: ConfirmDraftInvoiceScreenProps) => {
  const { invoiceId, isPreInvoice } = route.params;

  return <CreateInvoice invoiceId={invoiceId} isPreInvoice={isPreInvoice} />;
};

export default ConfirmDraftInvoiceScreen;
