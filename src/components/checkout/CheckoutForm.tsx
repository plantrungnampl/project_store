// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolve-zodiac";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// // import { useToast } from "@/components/ui/use-toast";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Toaster } from "@/components/ui/sonner";
// import { toast } from "sonner";
// import { createOrder } from "@/app/actions/orderActions";
// import { useCart } from "@/hooks/useCart";
// import { Skeleton } from "../ui/skeleton";
// // Note: Thông thường bạn sẽ sử dụng zod và react-hook-form
// // Nhưng để đơn giản trong demo này, tôi sẽ sử dụng useState

// interface CheckoutFormProps {
//   isLoggedIn: boolean;
//   addresses: any[];
// }

// export default function CheckoutForm({
//   isLoggedIn,
//   addresses,
// }: CheckoutFormProps) {
//   const [formData, setFormData] = useState({
//     // Shipping info
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     address: "",
//     city: "",
//     state: "",
//     postalCode: "",
//     country: "Vietnam",

//     // Saved address
//     useSavedAddress: false,
//     savedAddressId: "",

//     // Billing
//     sameBillingAddress: true,
//     billingFirstName: "",
//     billingLastName: "",
//     billingAddress: "",
//     billingCity: "",
//     billingState: "",
//     billingPostalCode: "",
//     billingCountry: "Vietnam",

//     // Payment
//     paymentMethod: "cod",

//     // Additional
//     orderNotes: "",
//   });

//   const [step, setStep] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   //   const { toast } = useToast();
//   const [isMounted, setIsMounted] = useState(false);
//   const { items, cartCount, totals, init } = useCart();
//   const { subtotal, shippingTotal, taxTotal, grandTotal } = totals;

//   // Khởi tạo cart và đánh dấu mounted
//   useEffect(() => {
//     setIsMounted(true);
//     init();
//   }, [init]);
//   // Kiểm tra giỏ hàng trống và chuyển hướng
//   useEffect(() => {
//     // Chỉ thực hiện sau khi component mounted và data đã load
//     if (isMounted && !isLoading && items.length === 0) {
//       router.push("/cart");
//     }
//   }, [isMounted, isLoading, items.length, router]);

//   // Hiển thị skeleton trong lúc loading
//   if (!isMounted || isLoading) {
//     return <CheckoutSkeleton />;
//   }

//   // Nếu không có sản phẩm, không hiển thị gì cả (sẽ redirect)
//   if (items.length === 0) {
//     return <CheckoutSkeleton />;
//   }

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleRadioChange = (name: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, checked } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: checked }));
//   };

//   const handleAddressSelect = (addressId: string) => {
//     const selectedAddress = addresses.find((addr) => addr.id === addressId);

//     if (selectedAddress) {
//       setFormData((prev) => ({
//         ...prev,
//         savedAddressId: addressId,
//         firstName: selectedAddress.firstName,
//         lastName: selectedAddress.lastName,
//         address:
//           selectedAddress.addressLine1 +
//           (selectedAddress.addressLine2
//             ? `, ${selectedAddress.addressLine2}`
//             : ""),
//         city: selectedAddress.city,
//         state: selectedAddress.state,
//         postalCode: selectedAddress.postalCode,
//         country: selectedAddress.country,
//         phone: selectedAddress.phone || prev.phone,
//       }));
//     }
//   };

//   const validateStep1 = () => {
//     // Kiểm tra các trường bắt buộc ở step 1
//     if (!formData.firstName.trim()) return false;
//     if (!formData.lastName.trim()) return false;
//     if (!formData.email.trim()) return false;
//     if (!formData.phone.trim()) return false;
//     if (!formData.address.trim()) return false;
//     if (!formData.city.trim()) return false;
//     if (!formData.state.trim()) return false;
//     if (!formData.postalCode.trim()) return false;

//     return true;
//   };

//   const validateStep2 = () => {
//     // Kiểm tra các trường bắt buộc ở step 2
//     if (!formData.sameBillingAddress) {
//       if (!formData.billingFirstName.trim()) return false;
//       if (!formData.billingLastName.trim()) return false;
//       if (!formData.billingAddress.trim()) return false;
//       if (!formData.billingCity.trim()) return false;
//       if (!formData.billingState.trim()) return false;
//       if (!formData.billingPostalCode.trim()) return false;
//     }

//     return true;
//   };

