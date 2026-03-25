
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, DollarSign, Calendar, Star, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getActiveSubscriptionTypes, type SubscriptionType } from "@/lib/subscriptionTypes";
import { getCurrentUser } from "@/lib/localStorage";
import PaymentMethodSelection from "./PaymentMethodSelection";
import PaymentConfirmation from "./PaymentConfirmation";
import { type PaymentMethod } from "@/lib/paymentMethods";

const SubscriptionSelection = () => {
  const [types, setTypes] = useState<SubscriptionType[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'selection' | 'payment_method' | 'payment_confirmation' | 'success'>('selection');
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionType | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTypes();
    loadCurrentUser();
  }, []);

  const loadTypes = () => {
    const activeTypes = getActiveSubscriptionTypes();
    setTypes(activeTypes);
  };

  const loadCurrentUser = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
  };

  const handleSelectSubscription = (type: SubscriptionType) => {
    setSelectedSubscription(type);
    setCurrentStep('payment_method');
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setCurrentStep('payment_confirmation');
  };

  const handlePaymentComplete = () => {
    setCurrentStep('success');
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
    setSelectedSubscription(null);
    setSelectedPaymentMethod(null);
  };

  const handleBackToPaymentMethod = () => {
    setCurrentStep('payment_method');
    setSelectedPaymentMethod(null);
  };

  const getMostPopular = () => {
    if (types.length === 0) return null;
    return types.reduce((prev, current) => 
      (current.duration > prev.duration) ? current : prev
    );
  };

  const mostPopular = getMostPopular();

  // Success Screen
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center p-8">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600 mb-2">تم إرسال طلب الدفع بنجاح!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 mb-6">
                تم إرسال طلب تجديد الاشتراك بنجاح. سيتم مراجعة طلبك وتفعيل الاشتراك خلال 24 ساعة من تأكيد الدفع.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">تفاصيل ط���بك:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>نوع الاشتراك:</strong> {selectedSubscription?.name}</p>
                  <p><strong>المدة:</strong> {selectedSubscription?.duration} يوم</p>
                  <p><strong>طريقة الدفع:</strong> {selectedPaymentMethod?.name}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>ملاحظة:</strong> ستصلك رسالة تأكيد عند تفعيل الاشتراك. في حالة وجود أي استفسار، تواصل مع الدعم الفني.
                </p>
              </div>
              
              <Button 
                onClick={handleBackToSelection}
                className="bg-gradient-to-r from-blue-600 to-purple-600 mt-6"
              >
                العودة للصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Payment Confirmation Screen
  if (currentStep === 'payment_confirmation' && selectedSubscription && selectedPaymentMethod) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <PaymentConfirmation
            selectedSubscription={selectedSubscription}
            selectedPaymentMethod={selectedPaymentMethod}
            onBack={handleBackToPaymentMethod}
            onPaymentComplete={handlePaymentComplete}
          />
        </div>
      </div>
    );
  }

  // Payment Method Selection Screen
  if (currentStep === 'payment_method' && selectedSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <PaymentMethodSelection
            selectedSubscription={selectedSubscription}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onBack={handleBackToSelection}
          />
        </div>
      </div>
    );
  }

  // Main Subscription Selection Screen
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">
          <Crown className="w-8 h-8 ml-2 text-yellow-500" />
          اختر خطة الاشتراك المناسبة لك
        </h2>
        <p className="text-gray-600">اختر الخطة التي تناسب احتياجاتك الدراسية</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((type) => (
          <Card 
            key={type.id} 
            className={`relative transition-all hover:shadow-lg ${
              mostPopular?.id === type.id ? 'border-2 border-yellow-400 shadow-lg' : ''
            }`}
          >
            {mostPopular?.id === type.id && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-white px-3 py-1">
                  <Star className="w-3 h-3 ml-1" />
                  الأكثر شيوعاً
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl mb-2">{type.name}</CardTitle>
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-green-600">
                <DollarSign className="w-6 h-6" />
                {type.price}
                <span className="text-sm text-gray-500">جنيه</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{type.duration} يوم</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {type.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className={`w-full ${
                  mostPopular?.id === type.id 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}
                onClick={() => handleSelectSubscription(type)}
              >
                اختيار هذه الخطة
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {types.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Crown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">لا توجد خطط اشتراك متاحة حالياً</h3>
            <p className="text-gray-600">سيتم إضافة خطط الاشتراك قريباً</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionSelection;
