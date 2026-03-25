
import { useEffect } from 'react';

const ScreenProtection = () => {
  useEffect(() => {
    // منع لقطة الشاشة والتسجيل
    const preventScreenCapture = () => {
      // منع النقر بالزر الأيمن
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      // منع مفاتيح لقطة الشاشة
      document.addEventListener('keydown', (e) => {
        // منع PrintScreen
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          alert('لقطة الشاشة غير مسموحة في هذا الموقع');
        }
        
        // منع Ctrl+Shift+I (أدوات المطور)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
          alert('أدوات المطور غير مسموحة');
        }
        
        // منع F12 (أدوات المطور)
        if (e.key === 'F12') {
          e.preventDefault();
          alert('أدوات المطور غير مسموحة');
        }
        
        // منع Ctrl+U (عرض المصدر)
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
          alert('عرض مصدر الصفحة غير مسموح');
        }
      });

      // منع السحب والإفلات
      document.addEventListener('dragstart', (e) => {
        e.preventDefault();
      });

      // إخفاء المحتوى عند تبديل التطبيق
      const handleVisibilityChange = () => {
        if (document.hidden) {
          document.body.style.filter = 'blur(10px)';
        } else {
          document.body.style.filter = 'none';
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // تحذير من أدوات المطور
      const detectDevTools = () => {
        const threshold = 160;
        let devtools = {
          open: false,
          orientation: null
        };

        setInterval(() => {
          if (window.outerHeight - window.innerHeight > threshold || 
              window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
              devtools.open = true;
              alert('تم اكتشاف محاولة فتح أدوات المطور. سيتم إغلاق الصفحة.');
              window.location.href = '/';
            }
          } else {
            devtools.open = false;
          }
        }, 500);
      };

      detectDevTools();

      // تنظيف المستمعات عند إزالة المكون
      return () => {
        document.removeEventListener('contextmenu', () => {});
        document.removeEventListener('keydown', () => {});
        document.removeEventListener('dragstart', () => {});
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    };

    preventScreenCapture();
  }, []);

  return null;
};

export default ScreenProtection;
