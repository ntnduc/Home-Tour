import React from "react";
import { ProgressSteps, ProgressStepsProps } from "react-native-progress-steps";
import { ChildStepProps } from "./ChildStep";
import { stepProgressColors } from "./colors";

export interface ParrentStepProps extends Omit<ProgressStepsProps, "children"> {
  children: React.ReactElement<ChildStepProps>[];
}

/**
 * Khung chứa các bước.
 *
 * Áp sẵn bảng màu `stepProgressColors` (đồng bộ theme của app) cho icon/label/
 * đường nối tiến trình. Mọi prop truyền vào sẽ ghi đè giá trị mặc định để dễ
 * tuỳ biến khi cần.
 */
export const ParrentStep = ({ children, ...props }: ParrentStepProps) => {
  return (
    <ProgressSteps
      topOffset={10}
      marginBottom={0}
      {...stepProgressColors}
      {...props}
    >
      {children}
    </ProgressSteps>
  );
};
