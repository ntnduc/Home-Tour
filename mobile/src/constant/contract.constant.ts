import { StatusOption } from "@/components/Status";
import { CONTRACT_STATUS_BADGE, ContractStatus } from "@/types/contract";

/** Contract statuses selectable / displayable through `<Status options />`. */
export const CONTRACT_STATUS_OPTIONS: StatusOption[] = [
  ContractStatus.PENDING_START,
  ContractStatus.ACTIVE,
  ContractStatus.ENDED,
  ContractStatus.TERMINATED_EARLY,
  ContractStatus.EXPIRED,
].map((status) => ({
  value: status,
  label: CONTRACT_STATUS_BADGE[status].label,
  type: CONTRACT_STATUS_BADGE[status].tone,
}));