//   const handleNextStep = () => {
//     if (step === 1 && !validateStep1()) {
//       toast("Thông tin chưa đầy đủ", {
//         // title: "Thông tin chưa đầy đủ",
//         description: "Vui lòng điền đầy đủ thông tin giao hàng",
//         // variant: "destructive",
//       });
//       return;
//     }

//     if (step === 2 && !validateStep2()) {
//       toast("Thông tin chưa đầy đủ", {
//         description: "Vui lòng điền đầy đủ thông tin thanh toán",
//       });
//       return;
//     }

//     if (step < 3) {
//       setStep(step + 1);
//     }
//   };

//   const handlePreviousStep = () => {
//     if (step > 1) {
//       setStep(step - 1);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Nếu chưa ở bước cuối, di chuyển đến bước tiếp theo
//     if (step < 3) {
//       handleNextStep();
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Tạo đối tượng dữ liệu đơn hàng
//       const orderData = {
//         // Shipping info
//         shippingAddress: {
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           addressLine1: formData.address,
//           city: formData.city,
//           state: formData.state,
//           postalCode: formData.postalCode,
//           country: formData.country,
//           phone: formData.phone,
//         },

//         // Billing info
//         billingAddress: formData.sameBillingAddress
//           ? {
//               firstName: formData.firstName,
//               lastName: formData.lastName,
//               addressLine1: formData.address,
//               city: formData.city,
//               state: formData.state,
//               postalCode: formData.postalCode,
//               country: formData.country,
//               phone: formData.phone,
//             }
//           : {
//               firstName: formData.billingFirstName,
//               lastName: formData.billingLastName,
//               addressLine1: formData.billingAddress,
//               city: formData.billingCity,
//               state: formData.billingState,
//               postalCode: formData.billingPostalCode,
//               country: formData.billingCountry,
//             },

//         // Contact info
//         email: formData.email,

//         // Payment info
//         paymentMethod: formData.paymentMethod,

//         // Additional
//         customerNote: formData.orderNotes,
//       };

//       const result = await createOrder(orderData);

//       if (result.success) {
//         // Chuyển hướng đến trang xác nhận đơn hàng
//         router.push(`/order-confirmation/${result.orderNumber}`);
//       } else {
//         toast("Không thể tạo đơn hàng", {
//           description: result.error || "Đã có lỗi xảy ra khi tạo đơn hàng",
//           //   variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast("Lỗi", {
//         description: "Đã có lỗi xảy ra khi tạo đơn hàng",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-8">
//       {/* Progress steps */}
//       <div className="flex justify-between mb-8">
//         <div
//           className={`flex-1 text-center pb-4 relative ${
//             step >= 1 ? "text-primary font-medium" : "text-gray-500"
//           }`}
//         >
//           <div
//             className={`absolute bottom-0 left-0 right-0 h-1 ${
//               step >= 1 ? "bg-primary" : "bg-gray-200"
//             }`}
//           />
//           <span>Thông tin giao hàng</span>
//         </div>
//         <div
//           className={`flex-1 text-center pb-4 relative ${
//             step >= 2 ? "text-primary font-medium" : "text-gray-500"
//           }`}
//         >
//           <div
//             className={`absolute bottom-0 left-0 right-0 h-1 ${
//               step >= 2 ? "bg-primary" : "bg-gray-200"
//             }`}
//           />
//           <span>Thông tin thanh toán</span>
//         </div>
//         <div
//           className={`flex-1 text-center pb-4 relative ${
//             step >= 3 ? "text-primary font-medium" : "text-gray-500"
//           }`}
//         >
//           <div
//             className={`absolute bottom-0 left-0 right-0 h-1 ${
//               step >= 3 ? "bg-primary" : "bg-gray-200"
//             }`}
//           />
//           <span>Xác nhận đơn hàng</span>
//         </div>
//       </div>

//       {/* Step 1: Shipping information */}
//       {step === 1 && (
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="p-6 border-b border-gray-200">
//             <h2 className="text-xl font-semibold text-gray-900">
//               Thông tin giao hàng
//             </h2>
//           </div>

