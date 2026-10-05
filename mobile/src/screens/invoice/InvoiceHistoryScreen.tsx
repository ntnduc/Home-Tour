import React from "react";
import { tokens } from "@/theme";
import { Text, View } from "react-native";

const InvoiceHistoryScreen = () => {
  return (
    <View>
      <Text>123</Text>
    </View>
  );
};

export default InvoiceHistoryScreen;

// import { Ionicons } from "@expo/vector-icons";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useMemo, useState } from "react";
// import {
//   FlatList,
//   Modal,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import {
//   Invoice,
//   PAYMENT_STATUS_COLOR,
//   PAYMENT_STATUS_LABEL,
//   PaymentStatus,
// } from "../../types/payment";

// type RootStackParamList = {
//   InvoiceHistory: undefined;
//   InvoiceDetail: { invoice: Invoice; fromHistory?: boolean };
// };

// type InvoiceHistoryScreenProps = {
//   navigation: NativeStackNavigationProp<RootStackParamList>;
// };

// // Mock data cho lịch sử hóa đơn
// const mockInvoiceHistory: Invoice[] = [
//   {
//     id: 1,
//     roomId: 1,
//     roomName: "Phòng 101",
//     tenantName: "Nguyễn Văn A",
//     month: "2024-01",
//     totalAmount: 4200000,
//     rentAmount: 3500000,
//     serviceAmount: 700000,
//     services: [
//       {
//         id: 1,
//         name: "Điện",
//         price: 3500,
//         quantity: 100,
//         unit: "số",
//         amount: 350000,
//       },
//       {
//         id: 2,
//         name: "Nước",
//         price: 15000,
//         quantity: 15,
//         unit: "m³",
//         amount: 225000,
//       },
//       {
//         id: 3,
//         name: "Wifi",
//         price: 100000,
//         quantity: 1,
//         unit: "tháng",
//         amount: 100000,
//       },
//       {
//         id: 4,
//         name: "Gửi xe",
//         price: 25000,
//         quantity: 1,
//         unit: "tháng",
//         amount: 25000,
//       },
//     ],
//     dueDate: "2024-01-05",
//     status: PaymentStatus.OVERDUE,
//     createdAt: "2024-01-01",
//   },
//   {
//     id: 2,
//     roomId: 2,
//     roomName: "Phòng 102",
//     tenantName: "Trần Thị B",
//     month: "2024-01",
//     totalAmount: 3800000,
//     rentAmount: 3200000,
//     serviceAmount: 600000,
//     services: [
//       {
//         id: 1,
//         name: "Điện",
//         price: 3500,
//         quantity: 80,
//         unit: "số",
//         amount: 280000,
//       },
//       {
//         id: 2,
//         name: "Nước",
//         price: 15000,
//         quantity: 12,
//         unit: "m³",
//         amount: 180000,
//       },
//       {
//         id: 3,
//         name: "Wifi",
//         price: 100000,
//         quantity: 1,
//         unit: "tháng",
//         amount: 100000,
//       },
//       {
//         id: 4,
//         name: "Gửi xe",
//         price: 25000,
//         quantity: 1,
//         unit: "tháng",
//         amount: 25000,
//       },
//     ],
//     dueDate: "2024-01-05",
//     status: PaymentStatus.PAID,
//     createdAt: "2024-01-01",
//     paidAt: "2024-01-03",
//   },
//   {
//     id: 3,
//     roomId: 4,
//     roomName: "Phòng 202",
//     tenantName: "Lê Văn C",
//     month: "2023-12",
//     totalAmount: 4500000,
//     rentAmount: 3700000,
//     serviceAmount: 800000,
//     services: [
//       {
//         id: 1,
//         name: "Điện",
//         price: 3500,
//         quantity: 120,
//         unit: "số",
//         amount: 420000,
//       },
//       {
//         id: 2,
//         name: "Nước",
//         price: 15000,
//         quantity: 18,
//         unit: "m³",
//         amount: 270000,
//       },
//       {
//         id: 3,
//         name: "Wifi",
//         price: 100000,
//         quantity: 1,
//         unit: "tháng",
//         amount: 100000,
//       },
//       {
//         id: 4,
//         name: "Gửi xe",
//         price: 25000,
//         quantity: 1,
//         unit: "tháng",
//         amount: 25000,
//       },
//     ],
//     dueDate: "2023-12-05",
//     status: PaymentStatus.OVERDUE,
//     createdAt: "2023-12-01",
//   },
//   {
//     id: 4,
//     roomId: 6,
//     roomName: "Phòng 302",
//     tenantName: "Phạm Thị D",
//     month: "2023-12",
//     totalAmount: 3550000,
//     rentAmount: 3550000,
//     serviceAmount: 0,
//     services: [],
//     dueDate: "2023-12-05",
//     status: PaymentStatus.PAID,
//     createdAt: "2023-12-01",
//     paidAt: "2023-12-04",
//   },
//   {
//     id: 5,
//     roomId: 8,
//     roomName: "Phòng 402",
//     tenantName: "Hoàng Văn E",
//     month: "2023-11",
//     totalAmount: 4200000,
//     rentAmount: 4200000,
//     serviceAmount: 0,
//     services: [],
//     dueDate: "2023-11-05",
//     status: PaymentStatus.OVERDUE,
//     createdAt: "2023-11-01",
//   },
// ];

