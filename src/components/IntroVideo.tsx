
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

const IntroVideo = () => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
          <Play className="w-6 h-6 mr-2 text-blue-600" />
          فيديو تعريفي بالموقع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
          <video 
            controls 
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          >
            <source 
              src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" 
              type="video/mp4" 
            />
            المتصفح الخاص بك لا يدعم تشغيل الفيديو
          </video>
          
          {/* عرض بديل في حالة عدم توفر الفيديو */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <div className="text-center p-8">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">مرحباً بك في منصة الدراسة</h3>
              <p className="text-blue-100 mb-4">
                منصة تعليمية متطورة لإجراء الامتحانات والوصول للمحتوى التعليمي
              </p>
              <div className="text-sm text-blue-200 space-y-2">
                <p>✅ امتحانات إلكترونية آمنة</p>
                <p>✅ محتوى تعليمي متنوع</p>
                <p>✅ نظام أكواد محمي</p>
                <p>✅ لوحة تحكم شاملة</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-600">طالب مسجل</div>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">50+</div>
            <div className="text-sm text-gray-600">امتحان متاح</div>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">15+</div>
            <div className="text-sm text-gray-600">مادة دراسية</div>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">95%</div>
            <div className="text-sm text-gray-600">معدل الرضا</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntroVideo;
