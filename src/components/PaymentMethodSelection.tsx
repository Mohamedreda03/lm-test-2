
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, Zap, Building2 } from "lucide-react";
import { getActivePaymentMethods, getPaymentMethodIcon, getPaymentMethodColor, type PaymentMethod } from "@/lib/paymentMethods";
import { type SubscriptionType } from "@/lib/subscriptionTypes";

interface PaymentMethodSelectionProps {
  selectedSubscription: SubscriptionType;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  onBack: () => void;
}

const PaymentMethodSelection = ({ selectedSubscription, onPaymentMethodSelect, onBack }: PaymentMethodSelectionProps) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const paymentMethods = getActivePaymentMethods();

  const getMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'vodafone_cash': return <Smartphone className="w-6 h-6" />;
      case 'etisalat_cash': return <Smartphone className="w-6 h-6" />;
      case 'instapay': return <Zap className="w-6 h-6" />;
      case 'visa': return <CreditCard className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  const calculateTotalAmount = (method: PaymentMethod) => {
    const baseAmount = selectedSubscription.price;
    const fees = method.fees || 0;
    return baseAmount + fees;
  };

  const handleContinue = () => {
    const selectedMethod = paymentMethods.find(method => method.id === selectedMethodId);
    if (selectedMethod) {
      onPaymentMethodSelect(selectedMethod);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">اختر طريقة الدفع</h2>
        <p className="text-gray-600">اختر الطريقة المناسبة لك لدفع اشتراك {selectedSubscription.name}</p>
      </div>

      {/* Selected Subscription Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg">ملخص الاشتراك المحدد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{selectedSubscription.name}</h3>
              <p className="text-sm text-gray-600">{selectedSubscription.duration} يوم</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{selectedSubscription.price} جنيه</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>طرق الدفع المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <RadioGroup value={selectedMethodId} onValueChange={setSelectedMethodId}>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="space-y-3">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <Card className={`p-4 hover:shadow-md transition-all ${selectedMethodId === method.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${getPaymentMethodColor(method.type)} text-white`}>
                                {getMethodIcon(method.type)}
                              </div>
                              <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                  {method.name}
                                  <span className="text-lg">{getPaymentMethodIcon(method.type)}</span>
                                </h3>
                                <p className="text-sm text-gray-600">{method.accountName}</p>
                                {method.fees && method.fees > 0 && (
                                  <Badge variant="secondary" className="mt-1">
                                    رسوم إضافية: {method.fees} جنيه
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                {calculateTotalAmount(method)} جنيه
                              </p>
                              {method.fees && method.fees > 0 && (
                                <p className="text-xs text-gray-500">
                                  ({selectedSubscription.price} + {method.fees} رسوم)
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طرق دفع متاحة</h3>
              <p className="text-gray-600">تواصل مع الإدارة لإضافة طرق الدفع</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          العودة
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!selectedMethodId}
          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
        >
          متابعة الدفع
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodSelection;
