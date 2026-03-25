
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, Calendar, MapPin, Trophy, Clock, BookOpen, Activity } from "lucide-react";
import { getUserTransactions, getUserExamResults, getExams } from "@/lib/localStorage";

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsModal = ({ user, isOpen, onClose }: UserDetailsModalProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);

  useEffect(() => {
    if (user && isOpen) {
      const userTransactions = getUserTransactions(user.id);
      const userExamResults = getUserExamResults(user.id);
      const exams = getExams();
      
      // Enhance exam results with exam titles
      const enhancedResults = userExamResults.map(result => {
        const exam = exams.find(e => e.id === result.examId);
        return {
          ...result,
          examTitle: exam?.title || `امتحان ${result.examId}`
        };
      });
      
      setTransactions(userTransactions);
      setExamResults(enhancedResults);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const getSectionName = (section: string) => {
    switch (section) {
      case "science_sciences": return "علمي علوم";
      case "science_math": return "علمي رياضة";
      case "arts": return "أدبي";
      default: return section;
    }
  };

  const getGenderName = (gender: string) => {
    return gender === 'male' ? 'ذكر' : 'أنثى';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'exam_start': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'exam_complete': return <Trophy className="w-4 h-4 text-green-500" />;
      case 'content_view': return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'code_use': return <Activity className="w-4 h-4 text-orange-500" />;
      case 'login': return <User className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const averageScore = examResults.length > 0 
    ? Math.round(examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            تفاصيل الطالب: {user.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">البيانات الشخصية</TabsTrigger>
            <TabsTrigger value="exams">الاختبارات</TabsTrigger>
            <TabsTrigger value="activity">النشاط</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    البيانات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الاسم:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم الهاتف:</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ الميلاد:</span>
                    <span className="font-medium">{user.birthdate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">النوع:</span>
                    <span className="font-medium">{getGenderName(user.gender)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الشعبة:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {getSectionName(user.section)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ التسجيل:</span>
                    <span className="font-medium">{user.joinDate}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Location Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    بيانات العنوان
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المحافظة:</span>
                    <span className="font-medium">{user.governorate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المركز:</span>
                    <span className="font-medium">{user.center}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">القسم:</span>
                    <span className="font-medium">{user.district}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{examResults.length}</div>
                <div className="text-sm text-gray-600">امتحان مكتمل</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-purple-600">{averageScore}%</div>
                <div className="text-sm text-gray-600">المتوسط العام</div>
              </Card>
              <Card className="text-center p-4">
                <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{transactions.length}</div>
                <div className="text-sm text-gray-600">نشاط كلي</div>
              </Card>
              <Card className="text-center p-4">
                <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{examResults.length * 2}</div>
                <div className="text-sm text-gray-600">ساعات دراسة</div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سجل الاختبارات ({examResults.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {examResults.length > 0 ? (
                  <div className="space-y-3">
                    {examResults.map((result) => (
                      <div key={result.id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                        <div>
                          <h4 className="font-medium">{result.examTitle}</h4>
                          <p className="text-sm text-gray-600">
                            {result.date} - مدة الامتحان: {result.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={
                              result.score >= 80 
                                ? "bg-green-100 text-green-800" 
                                : result.score >= 60 
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {result.score}%
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {result.answers.length} سؤال
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">لم يقم الطالب بأي امتحانات بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سجل النشاط ({transactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {transaction.date} في {transaction.time}
                            </p>
                          </div>
                        </div>
                        {transaction.score && (
                          <Badge variant="secondary">
                            {transaction.score}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">لا يوجد نشاط مسجل للطالب</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
