
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Student3D from "./Student3D";
import ThemeToggle from "./ThemeToggle";
import { useI18n } from "../i18n";

// مكون مميزات المنصة
const FeaturesSection = () => (
  <section className="py-12 px-3 max-w-4xl mx-auto text-center">
    <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-800 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">مميزات منصتنا</h2>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white/80 dark:bg-gray-900/90 rounded-xl shadow p-6 border border-blue-100 dark:border-gray-700">
        <div className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-300">أسئلة متنوعة ومحاكاة واقعية</div>
        <div className="text-gray-700 dark:text-gray-300 text-sm">تجربة اختبارات إلكترونية تفاعلية تغطي جميع المواد الدراسية ومستويات الفهم.</div>
      </div>
      <div className="bg-white/80 dark:bg-gray-900/90 rounded-xl shadow p-6 border border-purple-100 dark:border-gray-700">
        <div className="font-bold text-lg mb-2 text-purple-800 dark:text-purple-300">واجهة سهلة وبسيطة</div>
        <div className="text-gray-700 dark:text-gray-300 text-sm">تصميم مرن مناسب لكل الأعمار مع دعم كامل للوضع الليلي.</div>
      </div>
      <div className="bg-white/80 dark:bg-gray-900/90 rounded-xl shadow p-6 border border-fuchsia-100 dark:border-gray-700">
        <div className="font-bold text-lg mb-2 text-fuchsia-800 dark:text-fuchsia-300">متابعة أداء الطالب</div>
        <div className="text-gray-700 dark:text-gray-300 text-sm">تقارير مفصلة عن تقدمك، ونصائح لتحسين الأداء الدراسي.</div>
      </div>
    </div>
  </section>
);

// نبذة عن المنصة
const AboutSection = () => (
  <section className="py-10 px-3 max-w-3xl mx-auto text-center">
    <h2 className="text-xl sm:text-2xl font-extrabold text-primary mb-3">عن المنصة</h2>
    <p className="text-gray-600 dark:text-gray-300 text-base">
      شادوفيت تجمع القوة بين الذكاء الاصطناعي وتجربة ثلاثية الأبعاد لتوفير بيئة تعليمية فريدة تسهل على الطلاب والمعلمين التفوق وتحقيق النجاح.
      <br />
      هدفنا مساعدة الجميع للوصول إلى أفضل أداء دراسي باستخدام أحدث التكنولوجيا وأساليب التقييم الذكية.
    </p>
  </section>
);

// قسم آراء الطلاب (مُبسط مع اقتباسات)
const TestimonialsSection = () => (
  <section className="py-12 px-3 max-w-5xl mx-auto">
    <h2 className="text-2xl sm:text-3xl font-black mb-6 text-center bg-gradient-to-r from-fuchsia-700 via-purple-500 to-blue-700 bg-clip-text text-transparent">آراء الطلاب</h2>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-7">
      <blockquote className="bg-white/80 dark:bg-gray-900/80 border-l-4 border-primary rounded-md p-4 shadow">
        <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">سارة محمود</div>
        <p className="text-sm text-gray-700 dark:text-gray-300">"المنصة جعلت المذاكرة ممتعة وسهلة! أحببت الأسئلة التفاعلية."</p>
      </blockquote>
      <blockquote className="bg-white/80 dark:bg-gray-900/80 border-l-4 border-fuchsia-500 rounded-md p-4 shadow">
        <div className="font-bold text-fuchsia-800 dark:text-fuchsia-300 mb-1">محمد علي</div>
        <p className="text-sm text-gray-700 dark:text-gray-300">"أخيرًا وجدت مكان أتابع مستواي فعلاً وأطور نقاط ضعفي."</p>
      </blockquote>
      <blockquote className="bg-white/80 dark:bg-gray-900/80 border-l-4 border-purple-500 rounded-md p-4 shadow">
        <div className="font-bold text-purple-800 dark:text-purple-300 mb-1">مريم أحمد</div>
        <p className="text-sm text-gray-700 dark:text-gray-300">"واجهة المنصة مريحة ومميزة جداً. أنصح كل زملائي."</p>
      </blockquote>
    </div>
  </section>
);

const Hero = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-tr from-blue-50 via-purple-50 to-fuchsia-100 dark:from-gray-900 dark:via-[#181a23] dark:to-[#272851] min-h-screen">
      {/* Navbar بسيط ثابت */}
      <nav className="w-full h-14 flex items-center justify-between px-5 sm:px-12 py-2 shadow-sm bg-white/80 dark:bg-background/90 border-b border-purple-200 dark:border-blue-900">
        <Link to="/" className="text-[1.6rem] md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-fuchsia-600 bg-clip-text text-transparent">Shadovate</Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/auth">
            <button className="bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-900 hover:to-fuchsia-800 text-white text-sm px-5 py-1.5 rounded-lg shadow hover-scale transition-all">
              دخول / تسجيل
            </button>
          </Link>
        </div>
      </nav>

      {/* الهيرو مع الصورة وزر تجربة سريع */}
      <section
        className="flex flex-col-reverse md:flex-row-reverse items-center md:justify-between gap-12 md:gap-20 max-w-6xl mx-auto py-10 sm:py-24 px-4 animate-fade-in"
        dir={lang === "ar" ? "rtl" : "ltr"}
        lang={lang}
      >
        {/* البيانات النصية والدعوة والفائدة */}
        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right space-y-7">
          <h1 className="text-3xl sm:text-5xl font-black leading-snug tracking-tight bg-gradient-to-r from-blue-800 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent drop-shadow-sm animate-fade-in">
            {t("shadovate_platform")}
            <br />
            <span className="text-2xl sm:text-[2rem] font-bold block mt-2">{t("pro_3d_platform")}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mt-0 font-medium max-w-lg animate-fade-in">
            {t("desc")}
          </p>
          {/* زر تسجيل الدخول واضح */}
          <button
            onClick={() => navigate("/auth")}
            className="mt-4 animate-fade-in bg-gradient-to-r from-blue-700 to-fuchsia-700 text-white px-9 py-3 text-lg font-bold rounded-full ring-2 ring-blue-200 hover:ring-fuchsia-400 shadow-xl hover-scale transition-all duration-300 flex items-center gap-1"
            tabIndex={0}
          >
            {t("start_learning")}
            <ArrowRight className={lang === "ar" ? "ml-2 h-5 w-5" : "mr-2 h-5 w-5"} />
          </button>
        </div>
        {/* صورة الطالب ثلاثية الأبعاد */}
        <div className="flex-1 flex justify-center items-center">
          <Student3D />
        </div>
      </section>

      {/* سكشن المميزات */}
      <FeaturesSection />

      {/* نبذة عن المنصة */}
      <AboutSection />

      {/* آراء الطلاب */}
      <TestimonialsSection />

      {/* مساحة فارغة سفلية */}
      <div className="h-12" />
    </div>
  );
};

export default Hero;
