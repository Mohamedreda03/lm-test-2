
// Helper functions for localStorage management
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

// User management
export const saveUser = (user: any) => {
  const users = getFromStorage('shadovate_users', []);
  user.id = Date.now().toString();
  user.role = user.role || 'user';
  users.push(user);
  saveToStorage('shadovate_users', users);
  
  // Initialize subscription for the new user
  initializeUserSubscription(user.id);
  
  return user;
};

export const getUsers = () => {
  return getFromStorage('shadovate_users', []);
};

export const getUserById = (userId: string) => {
  const users = getUsers();
  return users.find((user: any) => user.id === userId);
};

export const getUserByEmail = (email: string) => {
  const users = getUsers();
  return users.find((user: any) => user.email === email);
};

export const findUser = (phone: string, password: string) => {
  const users = getUsers();
  return users.find((user: any) => user.phone === phone && user.password === password);
};

export const checkAdminCredentials = (phone: string, password: string) => {
  // Default admin credentials
  return phone === '01000000000' && password === 'admin123';
};

export const deleteUser = (userId: string) => {
  const users = getUsers();
  const filteredUsers = users.filter((user: any) => user.id !== userId);
  saveToStorage('shadovate_users', filteredUsers);
  return true;
};

export const updateUserPassword = (phone: string, newPassword: string) => {
  const users = getUsers();
  const userIndex = users.findIndex((user: any) => user.phone === phone);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    saveToStorage('shadovate_users', users);
    return true;
  }
  return false;
};

export const markUserAsVerified = (phone: string) => {
  const users = getUsers();
  const userIndex = users.findIndex((user: any) => user.phone === phone);
  if (userIndex !== -1) {
    users[userIndex].isVerified = true;
    saveToStorage('shadovate_users', users);
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem('shadovate_current_user');
};

// User subscription management
const initializeUserSubscription = (userId: string) => {
  const initialSubscription = {
    userId: userId,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    type: 'basic', // Default to basic
    isActive: false,
    daysLeft: 30
  };
  localStorage.setItem(`subscription_${userId}`, JSON.stringify(initialSubscription));
};

export const getUserSubscription = (userId: string) => {
  try {
    const subscription = localStorage.getItem(`subscription_${userId}`);
    if (!subscription) {
      initializeUserSubscription(userId);
      return JSON.parse(localStorage.getItem(`subscription_${userId}`) || '{}');
    }
    
    const parsed = JSON.parse(subscription);
    
    // Calculate days left
    const expiryDate = new Date(parsed.expiryDate);
    const today = new Date();
    const timeLeft = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeLeft / (1000 * 3600 * 24));
    
    return { ...parsed, daysLeft: Math.max(0, daysLeft) };
  } catch (error) {
    console.error(`Error reading subscription for user ${userId}:`, error);
    return { userId: userId, startDate: '', expiryDate: '', type: 'basic', isActive: false, daysLeft: 0 };
  }
};

export const updateUserSubscription = (userId: string, updates: any) => {
  try {
    const subscription = getUserSubscription(userId);
    const updatedSubscription = { ...subscription, ...updates };
    localStorage.setItem(`subscription_${userId}`, JSON.stringify(updatedSubscription));
    return true;
  } catch (error) {
    console.error(`Error updating subscription for user ${userId}:`, error);
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('shadovate_current_user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error reading current user:', error);
    return null;
  }
};