//           <div className="p-6 space-y-6">
//             {/* Saved addresses for logged in users */}
//             {isLoggedIn && addresses.length > 0 && (
//               <div className="space-y-4">
//                 <h3 className="font-medium text-gray-900">Địa chỉ đã lưu</h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {addresses.map((address) => (
//                     <div
//                       key={address.id}
//                       className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors ${
//                         formData.savedAddressId === address.id
//                           ? "border-primary bg-primary/5"
//                           : "border-gray-200"
//                       }`}
//                       onClick={() => handleAddressSelect(address.id)}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div>
//                           <p className="font-medium">
//                             {address.firstName} {address.lastName}
//                           </p>
//                           <p className="text-sm text-gray-600 mt-1">
//                             {address.addressLine1}
//                           </p>
//                           {address.addressLine2 && (
//                             <p className="text-sm text-gray-600">
//                               {address.addressLine2}
//                             </p>
//                           )}
//                           <p className="text-sm text-gray-600">
//                             {address.city}, {address.state} {address.postalCode}
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             {address.country}
//                           </p>
//                           {address.phone && (
//                             <p className="text-sm text-gray-600 mt-1">
//                               {address.phone}
//                             </p>
//                           )}
//                         </div>
//                         {address.isDefault && (
//                           <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
//                             Mặc định
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <Separator />
//               </div>
//             )}

//             {/* Contact information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <Label htmlFor="firstName">
//                   Họ <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="firstName"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   required
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="lastName">
//                   Tên <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="lastName"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   required
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="email">
//                   Email <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="phone">
//                   Số điện thoại <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="phone"
//                   name="phone"
//                   type="tel"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   required
//                   className="mt-1"
//                 />
//               </div>
//             </div>

//             {/* Address */}
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="address">
//                   Địa chỉ <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="address"
//                   name="address"
//                   value={formData.address}
//                   onChange={handleChange}
//                   required
//                   className="mt-1"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <Label htmlFor="city">
//                     Thành phố <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="city"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleChange}
//                     required
//                     className="mt-1"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="state">
//                     Tỉnh/Thành <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="state"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleChange}
//                     required
//                     className="mt-1"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <Label htmlFor="postalCode">
//                     Mã bưu điện <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="postalCode"
//                     name="postalCode"
//                     value={formData.postalCode}
//                     onChange={handleChange}
//                     required
//                     className="mt-1"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="country">
//                     Quốc gia <span className="text-red-500">*</span>
//                   </Label>
//                   <Select
//                     value={formData.country}
//                     onValueChange={(value) =>
//                       setFormData((prev) => ({ ...prev, country: value }))
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Chọn quốc gia" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Vietnam">Việt Nam</SelectItem>
//                       <SelectItem value="Other">Khác</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             {/* Save address option for logged in users */}
//             {isLoggedIn && (
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   id="saveAddress"
//                   name="saveAddress"
//                   className="rounded border-gray-300 text-primary focus:ring-primary"
//                   onChange={handleCheckboxChange}
//                 />
//                 <Label htmlFor="saveAddress" className="text-sm font-normal">
//                   Lưu địa chỉ này để sử dụng sau
//                 </Label>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Step 2: Billing & Payment */}
//       {step === 2 && (
//         <div className="space-y-8">
//           {/* Billing information */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 Thông tin thanh toán
//               </h2>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="flex items-center space-x-2 mb-6">
//                 <input
//                   type="checkbox"
//                   id="sameBillingAddress"
//                   name="sameBillingAddress"
//                   checked={formData.sameBillingAddress}
//                   className="rounded border-gray-300 text-primary focus:ring-primary"
//                   onChange={handleCheckboxChange}
//                 />
//                 <Label htmlFor="sameBillingAddress" className="font-normal">
//                   Địa chỉ thanh toán giống địa chỉ giao hàng
//                 </Label>
//               </div>

//               {!formData.sameBillingAddress && (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <Label htmlFor="billingFirstName">
//                         Họ <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         id="billingFirstName"
//                         name="billingFirstName"
//                         value={formData.billingFirstName}
//                         onChange={handleChange}
//                         required
//                         className="mt-1"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="billingLastName">
//                         Tên <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         id="billingLastName"
//                         name="billingLastName"
//                         value={formData.billingLastName}
//                         onChange={handleChange}
//                         required
//                         className="mt-1"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <Label htmlFor="billingAddress">
//                       Địa chỉ <span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       id="billingAddress"
//                       name="billingAddress"
//                       value={formData.billingAddress}
//                       onChange={handleChange}
//                       required
//                       className="mt-1"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <Label htmlFor="billingCity">
//                         Thành phố <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         id="billingCity"
//                         name="billingCity"
//                         value={formData.billingCity}
//                         onChange={handleChange}
//                         required
//                         className="mt-1"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="billingState">
//                         Tỉnh/Thành <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         id="billingState"
//                         name="billingState"
//                         value={formData.billingState}
//                         onChange={handleChange}
//                         required
//                         className="mt-1"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <Label htmlFor="billingPostalCode">
//                         Mã bưu điện <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         id="billingPostalCode"
//                         name="billingPostalCode"
//                         value={formData.billingPostalCode}
//                         onChange={handleChange}
//                         required
//                         className="mt-1"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="billingCountry">
//                         Quốc gia <span className="text-red-500">*</span>
//                       </Label>
//                       <Select
//                         value={formData.billingCountry}
//                         onValueChange={(value) =>
//                           setFormData((prev) => ({
//                             ...prev,
//                             billingCountry: value,
//                           }))
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Chọn quốc gia" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Vietnam">Việt Nam</SelectItem>
//                           <SelectItem value="Other">Khác</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Payment method */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 Phương thức thanh toán
//               </h2>
//             </div>