// const InvoiceHistoryScreen = ({ navigation }: InvoiceHistoryScreenProps) => {
//   const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | null>(
//     null
//   );
//   const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
//   const [showFilterModal, setShowFilterModal] = useState(false);

//   // Tạo danh sách các tháng có hóa đơn
//   const availableMonths = useMemo(() => {
//     const months = [
//       ...new Set(mockInvoiceHistory.map((invoice) => invoice.month)),
//     ];
//     return months.sort((a, b) => b.localeCompare(a)); // Sắp xếp từ mới nhất
//   }, []);

//   // Lọc hóa đơn theo điều kiện
//   const filteredInvoices = useMemo(() => {
//     return mockInvoiceHistory.filter((invoice) => {
//       const statusMatch =
//         selectedStatus === null || invoice.status === selectedStatus;
//       const monthMatch =
//         selectedMonth === null || invoice.month === selectedMonth;
//       return statusMatch && monthMatch;
//     });
//   }, [selectedStatus, selectedMonth]);

//   // Thống kê
//   const stats = useMemo(() => {
//     const total = filteredInvoices.length;
//     const unpaid = filteredInvoices.filter(
//       (inv) => inv.status === PaymentStatus.OVERDUE
//     ).length;
//     const pending = filteredInvoices.filter(
//       (inv) => inv.status === PaymentStatus.PENDING
//     ).length;
//     const paid = filteredInvoices.filter(
//       (inv) => inv.status === PaymentStatus.PAID
//     ).length;
//     const totalAmount = filteredInvoices
//       .filter(
//         (inv) =>
//           inv.status === PaymentStatus.OVERDUE ||
//           inv.status === PaymentStatus.PENDING
//       )
//       .reduce((sum, inv) => sum + inv.totalAmount, 0);

//     return { total, unpaid, pending, paid, totalAmount };
//   }, [filteredInvoices]);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("vi-VN");
//   };

//   const formatMonth = (monthString: string) => {
//     const date = new Date(monthString + "-01");
//     return date.toLocaleDateString("vi-VN", {
//       month: "long",
//       year: "numeric",
//     });
//   };

//   const getDaysOverdue = (dueDate: string) => {
//     const today = new Date();
//     const due = new Date(dueDate);
//     const diffTime = today.getTime() - due.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays > 0 ? diffDays : 0;
//   };

//   const renderInvoiceItem = ({ item }: { item: Invoice }) => {
//     const statusColor = PAYMENT_STATUS_COLOR[item.status];
//     const daysOverdue = getDaysOverdue(item.dueDate);

//     return (
//       <TouchableOpacity
//         style={styles.invoiceCard}
//         onPress={() =>
//           navigation.navigate("InvoiceDetail", {
//             invoice: item,
//             fromHistory: true,
//           })
//         }
//       >
//         <View style={styles.invoiceHeader}>
//           <View>
//             <Text style={styles.roomName}>{item.roomName}</Text>
//             <Text style={styles.tenantName}>{item.tenantName}</Text>
//             <Text style={styles.monthText}>{formatMonth(item.month)}</Text>
//           </View>
//           <View
//             style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
//           >
//             <Text style={[styles.statusText, { color: statusColor.color }]}>
//               {PAYMENT_STATUS_LABEL[item.status]}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.invoiceDetails}>
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Hạn thanh toán:</Text>
//             <Text style={styles.detailValue}>{formatDate(item.dueDate)}</Text>
//           </View>
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Tổng tiền:</Text>
//             <Text style={styles.amountText}>
//               {item.totalAmount.toLocaleString()}đ
//             </Text>
//           </View>
//           {daysOverdue > 0 && item.status !== PaymentStatus.PAID && (
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Quá hạn:</Text>
//               <Text style={styles.overdueText}>{daysOverdue} ngày</Text>
//             </View>
//           )}
//         </View>

