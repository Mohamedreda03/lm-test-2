
interface SubscriptionType {
  id: string;
  name: string;
  price: number;
  duration: number; // في الأيام
  features: string[];
  isActive: boolean;
  createdAt: string;
}

// Helper functions for subscription types management
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

// Get all subscription types
export const getSubscriptionTypes = (): SubscriptionType[] => {
  const types = getFromStorage('shadovate_subscription_types', []);
  
  // Add default types if none exist
  if (types.length === 0) {
    const defaultTypes = [
      {
        id: '1',
        name: 'اشتراك شهري',
        price: 50,
        duration: 30,
        features: ['الوصول لجميع المواد', 'امتحانات غير محدودة', 'دعم فني'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'اشتراك نصف سنوي',
        price: 250,
        duration: 180,
        features: ['الوصول لجميع المواد', 'امتحانات غير محدودة', 'دعم فني', 'خصم 15%'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'اشتراك سنوي',
        price: 400,
        duration: 365,
        features: ['الوصول لجميع المواد', 'امتحانات غير محدودة', 'دعم فني', 'خصم 35%'],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    saveToStorage('shadovate_subscription_types', defaultTypes);
    return defaultTypes;
  }
  
  return types;
};

// Save new subscription type
export const saveSubscriptionType = (type: Omit<SubscriptionType, 'id' | 'createdAt'>) => {
  const types = getSubscriptionTypes();
  const newType: SubscriptionType = {
    ...type,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  types.push(newType);
  saveToStorage('shadovate_subscription_types', types);
  return newType;
};

// Update subscription type
export const updateSubscriptionType = (typeId: string, updates: Partial<SubscriptionType>) => {
  const types = getSubscriptionTypes();
  const typeIndex = types.findIndex(type => type.id === typeId);
  
  if (typeIndex !== -1) {
    types[typeIndex] = { ...types[typeIndex], ...updates };
    saveToStorage('shadovate_subscription_types', types);
    return types[typeIndex];
  }
  return null;
};

// Delete subscription type
export const deleteSubscriptionType = (typeId: string) => {
  const types = getSubscriptionTypes();
  const filteredTypes = types.filter(type => type.id !== typeId);
  saveToStorage('shadovate_subscription_types', filteredTypes);
  return true;
};

// Get active subscription types
export const getActiveSubscriptionTypes = (): SubscriptionType[] => {
  const types = getSubscriptionTypes();
  return types.filter(type => type.isActive);
};

export type { SubscriptionType };