//             <div className="p-6">
//               <RadioGroup
//                 value={formData.paymentMethod}
//                 onValueChange={(value) =>
//                   handleRadioChange("paymentMethod", value)
//                 }
//                 className="space-y-4"
//               >
//                 <div className="flex items-center space-x-2 border rounded-lg p-4">
//                   <RadioGroupItem value="cod" id="payment-cod" />
//                   <Label htmlFor="payment-cod">
//                     Thanh toán khi nhận hàng (COD)
//                   </Label>
//                 </div>

//                 <div className="flex items-center space-x-2 border rounded-lg p-4">
//                   <RadioGroupItem value="bank-transfer" id="payment-bank" />
//                   <Label htmlFor="payment-bank">Chuyển khoản ngân hàng</Label>
//                 </div>

//                 <div className="flex items-center space-x-2 border rounded-lg p-4">
//                   <RadioGroupItem value="credit-card" id="payment-card" />
//                   <Label htmlFor="payment-card">Thẻ tín dụng/ghi nợ</Label>
//                 </div>

//                 <div className="flex items-center space-x-2 border rounded-lg p-4">
//                   <RadioGroupItem value="momo" id="payment-momo" />
//                   <Label htmlFor="payment-momo">Ví MoMo</Label>
//                 </div>
//               </RadioGroup>

//               {formData.paymentMethod === "bank-transfer" && (
//                 <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
//                   <p className="font-medium">Thông tin chuyển khoản:</p>
//                   <p>Ngân hàng: Vietcombank</p>
//                   <p>Số tài khoản: 1234567890</p>
//                   <p>Chủ tài khoản: CÔNG TY ABC</p>
//                   <p>Nội dung: Thanh toán đơn hàng [Mã đơn hàng]</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Order notes */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 Ghi chú đơn hàng
//               </h2>
//             </div>

//             <div className="p-6">
//               <Textarea
//                 id="orderNotes"
//                 name="orderNotes"
//                 value={formData.orderNotes}
//                 onChange={handleChange}
//                 placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết."
//                 className="h-32"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Step 3: Order Review & Confirmation */}
//       {step === 3 && (
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="p-6 border-b border-gray-200">
//             <h2 className="text-xl font-semibold text-gray-900">
//               Xác nhận đơn hàng
//             </h2>
//           </div>

//           <div className="p-6 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Shipping info */}
//               <div>
//                 <h3 className="font-medium text-gray-900 mb-4">
//                   Thông tin giao hàng
//                 </h3>
//                 <div className="space-y-2 text-sm">
//                   <p>
//                     {formData.firstName} {formData.lastName}
//                   </p>
//                   <p>{formData.address}</p>
//                   <p>
//                     {formData.city}, {formData.state} {formData.postalCode}
//                   </p>
//                   <p>{formData.country}</p>
//                   <p>Email: {formData.email}</p>
//                   <p>Điện thoại: {formData.phone}</p>
//                 </div>
//               </div>

//               {/* Billing info */}
//               <div>
//                 <h3 className="font-medium text-gray-900 mb-4">
//                   Thông tin thanh toán
//                 </h3>

//                 {formData.sameBillingAddress ? (
//                   <div className="space-y-2 text-sm">
//                     <p>
//                       {formData.firstName} {formData.lastName}
//                     </p>
//                     <p>{formData.address}</p>
//                     <p>
//                       {formData.city}, {formData.state} {formData.postalCode}
//                     </p>
//                     <p>{formData.country}</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2 text-sm">
//                     <p>
//                       {formData.billingFirstName} {formData.billingLastName}
//                     </p>
//                     <p>{formData.billingAddress}</p>
//                     <p>
//                       {formData.billingCity}, {formData.billingState}{" "}
//                       {formData.billingPostalCode}
//                     </p>
//                     <p>{formData.billingCountry}</p>
//                   </div>
//                 )}