//         {item.status === PaymentStatus.OVERDUE && (
//           <View style={styles.overdueWarning}>
//             <Ionicons name="warning" size={16} color={tokens.colors.error} />
//             <Text style={styles.overdueWarningText}>
//               Hóa đơn quá hạn {daysOverdue} ngày
//             </Text>
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   const renderFilterModal = () => (
//     <Modal
//       visible={showFilterModal}
//       transparent={true}
//       animationType="slide"
//       onRequestClose={() => setShowFilterModal(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Bộ lọc</Text>
//             <TouchableOpacity
//               onPress={() => setShowFilterModal(false)}
//               style={styles.closeButton}
//             >
//               <Ionicons name="close" size={24} color={tokens.colors.muted} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.filterSection}>
//             <Text style={styles.filterSectionTitle}>Trạng thái thanh toán</Text>
//             <View style={styles.filterOptions}>
//               <TouchableOpacity
//                 style={[
//                   styles.filterOption,
//                   selectedStatus === null && styles.filterOptionActive,
//                 ]}
//                 onPress={() => setSelectedStatus(null)}
//               >
//                 <Text
//                   style={[
//                     styles.filterOptionText,
//                     selectedStatus === null && styles.filterOptionTextActive,
//                   ]}
//                 >
//                   Tất cả
//                 </Text>
//               </TouchableOpacity>
//               {Object.values(PaymentStatus).map((status) => (
//                 <TouchableOpacity
//                   key={status}
//                   style={[
//                     styles.filterOption,
//                     selectedStatus === status && styles.filterOptionActive,
//                   ]}
//                   onPress={() => setSelectedStatus(status)}
//                 >
//                   <Text
//                     style={[
//                       styles.filterOptionText,
//                       selectedStatus === status &&
//                         styles.filterOptionTextActive,
//                     ]}
//                   >
//                     {PAYMENT_STATUS_LABEL[status]}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           <View style={styles.filterSection}>
//             <Text style={styles.filterSectionTitle}>Tháng</Text>
//             <View style={styles.filterOptions}>
//               <TouchableOpacity
//                 style={[
//                   styles.filterOption,
//                   selectedMonth === null && styles.filterOptionActive,
//                 ]}
//                 onPress={() => setSelectedMonth(null)}
//               >
//                 <Text
//                   style={[
//                     styles.filterOptionText,
//                     selectedMonth === null && styles.filterOptionTextActive,
//                   ]}
//                 >
//                   Tất cả tháng
//                 </Text>
//               </TouchableOpacity>
//               {availableMonths.map((month) => (
//                 <TouchableOpacity
//                   key={month}
//                   style={[
//                     styles.filterOption,
//                     selectedMonth === month && styles.filterOptionActive,
//                   ]}
//                   onPress={() => setSelectedMonth(month)}
//                 >
//                   <Text
//                     style={[
//                       styles.filterOptionText,
//                       selectedMonth === month && styles.filterOptionTextActive,
//                     ]}
//                   >
//                     {formatMonth(month)}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           <View style={styles.modalActions}>
//             <TouchableOpacity
//               style={styles.resetButton}
//               onPress={() => {
//                 setSelectedStatus(null);
//                 setSelectedMonth(null);
//               }}
//             >
//               <Text style={styles.resetButtonText}>Đặt lại</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.applyButton}
//               onPress={() => setShowFilterModal(false)}
//             >
//               <Text style={styles.applyButtonText}>Áp dụng</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Thống kê */}
//       <View style={styles.statsContainer}>
//         <View style={styles.statItem}>
//           <Text style={styles.statNumber}>{stats.total}</Text>
//           <Text style={styles.statLabel}>Tổng</Text>
//         </View>
//         <View style={styles.statItem}>
//           <Text style={[styles.statNumber, { color: tokens.colors.error }]}>
//             {stats.unpaid}
//           </Text>
//           <Text style={styles.statLabel}>Quá hạn</Text>
//         </View>
//         <View style={styles.statItem}>
//           <Text style={[styles.statNumber, { color: tokens.palette.amber[500] }]}>
//             {stats.pending}
//           </Text>
//           <Text style={styles.statLabel}>Chờ</Text>
//         </View>
//         <View style={styles.statItem}>
//           <Text style={[styles.statNumber, { color: tokens.colors.success }]}>
//             {stats.paid}
//           </Text>
//           <Text style={styles.statLabel}>Đã thanh toán</Text>
//         </View>
//       </View>

//       {stats.totalAmount > 0 && (
//         <View style={styles.totalAmountContainer}>
//           <Text style={styles.totalAmountLabel}>
//             Tổng tiền chưa thanh toán:
//           </Text>
//           <Text style={styles.totalAmountValue}>
//             {stats.totalAmount.toLocaleString()}đ
//           </Text>
//         </View>
//       )}

//       {/* Danh sách hóa đơn */}
//       <FlatList
//         data={filteredInvoices}
//         renderItem={renderInvoiceItem}
//         keyExtractor={(item) => item.id.toString()}
//         contentContainerStyle={styles.listContainer}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="receipt-outline" size={48} color={tokens.palette.gray[400]} />
//             <Text style={styles.emptyText}>Không có hóa đơn nào</Text>
//           </View>
//         }
//       />

//       {renderFilterModal()}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: tokens.colors.surfaceMuted,
//   },
//   statsContainer: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     padding: 16,
//     marginHorizontal: 16,
//     marginTop: 16,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: "center",
//   },
//   statNumber: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: tokens.colors.foreground,
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: tokens.colors.muted,
//   },
//   totalAmountContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 12,
//     marginHorizontal: 16,
//     marginTop: 8,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: tokens.colors.error,
//   },
//   totalAmountLabel: {
//     fontSize: 14,
//     color: tokens.colors.muted,
//   },
//   totalAmountValue: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: tokens.colors.error,
//   },
//   listContainer: {
//     padding: 16,
//   },
//   invoiceCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   invoiceHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 12,
//   },
//   roomName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: tokens.colors.foreground,
//     marginBottom: 2,
//   },
//   tenantName: {
//     fontSize: 14,
//     color: tokens.colors.muted,
//     marginBottom: 2,
//   },
//   monthText: {
//     fontSize: 12,
//     color: tokens.colors.subtle,
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   invoiceDetails: {
//     borderTopWidth: 1,
//     borderTopColor: tokens.colors.border,
//     paddingTop: 12,
//   },
//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   detailLabel: {
//     fontSize: 13,
//     color: tokens.colors.muted,
//   },
//   detailValue: {
//     fontSize: 13,
//     fontWeight: "500",
//     color: tokens.colors.foreground,
//   },
//   amountText: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: tokens.colors.primary,
//   },
//   overdueText: {
//     fontSize: 13,
//     fontWeight: "500",
//     color: tokens.colors.error,
//   },
//   overdueWarning: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: tokens.colors.errorSurface,
//     padding: 8,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   overdueWarningText: {
//     fontSize: 12,
//     color: tokens.colors.error,
//     marginLeft: 4,
//     fontWeight: "500",
//   },
//   emptyContainer: {
//     alignItems: "center",
//     marginTop: 60,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: tokens.colors.subtle,
//     marginTop: 16,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: tokens.colors.border,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: tokens.colors.foreground,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   filterSection: {
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: tokens.colors.border,
//   },
//   filterSectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: tokens.colors.foreground,
//     marginBottom: 12,
//   },
//   filterOptions: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//   },
//   filterOption: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: tokens.palette.gray[300],
//     backgroundColor: "#fff",
//   },
//   filterOptionActive: {
//     backgroundColor: tokens.colors.primary,
//     borderColor: tokens.colors.primary,
//   },
//   filterOptionText: {
//     fontSize: 12,
//     color: tokens.colors.muted,
//   },
//   filterOptionTextActive: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   modalActions: {
//     flexDirection: "row",
//     padding: 20,
//     gap: 12,
//   },
//   resetButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: tokens.palette.gray[300],
//     alignItems: "center",
//   },
//   resetButtonText: {
//     fontSize: 14,
//     color: tokens.colors.muted,
//     fontWeight: "500",
//   },
//   applyButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     backgroundColor: tokens.colors.primary,
//     alignItems: "center",
//   },
//   applyButtonText: {
//     fontSize: 14,
//     color: "#fff",
//     fontWeight: "600",
//   },
// });

// export default InvoiceHistoryScreen;
