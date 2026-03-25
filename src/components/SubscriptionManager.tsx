import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Crown, Users, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUsers, updateUserSubscription, getUserSubscription, grantFreeSubscription } from "@/lib/localStorage";

const SubscriptionManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState({
    startDate: "",
    expiryDate: "",
    type: "premium" as "premium" | "basic" | "free",
    isActive: true
  });
  const [freeDuration, setFreeDuration] = useState(30);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = () => {
    const allUsers = getUsers();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    const subscription = getUserSubscription(user.id);
    setSubscriptionData({
      startDate: subscription.startDate,
      expiryDate: subscription.expiryDate,
      type: subscription.type,
      isActive: subscription.isActive
    });
  };

  const handleUpdateSubscription = () => {
    if (!selectedUser) return;

    if (!subscriptionData.startDate || !subscriptionData.expiryDate) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال تاريخ البداية والنهاية",
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(subscriptionData.startDate);
    const endDate = new Date(subscriptionData.expiryDate);

    if (endDate <= startDate) {
      toast({
        title: "خطأ في التاريخ",
        description: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
        variant: "destructive",
      });
      return;
    }

    const updated = updateUserSubscription(selectedUser.id, subscriptionData);
    
    if (updated) {
      toast({
        title: "تم التحديث بنجاح",
        description: `تم تحديث اشتراك ${selectedUser.name}`,
      });
      loadUsers();
      setSelectedUser(null);
    } else {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث الاشتراك",
        variant: "destructive",
      });
    }
  };

  const handleGrantFreeSubscription = () => {
    if (!selectedUser) return;

    const success = grantFreeSubscription(selectedUser.id, freeDuration);
    
    if (success) {
      toast({
        title: "تم منح الاشتراك المجاني",
        description: `تم منح ${selectedUser.name} اشتراك مجاني لمدة ${freeDuration} يوم`,
      });
      loadUsers();
      setSelectedUser(null);
    } else {
      toast({
        title: "خطأ في منح الاشتراك",
        description: "فشل في منح الاشتراك المجاني",
        variant: "destructive",
      });
    }
  };

  const getSubscriptionStatus = (user: any) => {
    const subscription = getUserSubscription(user.id);
    return subscription;
  };

  const getStatusBadge = (subscription: any) => {
    if (subscription.isActive && subscription.daysLeft > 0) {
      return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
    } else if (subscription.daysLeft <= 0) {
      return <Badge className="bg-red-100 text-red-800">منتهي</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">غير نشط</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Crown className="w-6 h-6 ml-2" />
          إدارة الاشتراكات
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 ml-2" />
              قائمة المستخدمين
            </CardTitle>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث بالاسم أو الهاتف أو البريد الإلكتروني"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => {
                const subscription = getSubscriptionStatus(user);
                return (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedUser?.id === user.id ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(subscription)}
                        <p className="text-xs text-gray-500 mt-1">
                          {subscription.daysLeft} يوم متبقي
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 ml-2" />
              تحديث الاشتراك
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.phone}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>

                {/* Free Subscription Section */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 flex items-center mb-3">
                    <Gift className="w-4 h-4 ml-2" />
                    منح اشتراك مجاني
                  </h4>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label htmlFor="freeDuration">المدة بالأيام</Label>
                      <Input
                        id="freeDuration"
                        type="number"
                        min="1"
                        value={freeDuration}
                        onChange={(e) => setFreeDuration(parseInt(e.target.value) || 30)}
                        placeholder="30"
                      />
                    </div>
                    <Button 
                      onClick={handleGrantFreeSubscription}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      منح مجاني
                    </Button>
                  </div>
                </div>

                {/* Regular Subscription Form */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="startDate">تاريخ بداية الاشتراك</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={subscriptionData.startDate}
                      onChange={(e) => setSubscriptionData(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiryDate">تاريخ انتهاء الاشتراك</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={subscriptionData.expiryDate}
                      onChange={(e) => setSubscriptionData(prev => ({
                        ...prev,
                        expiryDate: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subscriptionType">نوع الاشتراك</Label>
                    <Select
                      value={subscriptionData.type}
                      onValueChange={(value: "premium" | "basic" | "free") => 
                        setSubscriptionData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">مميز</SelectItem>
                        <SelectItem value="basic">أساسي</SelectItem>
                        <SelectItem value="free">مجاني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={subscriptionData.isActive}
                      onChange={(e) => setSubscriptionData(prev => ({
                        ...prev,
                        isActive: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">الاشتراك نشط</Label>
                  </div>
                </div>

                <Button 
                  onClick={handleUpdateSubscription}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  تحديث الاشتراك
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Crown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">اختر مستخدم لتحديث اشتراكه</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManager;