//                 <div className="mt-4">
//                   <p className="font-medium text-gray-900">
//                     Phương thức thanh toán:
//                   </p>
//                   <p className="text-sm">
//                     {formData.paymentMethod === "cod" &&
//                       "Thanh toán khi nhận hàng (COD)"}
//                     {formData.paymentMethod === "bank-transfer" &&
//                       "Chuyển khoản ngân hàng"}
//                     {formData.paymentMethod === "credit-card" &&
//                       "Thẻ tín dụng/ghi nợ"}
//                     {formData.paymentMethod === "momo" && "Ví MoMo"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Order notes */}
//             {formData.orderNotes && (
//               <div>
//                 <h3 className="font-medium text-gray-900 mb-2">
//                   Ghi chú đơn hàng:
//                 </h3>
//                 <p className="text-sm italic bg-gray-50 p-3 rounded">
//                   {formData.orderNotes}
//                 </p>
//               </div>
//             )}

//             {/* Terms and conditions */}
//             <div className="mt-8">
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   id="terms"
//                   name="terms"
//                   required
//                   className="rounded border-gray-300 text-primary focus:ring-primary"
//                 />
//                 <Label htmlFor="terms" className="text-sm font-normal">
//                   Tôi đã đọc và đồng ý với{" "}
//                   <Link href="/terms" className="text-primary hover:underline">
//                     điều khoản và điều kiện
//                   </Link>{" "}
//                   của cửa hàng *
//                 </Label>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Navigation buttons */}
//       <div className="flex justify-between">
//         {step > 1 ? (
//           <Button
//             type="button"
//             variant="outline"
//             onClick={handlePreviousStep}
//             disabled={isLoading}
//           >
//             Quay lại
//           </Button>
//         ) : (
//           <Link href="/cart">
//             <Button variant="outline" disabled={isLoading}>
//               Quay lại giỏ hàng
//             </Button>
//           </Link>
//         )}

//         <Button
//           type={step === 3 ? "submit" : "button"}
//           onClick={step < 3 ? handleNextStep : undefined}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Đang xử lý...
//             </>
//           ) : step < 3 ? (
//             "Tiếp tục"
//           ) : (
//             "Đặt hàng"
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }
// // Skeleton loader component cho trang checkout
// function CheckoutSkeleton() {
//   return (
//     <div className="container max-w-6xl mx-auto px-4 py-16">
//       <Skeleton className="h-10 w-48 mb-8" />

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//         {/* Form skeletons */}
//         <div className="lg:col-span-8">
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <Skeleton className="h-8 w-40 mb-6" />
//             <div className="space-y-6">
//               {[1, 2, 3, 4].map((i) => (
//                 <div key={i}>
//                   <Skeleton className="h-4 w-24 mb-2" />
//                   <Skeleton className="h-10 w-full" />
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <Skeleton className="h-8 w-56 mb-6" />
//             <div className="space-y-4">
//               {[1, 2].map((i) => (
//                 <div key={i} className="flex items-center">
//                   <Skeleton className="h-4 w-4 mr-2" />
//                   <Skeleton className="h-4 w-40" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Order summary skeleton */}
//         <div className="lg:col-span-4">
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <Skeleton className="h-8 w-40 mb-6" />

//             <div className="border-b pb-4 mb-4">
//               <Skeleton className="h-4 w-32 mb-4" />

//               <div className="space-y-4">
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="flex justify-between">
//                     <Skeleton className="h-4 w-40" />
//                     <Skeleton className="h-4 w-20" />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="space-y-3 border-b pb-4 mb-4">
//               {[1, 2, 3].map((i) => (
//                 <div key={i} className="flex justify-between">
//                   <Skeleton className="h-4 w-24" />
//                   <Skeleton className="h-4 w-16" />
//                 </div>
//               ))}
//             </div>

//             <div className="flex justify-between mb-6">
//               <Skeleton className="h-5 w-24" />
//               <Skeleton className="h-5 w-24" />
//             </div>

//             <Skeleton className="h-10 w-full mb-4" />
//             <Skeleton className="h-4 w-32 mx-auto" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createOrder } from "@/app/actions/orderActions";
import { useCart } from "@/hooks/useCart";
import { Skeleton } from "../ui/skeleton";

interface CheckoutFormProps {
  isLoggedIn: boolean;
  addresses: any[];
}

