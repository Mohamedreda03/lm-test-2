
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowRight } from "lucide-react";
import { getExamCodes, getCurrentUser, assignCodeToUser } from "@/lib/localStorage";

const CodeEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const codes = getExamCodes();
    const foundCode = codes.find(c => c.code === code.toUpperCase() && !c.isUsed);

    if (!foundCode) {
      toast({
        title: "كود غير صحيح",
        description: "الكود المدخل غير صحيح أو مستخدم بالفعل",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if code is assigned to this user or unassigned
    if (foundCode.assignedUserId && foundCode.assignedUserId !== currentUser.id) {
      toast({
        title: "كود غير مخصص لك",
        description: "هذا الكود مخصص لطالب آخر",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Assign code to user if not already assigned
    if (!foundCode.assignedUserId) {
      assignCodeToUser(foundCode.id, currentUser.id);
    }

    // Navigate based on code type
    setTimeout(() => {
      if (foundCode.type === 'exam') {
        navigate(`/exam/${foundCode.targetId}?code=${foundCode.id}`);
      } else if (foundCode.type === 'content') {
        navigate(`/content/${foundCode.targetId}?code=${foundCode.id}`);
      } else {
        toast({
          title: "نوع كود غير معروف",
          description: "نوع الكود غير صحيح",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              أدخل كود المحتوى
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              أدخل الكود الذي حصلت عليه للوصول إلى المحتوى أو الامتحان
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-700 dark:text-gray-300 font-medium">
                  الكود
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="أدخل الكود هنا"
                  className="text-center text-lg font-mono tracking-wider h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                  maxLength={8}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold hover-scale transition-all duration-300"
                disabled={isLoading || code.length < 4}
              >
                {isLoading ? "جاري التحقق..." : "دخول"}
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                className="text-gray-600 dark:text-gray-300 hover-scale"
              >
                العودة للملف الشخصي
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeEntry;