export const setCurrentUser = (user: any) => {
  try {
    localStorage.setItem('shadovate_current_user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

// Payment transactions management
export const savePaymentTransaction = (transaction: {
  userId: string;
  subscriptionId: string;
  amount: number;
  paymentMethod: string;
  paymentDetails: any;
  receiptUrl?: string;
}) => {
  const transactions = getFromStorage('payment_transactions', []);
  const newTransaction = {
    id: Date.now().toString(),
    ...transaction,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  transactions.push(newTransaction);
  saveToStorage('payment_transactions', transactions);
  
  // Notify all admins about new payment
  addNotificationForAllAdmins({
    title: 'طلب دفع جديد',
    message: `طلب تجديد اشتراك جديد بقيمة ${transaction.amount} جنيه`,
    type: 'info'
  });
  
  return newTransaction;
};

export const getPaymentTransactions = () => {
  return getFromStorage('payment_transactions', []);
};

export const updatePaymentTransactionStatus = (transactionId: string, status: 'pending' | 'approved' | 'rejected', adminNotes?: string) => {
  const transactions = getPaymentTransactions();
  const transactionIndex = transactions.findIndex((t: any) => t.id === transactionId);
  
  if (transactionIndex !== -1) {
    transactions[transactionIndex].status = status;
    transactions[transactionIndex].adminNotes = adminNotes;
    transactions[transactionIndex].updatedAt = new Date().toISOString();
    
    saveToStorage('payment_transactions', transactions);
    
    // If approved, update user subscription
    if (status === 'approved') {
      const transaction = transactions[transactionIndex];
      const user = getUserById(transaction.userId);
      
      // Import subscription types from the subscription types file
      const { getSubscriptionTypes } = require('./subscriptionTypes');
      const subscriptionType = getSubscriptionTypes().find((s: any) => s.id === transaction.subscriptionId);
      
      if (user && subscriptionType) {
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(startDate.getDate() + subscriptionType.duration);
        
        updateUserSubscription(user.id, {
          startDate: startDate.toISOString().split('T')[0],
          expiryDate: expiryDate.toISOString().split('T')[0],
          type: 'premium',
          isActive: true
        });
        
        // Notify user about approval
        addNotification(user.id, {
          title: 'تم تفعيل الاشتراك',
          message: `تم تفعيل اشتراكك بنجاح. صالح حتى ${expiryDate.toLocaleDateString('ar-EG')}`,
          type: 'success'
        });
      }
    } else if (status === 'rejected') {
      const transaction = transactions[transactionIndex];
      const user = getUserById(transaction.userId);
      
      if (user) {
        addNotification(user.id, {
          title: 'تم رفض طلب الدفع',
          message: adminNotes || 'تم رفض طلب تجديد الاشتراك. يرجى التواصل مع الدعم الفني.',
          type: 'warning'
        });
      }
    }
    
    return transactions[transactionIndex];
  }
  return null;
};

// Free subscription management
export const grantFreeSubscription = (userId: string, duration: number) => {
  const user = getUserById(userId);
  if (!user) return false;
  
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(startDate.getDate() + duration);
  
  const updated = updateUserSubscription(userId, {
    startDate: startDate.toISOString().split('T')[0],
    expiryDate: expiryDate.toISOString().split('T')[0],
    type: 'free',
    isActive: true
  });
  
  if (updated) {
    // Notify user about free subscription
    addNotification(userId, {
      title: 'تم منحك اشتراك مجاني',
      message: `تم منحك اشتراك مجاني لمدة ${duration} يوم. صالح حتى ${expiryDate.toLocaleDateString('ar-EG')}`,
      type: 'success'
    });
    
    return true;
  }
  
  return false;
};

// Exam management
export const saveExam = (exam: any) => {
  const exams = getFromStorage('shadovate_exams', []);
  exam.id = Date.now().toString();
  exams.push(exam);
  saveToStorage('shadovate_exams', exams);
  return exam;
};

export const getExams = () => {
  return getFromStorage('shadovate_exams', []);
};

export const getExamById = (examId: string) => {
  const exams = getExams();
  return exams.find((exam: any) => exam.id === examId);
};

export const updateExam = (examId: string, updates: any) => {
  const exams = getExams();
  const examIndex = exams.findIndex((exam: any) => exam.id === examId);
  if (examIndex !== -1) {
    exams[examIndex] = { ...exams[examIndex], ...updates };
    saveToStorage('shadovate_exams', exams);
    return exams[examIndex];
  }
  return null;
};

export const deleteExam = (examId: string) => {
  const exams = getExams();
  const filteredExams = exams.filter(exam => exam.id !== examId);
  saveToStorage('shadovate_exams', filteredExams);
  return true;
};

// Subjects management
export const getSubjects = () => {
  return getFromStorage('shadovate_subjects', []);
};

export const saveSubject = (subject: any) => {
  const subjects = getSubjects();
  subject.id = Date.now().toString();
  subjects.push(subject);
  saveToStorage('shadovate_subjects', subjects);
  return subject;
};

export const updateSubject = (subjectId: string, updates: any) => {
  const subjects = getSubjects();
  const subjectIndex = subjects.findIndex((subject: any) => subject.id === subjectId);
  if (subjectIndex !== -1) {
    subjects[subjectIndex] = { ...subjects[subjectIndex], ...updates };
    saveToStorage('shadovate_subjects', subjects);
    return subjects[subjectIndex];
  }
  return null;
};

export const deleteSubject = (subjectId: string) => {
  const subjects = getSubjects();
  const filteredSubjects = subjects.filter(subject => subject.id !== subjectId);
  saveToStorage('shadovate_subjects', filteredSubjects);
  return true;
};

export const getSubjectsByUserSection = (userSection: string) => {
  const subjects = getSubjects();
  return subjects.filter((subject: any) => 
    !subject.section || subject.section === userSection || subject.section === 'all'
  );
};

// Content management
export const getContents = () => {
  return getFromStorage('shadovate_contents', []);
};

export const saveContent = (content: any) => {
  const contents = getContents();
  content.id = Date.now().toString();
  contents.push(content);
  saveToStorage('shadovate_contents', contents);
  return content;
};

export const updateContent = (contentId: string, updates: any) => {
  const contents = getContents();
  const contentIndex = contents.findIndex((content: any) => content.id === contentId);
  if (contentIndex !== -1) {
    contents[contentIndex] = { ...contents[contentIndex], ...updates };
    saveToStorage('shadovate_contents', contents);
    return contents[contentIndex];
  }
  return null;
};

export const deleteContent = (contentId: string) => {
  const contents = getContents();
  const filteredContents = contents.filter(content => content.id !== contentId);
  saveToStorage('shadovate_contents', filteredContents);
  return true;
};

// Exam codes management
export const getExamCodes = () => {
  return getFromStorage('shadovate_exam_codes', []);
};

export const generateExamCodes = (count: number, type: string, targetId: string, assignedUserId?: string) => {
  const codes = getExamCodes();
  const newCodes = [];
  
  for (let i = 0; i < count; i++) {
    const code = {
      id: Date.now().toString() + i,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      type,
      targetId,
      assignedUserId,
      isUsed: false,
      createdAt: new Date().toISOString()
    };
    newCodes.push(code);
    codes.push(code);
  }
  
  saveToStorage('shadovate_exam_codes', codes);
  return newCodes;
};

export const assignCodeToUser = (codeId: string, userId: string) => {
  const codes = getExamCodes();
  const codeIndex = codes.findIndex((code: any) => code.id === codeId);
  if (codeIndex !== -1) {
    codes[codeIndex].assignedUserId = userId;
    saveToStorage('shadovate_exam_codes', codes);
    return true;
  }
  return false;
};

export const markCodeAsUsed = (codeId: string) => {
  const codes = getExamCodes();
  const codeIndex = codes.findIndex((code: any) => code.id === codeId);
  if (codeIndex !== -1) {
    codes[codeIndex].isUsed = true;
    codes[codeIndex].usedAt = new Date().toISOString();
    saveToStorage('shadovate_exam_codes', codes);
    return true;
  }
  return false;
};

// Exam results management
export const saveExamResult = (result: any) => {
  const results = getFromStorage('shadovate_exam_results', []);
  result.id = Date.now().toString();
  result.createdAt = new Date().toISOString();
  results.push(result);
  saveToStorage('shadovate_exam_results', results);
  return result;
};

export const getUserExamResults = (userId: string) => {
  const results = getFromStorage('shadovate_exam_results', []);
  return results.filter((result: any) => result.userId === userId);
};

// Verification codes management
export const generateVerificationCode = (phone: string, email: string, type: string) => {
  const codes = getFromStorage('verification_codes', []);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const verificationCode = {
    id: Date.now().toString(),
    phone,
    email,
    code,
    type,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    isUsed: false,
    createdAt: new Date().toISOString()
  };
  
  codes.push(verificationCode);
  saveToStorage('verification_codes', codes);
  
  console.log(`Verification code for ${phone}: ${code}`);
  
  return verificationCode;
};

export const verifyCode = (phone: string, code: string, type: string) => {
  const codes = getFromStorage('verification_codes', []);
  const verificationCode = codes.find((c: any) => 
    c.phone === phone && 
    c.code === code && 
    c.type === type && 
    !c.isUsed &&
    new Date(c.expiresAt) > new Date()
  );
  
  if (verificationCode) {
    verificationCode.isUsed = true;
    saveToStorage('verification_codes', codes);
    return true;
  }
  
  return false;
};

// Notifications management
export const addNotification = (userId: string, notification: {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success';
}) => {
  const notifications = getNotifications();
  const newNotification = {
    id: Date.now().toString(),
    userId,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info',
    createdAt: new Date().toISOString(),
    read: false
  };
  notifications.push(newNotification);
  localStorage.setItem('notifications', JSON.stringify(notifications));
  return newNotification;
};

export const saveNotification = (notification: {
  title: string;
  message: string;
  userId: string;
  type?: 'info' | 'warning' | 'success';
}) => {
  return addNotification(notification.userId, {
    title: notification.title,
    message: notification.message,
    type: notification.type
  });
};

export const getNotifications = () => {
  try {
    const notifications = localStorage.getItem('notifications');
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error reading notifications:', error);
    return [];
  }
};

export const getUserNotifications = (userId: string) => {
  const notifications = getNotifications();
  return notifications.filter((notification: any) => notification.userId === userId);
};

export const markNotificationAsRead = (notificationId: string) => {
  const notifications = getNotifications();
  const notificationIndex = notifications.findIndex((n: any) => n.id === notificationId);
  if (notificationIndex !== -1) {
    notifications[notificationIndex].read = true;
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return true;
  }
  return false;
};

export const deleteNotification = (notificationId: string) => {
  const notifications = getNotifications();
  const filteredNotifications = notifications.filter((n: any) => n.id !== notificationId);
  localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
  return true;
};

// Helper function to add notification for all admins
const addNotificationForAllAdmins = (notification: {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success';
}) => {
  const users = getFromStorage('shadovate_users', []);
  const admins = users.filter((user: any) => user.role === 'admin');
  
  admins.forEach((admin: any) => {
    addNotification(admin.id, notification);
  });
};

// Statistics and rankings
export const getStatistics = () => {
  const users = getUsers();
  const exams = getExams();
  const results = getFromStorage('shadovate_exam_results', []);
  
  return {
    totalUsers: users.length,
    totalExams: exams.length,
    totalResults: results.length,
    activeSubscriptions: users.filter((user: any) => {
      const subscription = getUserSubscription(user.id);
      return subscription.isActive;
    }).length
  };
};

export const getUserSubjectRankings = (userId: string) => {
  const results = getUserExamResults(userId);
  const subjects = getSubjects();
  
  return subjects.map((subject: any) => {
    const subjectResults = results.filter((result: any) => result.subjectId === subject.id);
    const averageScore = subjectResults.length > 0 
      ? subjectResults.reduce((sum: number, result: any) => sum + result.score, 0) / subjectResults.length
      : 0;
    
    return {
      subject: subject.name,
      averageScore,
      totalExams: subjectResults.length
    };
  });
};

export const getUserOverallRanking = (userId: string) => {
  const allResults = getFromStorage('shadovate_exam_results', []);
  const userResults = allResults.filter((result: any) => result.userId === userId);
  
  if (userResults.length === 0) return { rank: 0, totalUsers: 0, averageScore: 0 };
  
  const userAverageScore = userResults.reduce((sum: number, result: any) => sum + result.score, 0) / userResults.length;
  
  // Calculate ranking among all users
  const users = getUsers();
  const userScores = users.map((user: any) => {
    const results = allResults.filter((result: any) => result.userId === user.id);
    const average = results.length > 0 
      ? results.reduce((sum: number, result: any) => sum + result.score, 0) / results.length
      : 0;
    return { userId: user.id, averageScore: average };
  }).sort((a, b) => b.averageScore - a.averageScore);
  
  const userRank = userScores.findIndex(score => score.userId === userId) + 1;
  
  return {
    rank: userRank,
    totalUsers: users.length,
    averageScore: userAverageScore
  };
};

// User transactions
export const getUserTransactions = (userId: string) => {
  const transactions = getPaymentTransactions();
  return transactions.filter((transaction: any) => transaction.userId === userId);
};

// Excel parsing for questions
export const parseExcelQuestions = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // This is a placeholder for Excel parsing logic
        // In a real implementation, you would use a library like SheetJS
        resolve([]);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
