
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, getExamCodes, markCodeAsUsed } from "@/lib/localStorage";

const ContentPage = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeId = searchParams.get('code');
  const { toast } = useToast();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // Verify the code
    if (!codeId) {
      toast({
        title: "كود غير صحيح",
        description: "يجب استخدام كود صحيح للوصول للمحتوى",
        variant: "destructive",
      });
      navigate('/code-entry');
      return;
    }

    const codes = getExamCodes();
    const code = codes.find(c => c.id === codeId);
    
    if (!code || code.type !== 'content' || code.targetId !== contentId) {
      toast({
        title: "كود غير صحيح",
        description: "الكود المستخدم غير صحيح أو منتهي الصلاحية",
        variant: "destructive",
      });
      navigate('/code-entry');
      return;
    }

    // Mark code as used if not already used
    if (!code.isUsed) {
      markCodeAsUsed(code.id);
    }

    // Mock content data - in a real app this would come from an API
    const mockContent = {
      id: contentId,
      title: "مادة الفيزياء - الكهرباء والمغناطيسية",
      description: "شرح شامل لوحدة الكهرباء والمغناطيسية مع أمثلة تطبيقية",
      modules: [
        {
          id: 1,
          title: "مقدمة عن الكهرباء",
          duration: "45 دقيقة",
          type: "video",
          content: "شرح أساسيات الكهرباء والشحنات الكهربائية"
        },
        {
          id: 2,
          title: "قانون أوم",
          duration: "30 دقيقة", 
          type: "interactive",
          content: "تطبيقات عملية على قانون أوم"
        },
        {
          id: 3,
          title: "الدوائر الكهربائية",
          duration: "60 دقيقة",
          type: "video",
          content: "أنواع الدوائر الكهربائية وطرق توصيلها"
        },
        {
          id: 4,
          title: "المغناطيسية",
          duration: "40 دقيقة",
          type: "document",
          content: "خصائص المواد المغناطيسية والحقول المغناطيسية"
        }
      ],
      resources: [
        { name: "ملخص الوحدة.pdf", type: "pdf", size: "2.5 MB" },
        { name: "أمثلة محلولة.pdf", type: "pdf", size: "1.8 MB" },
        { name: "تمارين إضافية.pdf", type: "pdf", size: "3.2 MB" }
      ]
    };

    setContent(mockContent);
    setLoading(false);
  }, [contentId, codeId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">جاري تحميل المحتوى...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">المحتوى غير موجود</p>
            <Button onClick={() => navigate('/profile')}>
              العودة للملف الشخصي
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'interactive': return '⚡';
      case 'document': return '📄';
      default: return '📚';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للملف الشخصي
          </Button>
        </div>

        <Card className="mb-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  {content.title}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {content.description}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  محتويات الدرس
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.modules.map((module: any, index: number) => (
                    <div
                      key={module.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm">
                            {getModuleIcon(module.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {index + 1}. {module.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {module.content}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {module.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  الملفات التعليمية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {content.resources.map((resource: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FileText className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {resource.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {resource.size}
                          </p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 shadow-xl border-0 bg-gradient-to-r from-blue-600 to-purple-600">
              <CardContent className="p-6 text-center text-white">
                <h3 className="font-bold mb-2">إحصائيات التقدم</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>الدروس المكتملة:</span>
                    <span>0 / {content.modules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نسبة الإنجاز:</span>
                    <span>0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
