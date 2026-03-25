
interface PaymentMethod {
  id: string;
  type: 'vodafone_cash' | 'etisalat_cash' | 'instapay' | 'visa';
  name: string;
  accountNumber: string;
  accountName: string;
  instructions: string;
  fees?: number; // رسوم إضافية بالجنيه
  isActive: boolean;
  createdAt: string;
}

// Helper functions for payment methods management
const getFromStorage = (key: string, defaultValue: any = []) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

// Get all payment methods
export const getPaymentMethods = (): PaymentMethod[] => {
  const methods = getFromStorage('shadovate_payment_methods', []);
  
  // Add default methods if none exist
  if (methods.length === 0) {
    const defaultMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'vodafone_cash',
        name: 'فودافون كاش',
        accountNumber: '01XXXXXXXXX',
        accountName: 'اسم المسؤول',
        instructions: 'أرسل المبلغ إلى الرقم المذكور ثم ارفع صورة الإيصال',
        fees: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'etisalat_cash',
        name: 'اتصالات كاش',
        accountNumber: '01XXXXXXXXX',
        accountName: 'اسم المسؤول',
        instructions: 'أرسل المبلغ إلى الرقم المذكور ثم ارفع صورة الإيصال',
        fees: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'instapay',
        name: 'إنستاباي',
        accountNumber: 'username@instapay',
        accountName: 'اسم المسؤول',
        instructions: 'أرسل المبلغ إلى الحساب المذكور ثم ارفع صورة الإيصال',
        fees: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        type: 'visa',
        name: 'فيزا',
        accountNumber: 'xxxx-xxxx-xxxx-xxxx',
        accountName: 'اسم المسؤول',
        instructions: 'تواصل مع الإدارة للحصول على تفاصيل الدفع بالفيزا',
        fees: 5,
        isActive: false,
        createdAt: new Date().toISOString()
      }
    ];
    
    saveToStorage('shadovate_payment_methods', defaultMethods);
    return defaultMethods;
  }
  
  return methods;
};

// Get active payment methods
export const getActivePaymentMethods = (): PaymentMethod[] => {
  const methods = getPaymentMethods();
  return methods.filter(method => method.isActive);
};

// Save payment method
export const savePaymentMethod = (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
  const methods = getPaymentMethods();
  const newMethod: PaymentMethod = {
    ...method,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  methods.push(newMethod);
  saveToStorage('shadovate_payment_methods', methods);
  return newMethod;
};

// Update payment method
export const updatePaymentMethod = (methodId: string, updates: Partial<PaymentMethod>) => {
  const methods = getPaymentMethods();
  const methodIndex = methods.findIndex(method => method.id === methodId);
  
  if (methodIndex !== -1) {
    methods[methodIndex] = { ...methods[methodIndex], ...updates };
    saveToStorage('shadovate_payment_methods', methods);
    return methods[methodIndex];
  }
  return null;
};

// Get payment method icon
export const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
  switch (type) {
    case 'vodafone_cash': return '📱';
    case 'etisalat_cash': return '💸';
    case 'instapay': return '⚡';
    case 'visa': return '💳';
    default: return '💰';
  }
};

// Get payment method color
export const getPaymentMethodColor = (type: PaymentMethod['type']) => {
  switch (type) {
    case 'vodafone_cash': return 'from-red-500 to-red-600';
    case 'etisalat_cash': return 'from-green-500 to-green-600';
    case 'instapay': return 'from-purple-500 to-purple-600';
    case 'visa': return 'from-blue-500 to-blue-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

export type { PaymentMethod };
