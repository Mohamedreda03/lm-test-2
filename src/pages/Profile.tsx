import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, Calendar, GraduationCap, BookOpen, Trophy, Clock, MapPin, Home, Crown, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { 
  getCurrentUser, 
  logout, 
  getUserExamResults, 
  getSubjectsByUserSection, 
  getUserNotifications, 
  markNotificationAsRead,
  getUserSubjectRankings,
  getUserOverallRanking,
  getUserSubscription
} from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    totalSubjects: 0,
    completedExams: 0,
    averageScore: 0,
    studyHours: 0
  });
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [userSubjects, setUserSubjects] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [subjectRankings, setSubjectRankings] = useState<any[]>([]);
  const [overallRanking, setOverallRanking] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    setUser(currentUser);
    
    // Get user exam results
    const results = getUserExamResults(currentUser.id);
    setExamHistory(results);
    
    // Get subjects for user's section
    const subjects = getSubjectsByUserSection(currentUser.section);
    setUserSubjects(subjects);
    
    // Get user notifications
    const notifications = getUserNotifications(currentUser.id);
    setUserNotifications(notifications);
    
    // Get rankings
    const subjectRanks = getUserSubjectRankings(currentUser.id);
    setSubjectRankings(subjectRanks);
    
    const overallRank = getUserOverallRanking(currentUser.id);
    setOverallRanking(overallRank);
    
    // Get subscription info
    const subscriptionDetails = getUserSubscription(currentUser.id);
    setUserSubscription(subscriptionDetails);
    
    // Calculate stats
    const completedExams = results.length;
    const averageScore = results.length > 0 
      ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
      : 0;
    
    setUserStats({
      totalSubjects: subjects.length,
      completedExams,
      averageScore,
      studyHours: completedExams * 2 // Approximate study hours
    });
  }, [navigate, toast]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    const notifications = getUserNotifications(user.id);
    setUserNotifications(notifications);
  };

  const getSectionName = (section: string) => {
    switch (section) {
      case "science_sciences": return "علمي علوم";
      case "science_math": return "علمي رياضة";
      case "science_sciences_math": return "علمي علوم ورياضة";
      case "arts": return "أدبي";
      case "all_sections": return "جميع الشعب";
      default: return section;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-purple-50 border-purple-200';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleLogout} className="hover-scale">
              تسجيل الخروج
            </Button>
            <Link to="/">
              <Button variant="outline" className="hover-scale">العودة للرئيسية</Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg animate-scale-in">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">
                  {getSectionName(user.section)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 ml-2" />
                  <span className="text-sm">{user.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 ml-2" />
                  <span className="text-sm">تاريخ الميلاد: {user.birthdate}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 ml-2" />
                  <span className="text-sm">{user.governorate}, {user.center}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 ml-2" />
                  <span className="text-sm">القسم: {user.district}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-gray-400 ml-2" />
                  <span className="text-sm">انضم في {user.joinDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="text-center p-4 hover-scale animate-scale-in">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{userStats.totalSubjects}</div>
                <div className="text-sm text-gray-600">المواد</div>
              </Card>
              <Card className="text-center p-4 hover-scale animate-scale-in">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{userStats.completedExams}</div>
                <div className="text-sm text-gray-600">الامتحانات</div>
              </Card>
              <Card className="text-center p-4 hover-scale animate-scale-in">
                <div className="text-2xl font-bold text-purple-600">{userStats.averageScore}%</div>
                <div className="text-sm text-gray-600">المتوسط</div>
              </Card>
              <Card className="text-center p-4 hover-scale animate-scale-in">
                <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{userStats.studyHours}</div>
                <div className="text-sm text-gray-600">ساعة دراسة</div>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="home" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="home">الرئيسية</TabsTrigger>
                <TabsTrigger value="subscription">اشتراكك</TabsTrigger>
                <TabsTrigger value="ranking">ترتيبك</TabsTrigger>
                <TabsTrigger value="subjects">المواد</TabsTrigger>
                <TabsTrigger value="exams">الامتحانات</TabsTrigger>
                <TabsTrigger value="notifications" className="relative">
                  الإشعارات
                  {userNotifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {userNotifications.filter(n => !n.read).length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="mt-6">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Home className="w-6 h-6 ml-2" />
                      الصفحة الرئيسية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً بك {user.name}</h2>
                        <p className="text-gray-600 mb-4">أهلاً بك في منصة التعليم الإلكتروني</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                          <Trophy className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                          <h3 className="font-semibold text-lg mb-2">إجمالي الامتحانات</h3>
                          <p className="text-3xl font-bold text-blue-600">{userStats.completedExams}</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-green-600" />
                          <h3 className="font-semibold text-lg mb-2">متوسط الدرجات</h3>
                          <p className="text-3xl font-bold text-green-600">{userStats.averageScore}%</p>
                        </div>
                      </div>
                      
                      <Link to="/">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 text-lg">
                          الانتقال للصفحة الرئيسية
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription" className="mt-6">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Crown className="w-6 h-6 ml-2" />
                      معلومات الاشتراك
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userSubscription && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                            userSubscription.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <Crown className="w-5 h-5 ml-2" />
                            {userSubscription.isActive ? 'اشتراك نشط' : 'اشتراك منتهي'}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">نوع الاشتراك</h3>
                            <p className="text-2xl font-bold text-purple-600 capitalize">{userSubscription.type}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">الأيام المتبقية</h3>
                            <p className={`text-2xl font-bold ${
                              userSubscription.daysLeft > 30 ? 'text-green-600' : 
                              userSubscription.daysLeft > 7 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {userSubscription.daysLeft} يوم
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">تاريخ بداية الاشتراك</h3>
                            <p className="text-lg">{new Date(userSubscription.startDate).toLocaleDateString('ar-EG')}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">تاريخ انتهاء الاشتراك</h3>
                            <p className="text-lg">{new Date(userSubscription.expiryDate).toLocaleDateString('ar-EG')}</p>
                          </div>
                        </div>
                        
                        {userSubscription.daysLeft < 30 && (
                          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                            <p className="text-yellow-800 mb-2">اشتراكك سينتهي قريباً!</p>
                            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500">
                              تجديد الاشتراك
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ranking" className="mt-6">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="w-6 h-6 ml-2" />
                      ترتيبك العام والتفصيلي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Overall Ranking */}
                      {overallRanking && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                          <h3 className="text-xl font-bold mb-4 text-center">ترتيبك العام</h3>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">
                              #{overallRanking.rank}
                            </div>
                            <p className="text-gray-600">من أصل {overallRanking.totalUsers} طالب</p>
                            {overallRanking.userScore && (
                              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="font-semibold">إجمالي النقاط</p>
                                  <p className="text-lg text-blue-600">{overallRanking.userScore.totalScore}</p>
                                </div>
                                <div>
                                  <p className="font-semibold">متوسط الوقت</p>
                                  <p className="text-lg text-green-600">{Math.round(overallRanking.userScore.avgTime)} دقيقة</p>
                                </div>
                                <div>
                                  <p className="font-semibold">عدد الامتحانات</p>
                                  <p className="text-lg text-orange-600">{overallRanking.userScore.examCount}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Subject Rankings */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">ترتيبك في كل مادة</h3>
                        <div className="space-y-4">
                          {subjectRankings.length > 0 ? (
                            subjectRankings.map((item) => (
                              <div key={item.subject.id} className="border rounded-lg p-4 hover-scale">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-semibold text-lg">{item.subject.name}</h4>
                                  <Badge className={
                                    item.ranking.rank <= 3 ? "bg-yellow-100 text-yellow-800" : 
                                    item.ranking.rank <= 10 ? "bg-blue-100 text-blue-800" : 
                                    "bg-gray-100 text-gray-800"
                                  }>
                                    #{item.ranking.rank} من {item.ranking.totalUsers}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div className="text-center">
                                    <p className="font-semibold text-gray-600">متوسط الدرجات</p>
                                    <p className="text-lg font-bold text-blue-600">{item.avgScore}%</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold text-gray-600">عدد الامتحانات</p>
                                    <p className="text-lg font-bold text-green-600">{item.examCount}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold text-gray-600">ساعات الدراسة</p>
                                    <p className="text-lg font-bold text-purple-600">{item.studyHours}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold text-gray-600">الترتيب</p>
                                    <p className="text-lg font-bold text-orange-600">#{item.ranking.rank}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات ترتيب بعد</h3>
                              <p className="text-gray-600">ابدأ بحل الامتحانات لتظهر بياناتك في الترتيب</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subjects" className="mt-6">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>المواد المتاحة لك</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {userSubjects.length > 0 ? (
                        userSubjects.map((subject) => (
                          <Card key={subject.id} className="p-4 hover-scale cursor-pointer border-l-4 border-blue-600">
                            <h3 className="font-semibold text-lg mb-2">{subject.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{subject.description}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2">
                                {subject.sections.map((section: string) => (
                                  <Badge key={section} variant="secondary" className="text-xs">
                                    {getSectionName(section)}
                                  </Badge>
                                ))}
                              </div>
                              <Link to="/code-entry">
                                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                                  دراسة المادة
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مواد متاحة</h3>
                          <p className="text-gray-600">لا توجد مواد مضافة لشعبتك بعد. تواصل مع الإدارة لإضافة المواد.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exams" className="mt-6">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>سجل الامتحانات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {examHistory.length > 0 ? (
                        examHistory.map((exam) => (
                          <div key={exam.id} className="flex justify-between items-center p-4 border rounded-lg hover-scale">
                            <div>
                              <h3 className="font-semibold">امتحان رقم {exam.examId}</h3>
                              <p className="text-sm text-gray-600">{exam.date} - {exam.duration}</p>
                            </div>
                            <Badge className={exam.score >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {exam.score}%
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">لم تقم بإجراء أي امتحانات بعد</h3>
                          <p className="text-gray-600">ابدأ بحل الامتحانات المتاحة في المواد التي تدرسها</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>الإشعارات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userNotifications.length > 0 ? (
                        userNotifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${getNotificationBgColor(notification.type, notification.read)}`}
                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 space-x-reverse">
                                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                <div className="flex-1">
                                  <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {notification.title}
                                  </h3>
                                  <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🔔</span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات جديدة</h3>
                          <p className="text-gray-600">ستظهر هنا الإشعارات الجديدة حول الامتحانات والمواد الدراسية</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
