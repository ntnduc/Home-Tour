import ScreenHeader from "@/components/ScreenHeader";
import { ChildStep, ParrentStep } from "@/components/StepByStep";
import { RootStackParamList } from "@/navigation/types";
import { uiColors } from "@/theme";
import {
  ContractCreateRequest,
  ContractDetailResponse,
} from "@/types/contract";
import { RoomServiceDetailResponse } from "@/types/room";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmCreateContract, {
  ConfirmCreateContractRef,
} from "./components/ConfirmCreateContract";
import CreateContractForm from "./components/CreateContractForm";

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
  const [activeStep, setActiveStep] = useState<number>(0);

  const confirmRef = useRef<ConfirmCreateContractRef>(null);

  const handleConfirm = async () => {
    await confirmRef.current?.confirm();
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
    // Pre-invoice required: continue on the draft invoice view (no way back)
    if (contract.preInvoiceId) {
      navigation.replace("ConfirmDraftInvoice", {
        invoiceId: contract.preInvoiceId,
        isPreInvoice: true,
      });
      return;
    }
    navigation.replace("ContractDetail", { contractId: contract.id });
  };

  return (
    <SafeAreaView
      edges={[]}
      style={{ flex: 1, backgroundColor: uiColors.canvas }}
    >
      <ScreenHeader
        title="Tạo hợp đồng mới"
        onBack={() => navigation.goBack()}
        insetTop
      />
      <ParrentStep activeStep={activeStep} isComplete={false}>
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
          finishAction={{
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
      </ParrentStep>
    </SafeAreaView>
  );
};

export default CreateContractScreen;
