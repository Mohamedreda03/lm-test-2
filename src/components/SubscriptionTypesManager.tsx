
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, DollarSign, Calendar, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getSubscriptionTypes,
  saveSubscriptionType,
  updateSubscriptionType,
  deleteSubscriptionType,
  type SubscriptionType
} from "@/lib/subscriptionTypes";

const SubscriptionTypesManager = () => {
  const [types, setTypes] = useState<SubscriptionType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<SubscriptionType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    features: "",
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = () => {
    const allTypes = getSubscriptionTypes();
    setTypes(allTypes);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      duration: "",
      features: "",
      isActive: true
    });
    setEditingType(null);
  };

  const handleOpenDialog = (type?: SubscriptionType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        price: type.price.toString(),
        duration: type.duration.toString(),
        features: type.features.join('\n'),
        isActive: type.isActive
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const typeData = {
      name: formData.name,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      features: formData.features.split('\n').filter(f => f.trim()),
      isActive: formData.isActive
    };

    try {
      if (editingType) {
        updateSubscriptionType(editingType.id, typeData);
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث نوع الاشتراك بنجاح",
        });
      } else {
        saveSubscriptionType(typeData);
        toast({
          title: "تم الإنشاء بنجاح",
          description: "تم إنشاء نوع اشتراك جديد بنجاح",
        });
      }
      
      loadTypes();
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (typeId: string) => {
    try {
      deleteSubscriptionType(typeId);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف نوع الاشتراك بنجاح",
      });
      loadTypes();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف نوع الاشتراك",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = (type: SubscriptionType) => {
    updateSubscriptionType(type.id, { isActive: !type.isActive });
    loadTypes();
    toast({
      title: "تم التحديث",
      description: `تم ${type.isActive ? 'إلغاء تفعيل' : 'تفعيل'} نوع الاشتراك`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Star className="w-6 h-6 ml-2" />
          إدارة أنواع الاشتراكات
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة نوع جديد
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'تعديل نوع الاشتراك' : 'إضافة نوع اشتراك جديد'}
              </DialogTitle>
              <DialogDescription>
                قم بتعبئة البيانات المطلوبة لإنشاء نوع اشتراك جديد
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم نوع الاشتراك</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: اشتراك شهري"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">السعر (جنيه)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="50"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="duration">المدة (بالأيام)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="30"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="features">المميزات (كل مميزة في سطر)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="الوصول لجميع المواد&#10;امتحانات غير محدودة&#10;دعم فني"
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">نشط</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingType ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {types.map((type) => (
          <Card key={type.id} className={!type.isActive ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  {!type.isActive && <Badge variant="secondary">غير نشط</Badge>}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(type)}
                  >
                    <Switch checked={type.isActive} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(type)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف نوع الاشتراك "{type.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(type.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-green-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{type.price} جنيه</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-blue-600">
                    <Calendar className="w-4 h-4" />
                    <span>{type.duration} يوم</span>
                  </div>
                </div>
                
                {type.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">المميزات:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {type.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {types.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">لا توجد أنواع اشتراكات متاحة</p>
              <p className="text-sm text-gray-500 mt-1">قم بإضافة نوع اشتراك جديد للبدء</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubscriptionTypesManager;
