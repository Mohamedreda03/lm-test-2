
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Copy, Upload, CheckCircle, AlertCircle, Phone, User, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type PaymentMethod } from "@/lib/paymentMethods";
import { type SubscriptionType } from "@/lib/subscriptionTypes";
import { getCurrentUser, savePaymentTransaction } from "@/lib/localStorage";

interface PaymentConfirmationProps {
  selectedSubscription: SubscriptionType;
  selectedPaymentMethod: PaymentMethod;
  onBack: () => void;
  onPaymentComplete: () => void;
}

const PaymentConfirmation = ({ 
  selectedSubscription, 
  selectedPaymentMethod, 
  onBack, 
  onPaymentComplete 
}: PaymentConfirmationProps) => {
  const [transactionId, setTransactionId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const calculateTotalAmount = () => {
    const baseAmount = selectedSubscription.price;
    const fees = selectedPaymentMethod.fees || 0;
    return baseAmount + fees;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص إلى الحافظة",
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "خطأ",
          description: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم العملية",
        variant: "destructive",
      });
      return;
    }

    if (!senderName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المرسل",
        variant: "destructive",
      });
      return;
    }

    if (!senderPhone.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم هاتف المرسل",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error("لم يتم العثور على بيانات المستخدم");
      }

      // Save payment transaction with correct parameter structure
      const paymentData = {
        userId: currentUser.id,
        subscriptionId: selectedSubscription.id,
        amount: calculateTotalAmount(),
        paymentMethod: selectedPaymentMethod.name,
        paymentDetails: {
          paymentMethodId: selectedPaymentMethod.id,
          transactionId: transactionId.trim(),
          senderName: senderName.trim(),
          senderPhone: senderPhone.trim(),
          notes: notes.trim(),
          receiptFileName: receiptFile?.name || ""
        },
        receiptUrl: receiptFile?.name || undefined
      };

      const saved = savePaymentTransaction(paymentData);
      
      if (saved) {
        toast({
          title: "تم إرسال طلب الدفع بنجاح! ✅",
          description: "سيتم مراجعة طلبك وتفعيل الاشتراك خلال 24 ساعة",
        });
        onPaymentComplete();
      } else {
        throw new Error("فشل في حفظ بيانات الدفع");
      }
    } catch (error) {
      console.error("Payment submission error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال طلب الدفع. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">تأكيد الدفع</h2>
        <p className="text-gray-600">أكمل بيانات الدفع لتفعيل اشتراكك</p>
      </div>

      {/* Payment Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">ملخص عملية الدفع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>الاشتراك:</span>
            <span className="font-semibold">{selectedSubscription.name}</span>
          </div>
          <div className="flex justify-between">
            <span>المدة:</span>
            <span>{selectedSubscription.duration} يوم</span>
          </div>
          <div className="flex justify-between">
            <span>طريقة الدفع:</span>
            <span className="font-semibold">{selectedPaymentMethod.name}</span>
          </div>
          <div className="flex justify-between">
            <span>سعر الاشتراك:</span>
            <span>{selectedSubscription.price} جنيه</span>
          </div>
          {selectedPaymentMethod.fees && selectedPaymentMethod.fees > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>رسوم الدفع:</span>
              <span>{selectedPaymentMethod.fees} جنيه</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold text-green-600">
            <span>إجمالي المبلغ:</span>
            <span>{calculateTotalAmount()} جنيه</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            تعليمات الدفع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">خطوات الدفع:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>انسخ رقم الحساب أدناه</li>
              <li>أرسل المبلغ المطلوب إلى الحساب</li>
              <li>احتفظ بإيصال العملية</li>
              <li>أدخل بيانات العملية في النموذج أدناه</li>
              <li>ارفع صورة الإيصال (اختياري)</li>
            </ol>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">بيانات الحساب:</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>رقم الحساب:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded text-sm font-mono">
                    {selectedPaymentMethod.accountNumber}
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(selectedPaymentMethod.accountNumber)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span>اسم صاحب الحساب:</span>
                <span className="font-semibold">{selectedPaymentMethod.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span>المبلغ المطلوب:</span>
                <span className="font-bold text-green-600">{calculateTotalAmount()} جنيه</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p><strong>ملاحظة مهمة:</strong> {selectedPaymentMethod.instructions}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>بيانات العملية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transactionId">رقم العملية *</Label>
              <Input
                id="transactionId"
                placeholder="أدخل رقم العملية"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="senderName">اسم المرسل *</Label>
              <Input
                id="senderName"
                placeholder="اسم من قام بالتحويل"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="senderPhone">رقم هاتف المرسل *</Label>
            <Input
              id="senderPhone"
              placeholder="رقم هاتف من قام بالتحويل"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="receipt">إيصال الدفع (اختياري)</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="mt-1"
            />
            {receiptFile && (
              <p className="text-sm text-green-600 mt-1">
                تم اختيار: {receiptFile.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="أي ملاحظات إضافية..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          العودة
        </Button>
        <Button 
          onClick={handleSubmitPayment}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
        >
          {isSubmitting ? "جاري الإرسال..." : "تأكيد الدفع"}
        </Button>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
