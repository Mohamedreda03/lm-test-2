import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Phone, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyCode, generateVerificationCode, markUserAsVerified } from "@/lib/localStorage";

const PhoneVerification = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const userData = location.state?.userData;
  const phone = userData?.phone;

  useEffect(() => {
    if (!userData || !phone) {
      navigate('/auth');
      return;
    }

    // Show skip option after 30 seconds
    const skipTimer = setTimeout(() => {
      setShowSkipOption(true);
    }, 30000);

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(skipTimer);
    };
  }, [userData, phone, navigate]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: "كود غير مكتمل",
        description: "يرجى إدخال الكود المكون من 6 أرقام",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const isValid = verifyCode(phone, code, 'phone_verification');
      
      if (isValid) {
        // Mark user as verified and save to database
        markUserAsVerified(phone);
        
        toast({
          title: "تم التحقق بنجاح",
          description: "تم إنشاء حسابك بنجاح وتم التحقق من رقم الهاتف",
        });
        
        setTimeout(() => {
          navigate('/auth', { 
            state: { 
              showSuccess: true,
              message: "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول"
            }
          });
        }, 1000);
      } else {
        toast({
          title: "كود خاطئ",
          description: "الكود المدخل غير صحيح أو منتهي الصلاحية",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في التحقق",
        description: "حدث خطأ أثناء التحقق، حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipVerification = () => {
    toast({
      title: "تم تخطي التحقق",
      description: "يمكنك التحقق من رقم الهاتف لاحقاً من الإعدادات",
    });
    
    setTimeout(() => {
      navigate('/auth', { 
        state: { 
          showSuccess: true,
          message: "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول"
        }
      });
    }, 1000);
  };

  const handleResendCode = () => {
    if (!canResend) return;
    
    try {
      const newCode = generateVerificationCode(phone, userData.email, 'phone_verification');
      setCanResend(false);
      setCountdown(60);
      setCode("");
      
      toast({
        title: "تم إرسال الكود",
        description: `كود التحقق الجديد هو: ${newCode.code}`,
        duration: 8000,
      });
      
      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "خطأ في الإرسال",
        description: "فشل في إرسال الكود، حاول مرة أخرى",
        variant: "destructive",
      });
    }
  };

  if (!userData || !phone) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/auth" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة لتسجيل الدخول
          </Link>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">تحقق من رقم الهاتف</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              أدخل الكود المرسل إلى رقم {phone}
              <br />
              <span className="text-xs text-gray-500 mt-2 block">
                تم عرض الكود في الرسالة السابقة وفي وحدة التحكم للمطورين (F12)
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              onClick={handleVerify}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري التحقق...
                </div>
              ) : "تحقق من الكود"}
            </Button>

            <div className="text-center space-y-2">
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={!canResend}
                className="text-blue-600 hover:text-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {canResend ? "إعادة إرسال الكود" : `إعادة الإرسال خلال ${countdown}ث`}
              </Button>
              
              {showSkipOption && (
                <Button
                  variant="outline"
                  onClick={handleSkipVerification}
                  className="w-full text-gray-600 hover:text-gray-700"
                >
                  تخطي التحقق الآن (يمكن التحقق لاحقاً)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhoneVerification;
