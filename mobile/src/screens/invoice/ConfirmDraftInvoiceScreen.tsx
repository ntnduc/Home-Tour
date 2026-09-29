import { RootStackParamList } from "@/navigation/types";
import CreateInvoice from "@/screens/invoice/components/CreateInvoice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";

type ConfirmDraftInvoiceScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "ConfirmDraftInvoice"
  >;
  route: { params: RootStackParamList["ConfirmDraftInvoice"] };
};

const ConfirmDraftInvoiceScreen = ({
  navigation,
  route,
}: ConfirmDraftInvoiceScreenProps) => {
  const { invoiceId } = route.params;

  return (
    <CreateInvoice navigation={navigation as any} invoiceId={invoiceId} />
  );
};

export default ConfirmDraftInvoiceScreen;
