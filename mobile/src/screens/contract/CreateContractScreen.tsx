import { ChildStep, ParrentStep } from "@/components/StepByStep";
import { RootStackParamList } from "@/navigation/types";
import {
  ContractCreateRequest,
  ContractDetailResponse,
} from "@/types/contract";
import { RoomServiceDetailResponse } from "@/types/room";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import ConfirmCreateContract, {
  ConfirmCreateContractRef,
} from "./components/ConfirmCreateContract";
import CreateContractForm from "./components/CreateContractForm";
import ContractDetailScreen from "./ContractDetailScreen";

type CreateContractScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CreateContract">;
  route: { params: RootStackParamList["CreateContract"] };
};

const CreateContractScreen = ({
  navigation,
  route,
}: CreateContractScreenProps) => {
  const [roomData, setRoomData] = useState<RoomServiceDetailResponse | null>(
    null,
  );
  // const [confirmData, setConfirmData] = useState<ContractCreateRequest | null>(
  //   null,
  // );
  const [defaultContractData, setDefaultContractData] =
    useState<ContractCreateRequest | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>();
  const [contractId, setContractId] = useState<string | null>();
  const [activeStep, setActiveStep] = useState<number>(0);

  const confirmRef = useRef<ConfirmCreateContractRef>(null);

  const handleConfirm = async () => {
    const response = await confirmRef.current?.confirm();
    if (response && typeof response === "string") {
      setInvoiceId(response);
    }
    return false;
  };

  const onNextStep = (
    rawData: ContractCreateRequest,
    // data: ContractCreateRequest,
  ) => {
    setDefaultContractData(rawData);
    setActiveStep(activeStep + 1);
  };

  const onContractCreated = (contract: ContractDetailResponse) => {
    if (contract.preInvoiceId) {
      setInvoiceId(contract.preInvoiceId);
      setContractId(contract.id);
      setActiveStep(2);
      return;
    }
  };

  return (
    <View className="flex-1">
      <ParrentStep activeStep={activeStep} isComplete={activeStep === 2}>
        <ChildStep label="Thông tin" hideButtonRow={true}>
          <CreateContractForm
            navigation={navigation}
            route={route}
            onNextStep={onNextStep}
            roomData={roomData}
            defaultContractData={defaultContractData}
            onRoomLoaded={setRoomData}
          />
        </ChildStep>

        <ChildStep
          offsetBottomActionButtom={-12}
          label="Xác nhận"
          // hideButtonRow
          previousAction={{
            label: "Chỉnh sửa thông tin",
            icon: "pencil",
            onPress: () => {
              setActiveStep(activeStep - 1);
              return true;
            },
          }}
          nextAction={{
            label: "Xác nhận tạo hợp đồng",
            icon: "checkmark-circle",
            onPress: handleConfirm,
          }}
        >
          {defaultContractData && (
            <ConfirmCreateContract
              ref={confirmRef}
              navigation={navigation}
              contract={defaultContractData}
              room={roomData?.name || ""}
              propertyName={roomData?.propertyName || ""}
              onPreviousStep={() => setActiveStep(activeStep - 1)}
              onNextStep={onContractCreated}
            />
          )}
        </ChildStep>
        <ChildStep
          offsetBottomActionButtom={-12}
          label="Hoàn thành"
          // hideButtonRow={true}
          finishAction={{
            onPress: () => {
              navigation.goBack();
            },
          }}
          previousAction={{
            hidden: !invoiceId,
            label: "Tạo hóa đơn",
            icon: "document",
            onPress: () => {
              navigation.replace("ConfirmDraftInvoice", {
                invoiceId: invoiceId || "",
              });
              return true;
            },
          }}
        >
          <ContractDetailScreen
            navigation={navigation as any}
            route={{
              params: {
                contractId: contractId || "",
              },
            }}
          />
        </ChildStep>

        {/* <ChildStep
          offsetBottomActionButtom={-12}
          label="Hóa đơn"
          hideButtonRow={true}
        >
          {invoiceId && (
            <CreateInvoice navigation={navigation} invoiceId={invoiceId} />
          )}
        </ChildStep> */}
      </ParrentStep>
    </View>
  );
};

export default CreateContractScreen;
