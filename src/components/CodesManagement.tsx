import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { 
  generateExamCodes, 
  getExamCodes, 
  getExams, 
  getContents, 
  assignCodeToUser, 
  getUsers,
  getSubjects
} from "@/lib/localStorage";
import QRCodeGenerator from "./QRCodeGenerator";

const CodesManagement = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCodes(getExamCodes());
    setExams(getExams());
    setContents(getContents());
    setUsers(getUsers());
    setSubjects(getSubjects());
  };

  const handleGenerateCodes = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const count = parseInt(formData.get('count') as string);
    const type = formData.get('type') as 'exam' | 'content';
    const targetId = formData.get('targetId') as string;

    if (!count || !type || !targetId) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the target name for the fourth parameter
      let targetName = '';
      if (type === 'exam') {
        const exam = exams.find(e => e.id === targetId);
        targetName = exam ? exam.title : 'امتحان محذوف';
      } else {
        const content = contents.find(c => c.id === targetId);
        targetName = content ? content.title : 'محتوى محذوف';
      }
      
      generateExamCodes(count, type, targetId, targetName);
      loadData();
      setIsGenerateDialogOpen(false);
      toast({
        title: "تم بنجاح",
        description: `تم إنشاء ${count} كود بنجاح`,
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الأكواد",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCodes = () => {
    if (codes.length === 0) {
      toast({
        title: "تنبيه",
        description: "لا توجد أكواد للتحميل",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for Excel
    const codesData = codes.map((code, index) => {
      const targetName = getTargetName(code);
      const assignedUser = code.assignedUserId ? 
        users.find(u => u.id === code.assignedUserId)?.name || 'مستخدم محذوف' : 
        'غير معين';
      
      return {
        'الرقم': index + 1,
        'الكود': code.code,
        'النوع': code.type === 'exam' ? 'امتحان' : 'محتوى',
        'الهدف': targetName,
        'المستخدم المعين': assignedUser,
        'الحالة': code.isUsed ? 'مستخدم' : 'متاح',
        'تاريخ الإنشاء': code.createdAt || 'غير محدد',
        'تاريخ الاستخدام': code.usedAt || 'لم يستخدم بعد'
      };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(codesData);
    const wb = XLSX.utils.book_new();
    
    // Set column widths
    const colWidths = [
      { wch: 8 },  // الرقم
      { wch: 15 }, // الكود
      { wch: 10 }, // النوع
      { wch: 25 }, // الهدف
      { wch: 20 }, // المستخدم المعين
      { wch: 10 }, // الحالة
      { wch: 15 }, // تاريخ الإنشاء
      { wch: 15 }  // تاريخ الاستخدام
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "الأكواد");
    
    // Generate filename with current date
    const currentDate = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
    const filename = `اكواد_الامتحانات_${currentDate}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
    
    toast({
      title: "تم بنجاح",
      description: "تم تحميل ملف الأكواد بنجاح",
    });
  };

  const handleAssignCode = (codeId: string, userId: string) => {
    try {
      assignCodeToUser(codeId, userId);
      loadData();
      toast({
        title: "تم بنجاح",
        description: "تم تعيين الكود للمستخدم بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تعيين الكود",
        variant: "destructive",
      });
    }
  };

  const getTargetName = (code: any) => {
    if (code.type === 'exam') {
      const exam = exams.find(e => e.id === code.targetId);
      return exam ? exam.title : 'امتحان محذوف';
    } else {
      const content = contents.find(c => c.id === code.targetId);
      return content ? content.title : 'محتوى محذوف';
    }
  };

  const getUsersByTargetSection = (code: any) => {
    if (code.type === 'exam') {
      const exam = exams.find(e => e.id === code.targetId);
      if (!exam) return [];
      const subject = subjects.find(s => s.name === exam.subject);
      if (!subject) return [];
      return users.filter(user => subject.sections.includes(user.section));
    } else {
      const content = contents.find(c => c.id === code.targetId);
      if (!content) return [];
      const subject = subjects.find(s => s.id === content.subjectId);
      if (!subject) return [];
      return users.filter(user => subject.sections.includes(user.section));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            إدارة الأكواد
          </CardTitle>
          <div className="flex space-x-2 space-x-reverse">
            <QRCodeGenerator 
              codes={codes} 
              examTitle="أكواد الامتحانات"
            />
            <Button 
              onClick={handleDownloadCodes}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              disabled={codes.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              تحميل الأكواد
            </Button>
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء أكواد جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-white to-blue-50">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-800">إنشاء أكواد جديدة</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGenerateCodes} className="space-y-4">
                  <div>
                    <Label htmlFor="count" className="text-gray-700 font-medium">عدد الأكواد</Label>
                    <Input 
                      id="count" 
                      name="count" 
                      type="number" 
                      min="1" 
                      placeholder="10" 
                      required 
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-gray-700 font-medium">نوع الكود</Label>
                    <Select name="type" required>
                      <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="اختر نوع الكود" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exam">امتحان</SelectItem>
                        <SelectItem value="content">محتوى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetId" className="text-gray-700 font-medium">الهدف</Label>
                    <Select name="targetId" required>
                      <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="اختر الامتحان أو المحتوى" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={`exam-${exam.id}`} value={exam.id}>
                            امتحان: {exam.title}
                          </SelectItem>
                        ))}
                        {contents.map((content) => (
                          <SelectItem key={`content-${content.id}`} value={content.id}>
                            محتوى: {content.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    إنشاء الأكواد
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                <TableRow>
                  <TableHead className="font-bold text-gray-700">الكود</TableHead>
                  <TableHead className="font-bold text-gray-700">النوع</TableHead>
                  <TableHead className="font-bold text-gray-700">الهدف</TableHead>
                  <TableHead className="font-bold text-gray-700">المستخدم المعين</TableHead>
                  <TableHead className="font-bold text-gray-700">الحالة</TableHead>
                  <TableHead className="font-bold text-gray-700">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code, index) => (
                  <TableRow key={code.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <TableCell className="font-mono font-bold text-blue-600">{code.code}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={code.type === 'exam' ? 'default' : 'secondary'}
                        className={code.type === 'exam' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                      >
                        {code.type === 'exam' ? 'امتحان' : 'محتوى'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{getTargetName(code)}</TableCell>
                    <TableCell>
                      {code.assignedUserId ? 
                        users.find(u => u.id === code.assignedUserId)?.name || 'مستخدم محذوف'
                        : 'غير معين'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={code.isUsed ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                        {code.isUsed ? 'مستخدم' : 'متاح'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!code.assignedUserId && (
                        <Select onValueChange={(userId) => handleAssignCode(code.id, userId)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="اختر مستخدم" />
                          </SelectTrigger>
                          <SelectContent>
                            {getUsersByTargetSection(code).map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {codes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-600 text-lg">لا توجد أكواد مضافة بعد</p>
                <p className="text-gray-500 text-sm mt-2">ابدأ بإنشاء أكواد جديدة للامتحانات والمحتوى</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodesManagement;
