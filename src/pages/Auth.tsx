import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Phone, Calendar, MapPin, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveUser, findUser, setCurrentUser, checkAdminCredentials, getUsers, generateVerificationCode } from "@/lib/localStorage";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a success message from previous navigation
    if (location.state?.showSuccess) {
      toast({
        title: "نجح العملية",
        description: location.state.message,
      });
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  const validatePhoneNumber = (phone: string) => {
    // Egyptian phone number validation
    const phoneRegex = /^(01)[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("تم بدء عملية تسجيل الدخول");
    
    const formData = new FormData(e.target as HTMLFormElement);
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    
    console.log("بيانات تسجيل الدخول:", { phone, password: password ? "تم إدخال كلمة مرور" : "لم يتم إدخال كلمة مرور" });
    
    // Validate phone number format
    if (!validatePhoneNumber(phone)) {
      setIsLoading(false);
      toast({
        title: "رقم هاتف غير صحيح",
        description: "يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check for admin credentials
      if (checkAdminCredentials(phone, password)) {
        const adminUser = {
          id: "0",
          name: "مسؤول",
          role: "admin",
          phone,
          email: "",
        };
        setCurrentUser(adminUser); // احفظ بيانات الأدمن كاملة
        setIsLoading(false);
        toast({
          title: "مرحباً بك في لوحة التحكم",
          description: "تم تسجيل الدخول بنجاح كمسؤول",
        });
        navigate('/admin');
        return;
      } 
      
      // Check for regular user
      const user = findUser(phone, password);
      if (user) {
        setCurrentUser(user); // احفظ بيانات المستخدم كاملة بدل فقط user.id
        setIsLoading(false);
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً بك ${user.name}`,
        });
        navigate('/profile');
      } else {
        setIsLoading(false);
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "رقم الهاتف أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("خطأ في تسجيل الدخول:", error);
      setIsLoading(false);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const birthdate = formData.get('birthdate') as string;
    const governorate = formData.get('governorate') as string;
    const center = formData.get('center') as string;
    const district = formData.get('district') as string;
    const section = formData.get('section') as string || "غير محدد";
    const gender = formData.get('gender') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate phone number format
    if (!validatePhoneNumber(phone)) {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "رقم هاتف غير صحيح",
          description: "يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01 ويتكون من 11 رقم",
          variant: "destructive",
        });
      }, 1000);
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "بريد إلكتروني غير صحيح",
          description: "يرجى إدخال بريد إلكتروني صحيح",
          variant: "destructive",
        });
      }, 1000);
      return;
    }

    // Check if phone number already exists
    const existingUsers = getUsers();
    const phoneExists = existingUsers.some(user => user.phone === phone);
    if (phoneExists) {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "رقم الهاتف مسجل بالفعل",
          description: "يرجى استخدام رقم هاتف آخر أو تسجيل الدخول",
          variant: "destructive",
        });
      }, 1000);
      return;
    }

    // Check if email already exists
    const emailExists = existingUsers.some(user => user.email === email);
    if (emailExists) {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "البريد الإلكتروني مسجل بالفعل",
          description: "يرجى استخدام بريد إلكتروني آخر",
          variant: "destructive",
        });
      }, 1000);
      return;
    }

    if (password !== confirmPassword) {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "خطأ في كلمة المرور",
          description: "كلمة المرور وتأكيدها غير متطابقين",
          variant: "destructive",
        });
      }, 1000);
      return;
    }

    try {
      const userData = {
        name,
        phone,
        email,
        birthdate,
        governorate,
        center,
        district,
        section,
        gender,
        password
      };

      saveUser(userData);
      
      // Generate verification code and show it in a more prominent way
      const verificationCode = generateVerificationCode(phone, email, 'phone_verification');
      
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "تم إنشاء الحساب بنجاح!",
          description: `كود التحقق الخاص بك هو: ${verificationCode.code}. احتفظ به للتحقق من حسابك لاحقاً.`,
          duration: 10000, // Show for 10 seconds
        });
        
        // Navigate to verification page with user data
        navigate('/phone-verification', { 
          state: { userData: { ...userData, phone, email } }
        });
      }, 1000);
    } catch (error: any) {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "خطأ في إنشاء الحساب",
          description: error.message || "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى",
          variant: "destructive",
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-all duration-300 hover:scale-105 animate-fade-in">
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للرئيسية
          </Link>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg animate-scale-in relative overflow-hidden">
          {/* Card decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Shadovate
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
              منصة التعلم الذكية
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 mx-6 bg-gray-100/80 dark:bg-gray-700/80">
              <TabsTrigger value="login" className="transition-all duration-300">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register" className="transition-all duration-300">إنشاء حساب</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-6 px-8">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-right block font-medium">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        id="phone" 
                        name="phone"
                        type="tel" 
                        placeholder="01044764610"
                        className="pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">يجب أن يبدأ برقم 01 ويتكون من 11 رقم</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-right block font-medium">كلمة المرور</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                      required 
                    />
                  </div>
                  
                  <div className="text-center">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                </CardContent>
                <CardFooter className="px-8 pb-8">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري التحميل...
                      </div>
                    ) : "تسجيل الدخول"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto px-8">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-right block font-medium">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        id="name" 
                        name="name"
                        type="text" 
                        placeholder="محمد أحمد علي"
                        className="pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-phone" className="text-right block font-medium">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        id="register-phone" 
                        name="phone"
                        type="tel" 
                        placeholder="01234567890"
                        className="pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">يجب أن يبدأ برقم 01 ويتكون من 11 رقم</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-right block font-medium">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="example@email.com"
                        className="pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthdate" className="text-right block font-medium">تاريخ الميلاد</Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        id="birthdate" 
                        name="birthdate"
                        type="date" 
                        className="pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-right block font-medium">النوع</Label>
                    <RadioGroup name="gender" className="flex space-x-6 justify-center" required>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">ذكر</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">أنثى</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="governorate" className="text-right block font-medium">المحافظة</Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        id="governorate" 
                        name="governorate"
                        type="text" 
                        placeholder="القاهرة"
                        className="pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="center" className="text-right block font-medium">المركز</Label>
                    <Input 
                      id="center" 
                      name="center"
                      type="text" 
                      placeholder="مدينة نصر"
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-right block font-medium">القسم</Label>
                    <Input 
                      id="district" 
                      name="district"
                      type="text" 
                      placeholder="أول مدينة نصر"
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="section" className="text-right block font-medium">الشعبة (اختياري)</Label>
                    <Select name="section">
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500">
                        <SelectValue placeholder="اختر الشعبة (اختياري)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="science_sciences">علمي علوم</SelectItem>
                        <SelectItem value="science_math">علمي رياضة</SelectItem>
                        <SelectItem value="arts">أدبي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-right block font-medium">كلمة المرور</Label>
                    <Input 
                      id="register-password" 
                      name="password" 
                      type="password" 
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-right block font-medium">تأكيد كلمة المرور</Label>
                    <Input 
                      id="confirm-password" 
                      name="confirmPassword" 
                      type="password" 
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter className="px-8 pb-8">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري التحميل...
                      </div>
                    ) : "إنشاء حساب"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
