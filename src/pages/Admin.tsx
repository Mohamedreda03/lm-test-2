import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, BookOpen, FileText, Plus, Edit, Trash2, Eye, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  getUsers, 
  getSubjects, 
  saveSubject,
  deleteSubject,
  updateSubject,
  getExams, 
  saveExam,
  deleteExam,
  updateExam,
  getStatistics,
  saveContent,
  getContents,
  deleteContent,
  updateContent,
  deleteUser
} from "@/lib/localStorage";
import CodesManagement from "@/components/CodesManagement";
import ExamQuestionsManager from "@/components/ExamQuestionsManager";
import UserDetailsModal from "@/components/UserDetailsModal";
import IntroVideo from "@/components/IntroVideo";
import NotificationsManager from "@/components/NotificationsManager";
import SubscriptionTypesManager from "@/components/SubscriptionTypesManager";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isEditExamOpen, setIsEditExamOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [isEditContentOpen, setIsEditContentOpen] = useState(false);
  const [isQuestionsManagerOpen, setIsQuestionsManagerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("subjects");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSubjects(getSubjects());
    setUsers(getUsers());
    setExams(getExams());
    setContents(getContents());
    setStats(getStatistics());
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

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('subjectName') as string;
    const sections = Array.from(formData.getAll('subjectSections')) as string[];
    const description = formData.get('subjectDescription') as string;

    if (!name || sections.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      saveSubject({ name, sections, description: description || `دراسة ${name}` });
      loadData();
      setIsAddSubjectOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المادة بنجاح",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المادة",
        variant: "destructive",
      });
    }
  };

  const handleEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('subjectName') as string;
    const sections = Array.from(formData.getAll('subjectSections')) as string[];
    const description = formData.get('subjectDescription') as string;

    try {
      updateSubject(selectedItem.id, { name, sections, description });
      loadData();
      setIsEditSubjectOpen(false);
      setSelectedItem(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المادة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المادة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المادة؟")) {
      try {
        deleteSubject(subjectId);
        loadData();
        toast({
          title: "تم بنجاح",
          description: "تم حذف المادة بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف المادة",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('examTitle') as string;
    const subject = formData.get('examSubject') as string;
    const questionsCount = parseInt(formData.get('questionsCount') as string);
    const duration = parseInt(formData.get('duration') as string);

    if (!title || !subject || !questionsCount || !duration) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      const newExam = saveExam({ title, subject, questionsCount, duration });
      loadData();
      setIsAddExamOpen(false);
      setSelectedItem(newExam);
      setIsQuestionsManagerOpen(true);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الامتحان بنجاح، يمكنك الآن إضافة الأسئلة",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الامتحان",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExam = (examId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الامتحان؟")) {
      try {
        deleteExam(examId);
        loadData();
        toast({
          title: "تم بنجاح",
          description: "تم حذف الامتحان بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف الامتحان",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        deleteUser(userId);
        loadData();
        toast({
          title: "تم بنجاح",
          description: "تم حذف المستخدم بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف المستخدم",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('contentTitle') as string;
    const subjectId = formData.get('contentSubject') as string;
    const type = formData.get('contentType') as string;
    const file = formData.get('contentFile') as File;

    if (!title || !subjectId || !type || !file) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول واختيار ملف",
        variant: "destructive",
      });
      return;
    }

    try {
      saveContent({ 
        title, 
        subjectId, 
        type: type as any, 
        filePath: file.name 
      });
      loadData();
      setIsAddContentOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المحتوى بنجاح",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المحتوى",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = (contentId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
      try {
        deleteContent(contentId);
        loadData();
        toast({
          title: "تم بنجاح",
          description: "تم حذف المحتوى بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف المحتوى",
          variant: "destructive",
        });
      }
    }
  };

  const handleQuestionsUpdate = (questions: any[]) => {
    if (selectedItem) {
      updateExam(selectedItem.id, { questions });
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="subjects">إدارة المواد</TabsTrigger>
            <TabsTrigger value="exams">إدارة الامتحانات</TabsTrigger>
            <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
            <TabsTrigger value="content">إدارة المحتوى</TabsTrigger>
            <TabsTrigger value="codes">إدارة الأكواد</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="subscription-types">أنواع الاشتراكات</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="mt-6">
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>إدارة المواد</CardTitle>
                <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover-scale">
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة مادة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة مادة جديدة</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSubject} className="space-y-4">
                      <div>
                        <Label htmlFor="subjectName">اسم المادة</Label>
                        <Input id="subjectName" name="subjectName" placeholder="مثال: الفيزياء" required />
                      </div>
                      <div>
                        <Label htmlFor="subjectDescription">وصف المادة</Label>
                        <Input id="subjectDescription" name="subjectDescription" placeholder="وصف مختصر للمادة" />
                      </div>
                      <div>
                        <Label>الشعب المستهدفة</Label>
                        <div className="space-y-2 mt-2">
                          {[
                            { value: "science_sciences", label: "علمي علوم" },
                            { value: "science_math", label: "علمي رياضة" },
                            { value: "science_sciences_math", label: "علمي علوم ورياضة" },
                            { value: "arts", label: "أدبي" },
                            { value: "all_sections", label: "جميع الشعب" }
                          ].map((section) => (
                            <label key={section.value} className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                name="subjectSections" 
                                value={section.value}
                                className="ml-2"
                              />
                              <span>{section.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <Button type="submit" className="w-full">إضافة المادة</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المادة</TableHead>
                      <TableHead>الشعب</TableHead>
                      <TableHead>عدد الطلاب</TableHead>
                      <TableHead>عدد الامتحانات</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {subject.sections.map((section: string) => (
                              <Badge key={section} className="text-xs">
                                {getSectionName(section)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{subject.studentsCount}</TableCell>
                        <TableCell>{subject.examsCount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(subject);
                                setIsEditSubjectOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteSubject(subject.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {subjects.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">لا توجد مواد مضافة بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="mt-6">
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>إدارة الامتحانات</CardTitle>
                <Dialog open={isAddExamOpen} onOpenChange={setIsAddExamOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover-scale">
                      <Plus className="w-4 h-4 mr-2" />
                      إنشاء امتحان جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إنشاء امتحان جديد</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddExam} className="space-y-4">
                      <div>
                        <Label htmlFor="examTitle">عنوان الامتحان</Label>
                        <Input id="examTitle" name="examTitle" placeholder="مثال: امتحان الفيزياء - الوحدة الأولى" required />
                      </div>
                      <div>
                        <Label htmlFor="examSubject">المادة</Label>
                        <Select name="examSubject" required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المادة" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.name}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="questionsCount">عدد الأسئلة</Label>
                        <Input id="questionsCount" name="questionsCount" type="number" placeholder="20" required />
                      </div>
                      <div>
                        <Label htmlFor="duration">المدة (بالدقائق)</Label>
                        <Input id="duration" name="duration" type="number" placeholder="60" required />
                      </div>
                      <Button type="submit" className="w-full">إنشاء الامتحان</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>عنوان الامتحان</TableHead>
                      <TableHead>المادة</TableHead>
                      <TableHead>عدد الأسئلة</TableHead>
                      <TableHead>المدة (دقيقة)</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>{exam.subject}</TableCell>
                        <TableCell>
                          {exam.questions?.length || 0} / {exam.questionsCount}
                        </TableCell>
                        <TableCell>{exam.duration}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(exam);
                                setIsQuestionsManagerOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteExam(exam.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {exams.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">لا توجد امتحانات مضافة بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>تاريخ الميلاد</TableHead>
                      <TableHead>المحافظة</TableHead>
                      <TableHead>المركز</TableHead>
                      <TableHead>القسم</TableHead>
                      <TableHead>الشعبة</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>تاريخ الانضمام</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.birthdate}</TableCell>
                        <TableCell>{user.governorate}</TableCell>
                        <TableCell>{user.center}</TableCell>
                        <TableCell>{user.district}</TableCell>
                        <TableCell>
                          <Badge>{getSectionName(user.section)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.gender === 'male' ? 'default' : 'secondary'}>
                            {user.gender === 'male' ? 'ذكر' : 'أنثى'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsUserDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">لا يوجد مستخدمين مسجلين بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>إدارة المحتوى</CardTitle>
                <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover-scale">
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة محتوى جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة محتوى جديد</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddContent} className="space-y-4">
                      <div>
                        <Label htmlFor="contentTitle">عنوان المحتوى</Label>
                        <Input id="contentTitle" name="contentTitle" placeholder="مثال: شرح الوحدة الأولى" required />
                      </div>
                      <div>
                        <Label htmlFor="contentSubject">المادة</Label>
                        <Select name="contentSubject" required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المادة" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contentType">نوع المحتوى</Label>
                        <Select name="contentType" required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع المحتوى" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">ملف PDF</SelectItem>
                            <SelectItem value="video">فيديو</SelectItem>
                            <SelectItem value="document">مستند</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contentFile">الملف</Label>
                        <Input id="contentFile" name="contentFile" type="file" accept=".pdf,.mp4,.doc,.docx" required />
                      </div>
                      <Button type="submit" className="w-full">إضافة المحتوى</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>عنوان المحتوى</TableHead>
                      <TableHead>المادة</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>تاريخ الرفع</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">{content.title}</TableCell>
                        <TableCell>
                          {subjects.find(s => s.id === content.subjectId)?.name || 'غير محدد'}
                        </TableCell>
                        <TableCell>
                          <Badge>
                            {content.type === 'pdf' ? 'PDF' : content.type === 'video' ? 'فيديو' : 'مستند'}
                          </Badge>
                        </TableCell>
                        <TableCell>{content.uploadDate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteContent(content.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {contents.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد محتوى حتى الآن</h3>
                    <p className="text-gray-600">ابدأ بإضافة محتوى تعليمي للمواد المختلفة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes" className="mt-6">
            <CodesManagement />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationsManager />
          </TabsContent>

          <TabsContent value="subscription-types">
            <SubscriptionTypesManager />
          </TabsContent>
        </Tabs>

        {/* Edit Subject Dialog */}
        <Dialog open={isEditSubjectOpen} onOpenChange={setIsEditSubjectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل المادة</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <form onSubmit={handleEditSubject} className="space-y-4">
                <div>
                  <Label htmlFor="editSubjectName">اسم المادة</Label>
                  <Input 
                    id="editSubjectName" 
                    name="subjectName" 
                    defaultValue={selectedItem.name}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="editSubjectDescription">وصف المادة</Label>
                  <Input 
                    id="editSubjectDescription" 
                    name="subjectDescription" 
                    defaultValue={selectedItem.description}
                  />
                </div>
                <div>
                  <Label>الشعب المستهدفة</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: "science_sciences", label: "علمي علوم" },
                      { value: "science_math", label: "علمي رياضة" },
                      { value: "science_sciences_math", label: "علمي علوم ورياضة" },
                      { value: "arts", label: "أدبي" },
                      { value: "all_sections", label: "جميع الشعب" }
                    ].map((section) => (
                      <label key={section.value} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          name="subjectSections" 
                          value={section.value}
                          defaultChecked={selectedItem.sections?.includes(section.value)}
                          className="ml-2"
                        />
                        <span>{section.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full">تحديث المادة</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Questions Manager Dialog */}
        <Dialog open={isQuestionsManagerOpen} onOpenChange={setIsQuestionsManagerOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>إدارة أسئلة الامتحان</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <ExamQuestionsManager
                examId={selectedItem.id}
                questionsCount={selectedItem.questionsCount}
                onComplete={() => {
                  setIsQuestionsManagerOpen(false);
                  setSelectedItem(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* User Details Modal */}
        <UserDetailsModal
          user={selectedUser}
          isOpen={isUserDetailsOpen}
          onClose={() => {
            setIsUserDetailsOpen(false);
            setSelectedUser(null);
          }}
        />
      </div>
    </div>
  );
};

export default Admin;
