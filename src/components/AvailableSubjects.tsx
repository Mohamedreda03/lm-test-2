
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users } from "lucide-react";
import { getSubjects, getCurrentUser, getSubjectsByUserSection } from "@/lib/localStorage";
import { Link } from "react-router-dom";

const getSectionName = (section: string) => {
  switch (section) {
    case "science_sciences":
      return "علمي علوم";
    case "science_math":
      return "علمي رياضة";
    case "arts":
      return "أدبي";
    default:
      return section;
  }
};

const getSectionColor = (section: string) => {
  switch (section) {
    case "science_sciences":
      return "bg-green-100 text-green-800";
    case "science_math":
      return "bg-blue-100 text-blue-800";
    case "arts":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const AvailableSubjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      // Show subjects for user's section only
      const userSubjects = getSubjectsByUserSection(user.section);
      setSubjects(userSubjects);
    } else {
      // Show all subjects for non-logged-in users
      setSubjects(getSubjects());
    }
  }, []);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            المواد المتاحة
          </h2>
          <p className="text-xl text-gray-600">
            {currentUser 
              ? `المواد المتاحة لشعبة ${getSectionName(currentUser.section)}`
              : "اختر المادة التي تريد دراستها وابدأ رحلتك التعليمية"
            }
          </p>
        </div>
        
        {subjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {subject.name}
                    </CardTitle>
                    <Badge className={getSectionColor(subject.section)}>
                      {getSectionName(subject.section)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {subject.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 ml-1" />
                      <span>{subject.studentsCount} طالب</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4 ml-1" />
                      <span>0 درس</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 ml-1" />
                      <span>{subject.examsCount} امتحان</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentUser ? "لا توجد مواد متاحة لشعبتك بعد" : "لا توجد مواد متاحة بعد"}
            </h3>
            <p className="text-gray-600">
              {currentUser 
                ? "تواصل مع الإدارة لإضافة المواد المناسبة لشعبتك"
                : "سيتم إضافة المواد قريباً"
              }
            </p>
          </div>
        )}
        
        {!currentUser && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              لا تملك حساب؟ سجل الآن للوصول لجميع المواد
            </p>
            <Link 
              to="/auth" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              إنشاء حساب مجاني
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableSubjects;