export default function CheckoutForm({
  isLoggedIn,
  addresses = [],
}: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    // Shipping info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",

    // Saved address
    useSavedAddress: false,
    savedAddressId: "",

    // Billing
    sameBillingAddress: true,
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
    billingCountry: "Vietnam",

    // Payment
    paymentMethod: "cod",

    // Additional
    orderNotes: "",

    // Terms agreement
    termsAgreed: false,
  });

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Lấy dữ liệu giỏ hàng
  const { items, cartCount, totals, init } = useCart();
  const { subtotal, shippingTotal, taxTotal, grandTotal } = totals;

  // Khởi tạo cart và đánh dấu mounted
  useEffect(() => {
    setIsMounted(true);
    init();
  }, [init]);

  // Kiểm tra giỏ hàng trống và chuyển hướng
  useEffect(() => {
    // Chỉ thực hiện sau khi component mounted và data đã load
    if (isMounted && !isLoading && items.length === 0) {
      setTimeout(() => {
        router.push("/cart");
      }, 100);
    }
  }, [isMounted, isLoading, items.length, router]);

  // Hiển thị skeleton trong lúc loading
  if (!isMounted || isLoading) {
    return <CheckoutSkeleton />;
  }

  // Nếu không có sản phẩm, không hiển thị gì cả (sẽ redirect)
  if (items.length === 0) {
    return <CheckoutSkeleton />;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddressSelect = (addressId: string) => {
    const selectedAddress = addresses.find((addr) => addr.id === addressId);

    if (selectedAddress) {
      setFormData((prev) => ({
        ...prev,
        savedAddressId: addressId,
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        address:
          selectedAddress.addressLine1 +
          (selectedAddress.addressLine2
            ? `, ${selectedAddress.addressLine2}`
            : ""),
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
        phone: selectedAddress.phone || prev.phone,
      }));
    }
  };

  const validateStep1 = () => {
    // Kiểm tra các trường bắt buộc ở step 1
    if (!formData.firstName.trim()) return false;
    if (!formData.lastName.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.address.trim()) return false;
    if (!formData.city.trim()) return false;
    if (!formData.state.trim()) return false;
    if (!formData.postalCode.trim()) return false;

    return true;
  };

  const validateStep2 = () => {
    // Kiểm tra các trường bắt buộc ở step 2
    if (!formData.sameBillingAddress) {
      if (!formData.billingFirstName.trim()) return false;
      if (!formData.billingLastName.trim()) return false;
      if (!formData.billingAddress.trim()) return false;
      if (!formData.billingCity.trim()) return false;
      if (!formData.billingState.trim()) return false;
      if (!formData.billingPostalCode.trim()) return false;
    }

    return true;
  };

  const validateStep3 = () => {
    // Kiểm tra người dùng đã đồng ý với điều khoản chưa
    return formData.termsAgreed;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) {
      toast("Thông tin chưa đầy đủ", {
        description: "Vui lòng điền đầy đủ thông tin giao hàng",
      });
      return;
    }

    if (step === 2 && !validateStep2()) {
      toast("Thông tin chưa đầy đủ", {
        description: "Vui lòng điền đầy đủ thông tin thanh toán",
      });
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Nếu chưa ở bước cuối, di chuyển đến bước tiếp theo
    if (step < 3) {
      handleNextStep();
      return;
    }

    // Kiểm tra đồng ý điều khoản ở bước cuối
    if (!validateStep3()) {
      toast("Vui lòng đồng ý với điều khoản và điều kiện", {
        description: "Bạn cần chấp nhận điều khoản để tiếp tục đặt hàng",
      });
      return;
    }

    setIsLoading(true);
    console.log("item===", items);

    try {
      // Chuẩn bị dữ liệu sản phẩm từ giỏ hàng
      const orderItems = items.map((item) => ({
        productId: item?.product?.id,
        variant: item.variant?.id || null,
        quantity: item.quantity,
        price: item.price,
        // Thêm các thông tin cần thiết khác
      }));

      // Tạo đối tượng dữ liệu đơn hàng
      const orderData = {
        // Shipping info
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          addressLine1: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },

        // Billing info
        billingAddress: formData.sameBillingAddress
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              addressLine1: formData.address,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country,
              phone: formData.phone,
            }
          : {
              firstName: formData.billingFirstName,
              lastName: formData.billingLastName,
              addressLine1: formData.billingAddress,
              city: formData.billingCity,
              state: formData.billingState,
              postalCode: formData.billingPostalCode,
              country: formData.billingCountry,
            },

        // Contact info
        email: formData.email,

        // Payment info
        paymentMethod: formData.paymentMethod,

        // Additional
        customerNote: formData.orderNotes,

        // Order details
        items: orderItems,
        subtotal: subtotal,
        taxTotal: taxTotal,
        shippingTotal: shippingTotal,
        grandTotal: grandTotal,
      };

      console.log("Submitting order data:", orderData);
      const result = await createOrder(orderData);

      if (result.success) {
        // Chuyển hướng đến trang xác nhận đơn hàng
        router.push(`/confirmorder/${result.orderNumber}`);
      } else {
        toast("Không thể tạo đơn hàng", {
          description: result.error || "Đã có lỗi xảy ra khi tạo đơn hàng",
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast("Lỗi", {
        description: "Đã có lỗi xảy ra khi tạo đơn hàng",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress steps */}
      <div className="flex justify-between mb-8">
        <div
          className={`flex-1 text-center pb-4 relative ${
            step >= 1 ? "text-primary font-medium" : "text-gray-500"
          }`}
        >
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 ${
              step >= 1 ? "bg-primary" : "bg-gray-200"
            }`}
          />
          <span>Thông tin giao hàng</span>
        </div>
        <div
          className={`flex-1 text-center pb-4 relative ${
            step >= 2 ? "text-primary font-medium" : "text-gray-500"
          }`}
        >
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 ${
              step >= 2 ? "bg-primary" : "bg-gray-200"
            }`}
          />
          <span>Thông tin thanh toán</span>
        </div>
        <div
          className={`flex-1 text-center pb-4 relative ${
            step >= 3 ? "text-primary font-medium" : "text-gray-500"
          }`}
        >
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 ${
              step >= 3 ? "bg-primary" : "bg-gray-200"
            }`}
          />
          <span>Xác nhận đơn hàng</span>
        </div>
      </div>

      {/* Step 1: Shipping information */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Thông tin giao hàng
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Saved addresses for logged in users */}
            {isLoggedIn && addresses && addresses.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Địa chỉ đã lưu</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors ${
                        formData.savedAddressId === address.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200"
                      }`}
                      onClick={() => handleAddressSelect(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {address.firstName} {address.lastName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.addressLine1}
                          </p>
                          {address.addressLine2 && (
                            <p className="text-sm text-gray-600">
                              {address.addressLine2}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.country}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-gray-600 mt-1">
                              {address.phone}
                            </p>
                          )}
                        </div>
                        {address.isDefault && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />
              </div>
            )}

            {/* Contact information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">
                  Họ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="lastName">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">
                  Địa chỉ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">
                    Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="state">
                    Tỉnh/Thành <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="postalCode">
                    Mã bưu điện <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="country">
                    Quốc gia <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, country: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quốc gia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vietnam">Việt Nam</SelectItem>
                      <SelectItem value="Other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Save address option for logged in users */}
            {isLoggedIn && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveAddress"
                  name="saveAddress"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  onChange={handleCheckboxChange}
                />
                <Label htmlFor="saveAddress" className="text-sm font-normal">
                  Lưu địa chỉ này để sử dụng sau
                </Label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Billing & Payment */}
      {step === 2 && (
        <div className="space-y-8">
          {/* Billing information */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin thanh toán
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <input
                  type="checkbox"
                  id="sameBillingAddress"
                  name="sameBillingAddress"
                  checked={formData.sameBillingAddress}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  onChange={handleCheckboxChange}
                />
                <Label htmlFor="sameBillingAddress" className="font-normal">
                  Địa chỉ thanh toán giống địa chỉ giao hàng
                </Label>
              </div>

              {!formData.sameBillingAddress && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="billingFirstName">
                        Họ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="billingFirstName"
                        name="billingFirstName"
                        value={formData.billingFirstName}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="billingLastName">
                        Tên <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="billingLastName"
                        name="billingLastName"
                        value={formData.billingLastName}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billingAddress">
                      Địa chỉ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="billingAddress"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="billingCity">
                        Thành phố <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="billingCity"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="billingState">
                        Tỉnh/Thành <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="billingState"
                        name="billingState"
                        value={formData.billingState}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="billingPostalCode">
                        Mã bưu điện <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="billingPostalCode"
                        name="billingPostalCode"
                        value={formData.billingPostalCode}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="billingCountry">
                        Quốc gia <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.billingCountry}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            billingCountry: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quốc gia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vietnam">Việt Nam</SelectItem>
                          <SelectItem value="Other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Phương thức thanh toán
              </h2>
            </div>

            <div className="p-6">
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleRadioChange("paymentMethod", value)
                }
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="cod" id="payment-cod" />
                  <Label htmlFor="payment-cod">
                    Thanh toán khi nhận hàng (COD)
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="bank-transfer" id="payment-bank" />
                  <Label htmlFor="payment-bank">Chuyển khoản ngân hàng</Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="credit-card" id="payment-card" />
                  <Label htmlFor="payment-card">Thẻ tín dụng/ghi nợ</Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="momo" id="payment-momo" />
                  <Label htmlFor="payment-momo">Ví MoMo</Label>
                </div>
              </RadioGroup>

              {formData.paymentMethod === "bank-transfer" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">Thông tin chuyển khoản:</p>
                  <p>Ngân hàng: Vietcombank</p>
                  <p>Số tài khoản: 1234567890</p>
                  <p>Chủ tài khoản: CÔNG TY ABC</p>
                  <p>Nội dung: Thanh toán đơn hàng [Mã đơn hàng]</p>
                </div>
              )}
            </div>
          </div>

          {/* Order notes */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Ghi chú đơn hàng
              </h2>
            </div>

            <div className="p-6">
              <Textarea
                id="orderNotes"
                name="orderNotes"
                value={formData.orderNotes}
                onChange={handleChange}
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết."
                className="h-32"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Order Review & Confirmation */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Xác nhận đơn hàng
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shipping info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Thông tin giao hàng
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p>{formData.address}</p>
                  <p>
                    {formData.city}, {formData.state} {formData.postalCode}
                  </p>
                  <p>{formData.country}</p>
                  <p>Email: {formData.email}</p>
                  <p>Điện thoại: {formData.phone}</p>
                </div>
              </div>

              {/* Billing info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Thông tin thanh toán
                </h3>

                {formData.sameBillingAddress ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p>{formData.address}</p>
                    <p>
                      {formData.city}, {formData.state} {formData.postalCode}
                    </p>
                    <p>{formData.country}</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p>
                      {formData.billingFirstName} {formData.billingLastName}
                    </p>
                    <p>{formData.billingAddress}</p>
                    <p>
                      {formData.billingCity}, {formData.billingState}{" "}
                      {formData.billingPostalCode}
                    </p>
                    <p>{formData.billingCountry}</p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="font-medium text-gray-900">
                    Phương thức thanh toán:
                  </p>
                  <p className="text-sm">
                    {formData.paymentMethod === "cod" &&
                      "Thanh toán khi nhận hàng (COD)"}
                    {formData.paymentMethod === "bank-transfer" &&
                      "Chuyển khoản ngân hàng"}
                    {formData.paymentMethod === "credit-card" &&
                      "Thẻ tín dụng/ghi nợ"}
                    {formData.paymentMethod === "momo" && "Ví MoMo"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order notes */}
            {formData.orderNotes && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Ghi chú đơn hàng:
                </h3>
                <p className="text-sm italic bg-gray-50 p-3 rounded">
                  {formData.orderNotes}
                </p>
              </div>
            )}

            {/* Terms and conditions */}
            <div className="mt-8">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  Tôi đã đọc và đồng ý với{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    điều khoản và điều kiện
                  </Link>{" "}
                  của cửa hàng *
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviousStep}
            disabled={isLoading}
          >
            Quay lại
          </Button>
        ) : (
          <Link href="/cart">
            <Button variant="outline" disabled={isLoading}>
              Quay lại giỏ hàng
            </Button>
          </Link>
        )}

        <Button
          type={step === 3 ? "submit" : "button"}
          onClick={step < 3 ? handleNextStep : undefined}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : step < 3 ? (
            "Tiếp tục"
          ) : (
            "Đặt hàng"
          )}
        </Button>
      </div>
    </form>
  );
}

// Skeleton loader component cho trang checkout
function CheckoutSkeleton() {
  return (
    <div className="space-y-8">
      {/* Progress steps skeleton */}
      <div className="flex justify-between mb-8">
        <div className="flex-1 text-center pb-4 relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200" />
          <Skeleton className="h-5 w-36 mx-auto" />
        </div>
        <div className="flex-1 text-center pb-4 relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200" />
          <Skeleton className="h-5 w-36 mx-auto" />
        </div>
        <div className="flex-1 text-center pb-4 relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200" />
          <Skeleton className="h-5 w-36 mx-auto" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button skeleton */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
