import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { ProgressStep } from "react-native-progress-steps";
import { ProgressStepProps } from "react-native-progress-steps/dist/types";
import ActionButtonBottom from "../ActionButtonBottom";
import { StepActionConfig, StepActionKey } from "./types";

export interface ChildStepProps extends ProgressStepProps {
  /** Cấu hình nút "Tiếp tục" (hiển thị ở các bước không phải bước cuối). */
  nextAction?: StepActionConfig;
  /** Cấu hình nút "Quay lại" (ẩn ở bước đầu tiên). */
  previousAction?: StepActionConfig;
  /** Cấu hình nút "Hoàn tất" (hiển thị ở bước cuối cùng). */
  finishAction?: StepActionConfig;
  /** Ẩn toàn bộ hàng nút để tự render riêng nếu cần. */
  hideButtonRow?: boolean;
  /** Cho phép nội dung cuộn (mặc định: true). */
  contentScrollable?: boolean;
  children?: React.ReactNode;
  offsetBottomActionButtom?: number;
}

/**
 * Một bước trong `ParrentStep`.
 *
 * Bọc `ProgressStep` nhưng thay thế hàng nút mặc định bằng bộ nút tái sử dụng
 * (`StepButton`) với:
 * - Preset variant giống `ActionButtonBottom`.
 * - Loading async: chỉ chuyển bước khi `onPress` resolve thành công.
 *
 * Các prop `setActiveStep`, `activeStep`, `stepCount` được `ParrentStep`
 * (ProgressSteps) tự động truyền vào.
 */
export const ChildStep: React.FC<ChildStepProps> = ({
  nextAction,
  previousAction,
  finishAction,
  hideButtonRow = false,
  contentScrollable = false,
  activeStep = 0,
  stepCount = 0,
  setActiveStep,
  children,
  offsetBottomActionButtom = 0,
  ...progressStepProps
}) => {
  const [loadingKey, setLoadingKey] = useState<StepActionKey | null>(null);

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === stepCount - 1;

  /**
   * Chạy handler của action, hiển thị loading khi async và chỉ thực hiện
   * `advance` (chuyển bước) khi handler không bị chặn (không trả `false`/throw).
   */
  const runAction = async (
    key: StepActionKey,
    action: StepActionConfig | undefined,
    advance?: () => void,
  ) => {
    if (loadingKey) return;

    try {
      setLoadingKey(key);
      const result = await action?.onPress?.();
      if (result === false) return;
      advance?.();
    } catch {
      // Có lỗi -> giữ nguyên bước hiện tại. Việc thông báo lỗi do caller xử lý.
    } finally {
      setLoadingKey(null);
    }
  };

  const handleNext = () =>
    runAction("next", nextAction, () => setActiveStep?.(activeStep + 1));

  const handlePrevious = () =>
    runAction("previous", previousAction, () =>
      setActiveStep?.(activeStep - 1),
    );

  const handleFinish = () => runAction("finish", finishAction);

  const Content = contentScrollable ? ScrollView : View;

  return (
    <>
      <ProgressStep
        buttonBottomOffset={0}
        buttonTopOffset={0}
        buttonHorizontalOffset={0}
        {...progressStepProps}
        removeBtnRow
        scrollable={false}
      >
        <View className="flex-1">
          <Content
            style={{ marginHorizontal: -20 }}
            className="flex-1"
            {...(contentScrollable
              ? { showsVerticalScrollIndicator: false }
              : {})}
          >
            <View className="flex-1">{children}</View>
          </Content>
        </View>
      </ProgressStep>
      {!hideButtonRow && (
        <ActionButtonBottom
          className="bg-black"
          bottomInsetOffset={offsetBottomActionButtom}
          actions={[
            {
              label: previousAction?.label ?? "Quay lại",
              icon: previousAction?.icon ?? "chevron-back",
              variant: "secondary",
              isLoading: loadingKey === "previous",
              onPress: handlePrevious,
              hidden: isFirstStep || previousAction?.hidden,
            },
            {
              label: nextAction?.label ?? "Tiếp tục",
              icon: nextAction?.icon ?? "checkmark-circle",
              isLoading: loadingKey === "next",
              variant: "primary",
              onPress: handleNext,
              hidden: isLastStep || nextAction?.hidden,
            },
            {
              label: finishAction?.label ?? "Hoàn tất",
              icon: finishAction?.icon ?? "checkmark-circle",
              variant: "success",
              isLoading: loadingKey === "finish",
              onPress: handleFinish,
              hidden: !isLastStep || finishAction?.hidden,
            },
          ]}
        />
      )}
    </>
  );
};
