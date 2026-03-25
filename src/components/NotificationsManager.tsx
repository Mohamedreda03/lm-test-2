
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUsers, saveNotification, getNotifications, deleteNotification } from "@/lib/localStorage";

const NotificationsManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAddNotificationOpen, setIsAddNotificationOpen] = useState(false);

  useEffect(() => {
    setUsers(getUsers());
    setNotifications(getNotifications());
  }, []);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('notificationTitle') as string;
    const message = formData.get('notificationMessage') as string;
    const userId = formData.get('userId') as string;
    const type = formData.get('notificationType') as 'info' | 'warning' | 'success';

    if (!title || !message || !userId) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      saveNotification({ title, message, userId, type });
      setNotifications(getNotifications());
      setIsAddNotificationOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم إرسال الإشعار بنجاح",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الإشعار",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الإشعار؟")) {
      try {
        deleteNotification(notificationId);
        setNotifications(getNotifications());
        toast({
          title: "تم بنجاح",
          description: "تم حذف الإشعار بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف الإشعار",
          variant: "destructive",
        });
      }
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'مستخدم غير موجود';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'success': return 'نجاح';
      case 'warning': return 'تحذير';
      case 'info': return 'معلومات';
      default: return 'عام';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 ml-2" />
          إدارة الإشعارات
        </CardTitle>
        <Dialog open={isAddNotificationOpen} onOpenChange={setIsAddNotificationOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover-scale">
              <Plus className="w-4 h-4 mr-2" />
              إرسال إشعار جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إرسال إشعار جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <Label htmlFor="notificationTitle">عنوان الإشعار</Label>
                <Input 
                  id="notificationTitle" 
                  name="notificationTitle" 
                  placeholder="مثال: تحديث مهم" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="notificationMessage">نص الإشعار</Label>
                <Textarea 
                  id="notificationMessage" 
                  name="notificationMessage" 
                  placeholder="اكتب نص الإشعار هنا..." 
                  required
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="userId">المستخدم المستهدف</Label>
                <Select name="userId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notificationType">نوع الإشعار</Label>
                <Select name="notificationType" defaultValue="info">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الإشعار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">معلومات</SelectItem>
                    <SelectItem value="success">نجاح</SelectItem>
                    <SelectItem value="warning">تحذير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                إرسال الإشعار
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الرسالة</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>تاريخ الإرسال</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell className="font-medium">{notification.title}</TableCell>
                <TableCell className="max-w-xs truncate">{notification.message}</TableCell>
                <TableCell>{getUserName(notification.userId)}</TableCell>
                <TableCell>
                  <Badge className={getTypeColor(notification.type)}>
                    {getTypeLabel(notification.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(notification.createdAt).toLocaleDateString('ar-EG')}
                </TableCell>
                <TableCell>
                  <Badge variant={notification.read ? "secondary" : "default"}>
                    {notification.read ? "مقروء" : "غير مقروء"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {notifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
            <p className="text-gray-600">ابدأ بإرسال إشعارات للمستخدمين</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsManager;
