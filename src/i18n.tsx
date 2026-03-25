
import { useState, createContext, useContext, ReactNode } from "react";

type Lang = "ar" | "en";

type I18nContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const translations = {
  ar: {
    smart_education_future: "مستقبل التعليم الذكي",
    shadovate_platform: "منصة الشادوفيت للامتحانات الذكية",
    pro_3d_platform: "منصة 3D احترافية",
    ai_powered: "مدعومة بالذكاء الاصطناعي",
    future_starts_now: "تعليم المستقبل يبدأ الآن",
    desc:
      "اكتشف أقوى منصة عربية تدمج أحدث تقنيات الذكاء الاصطناعي مع رسوم 3D تفاعلية. تلهم الطلاب للتعلم والتفوق عبر تجربة واقعية وساحرة. منصة الشادوفيت تقدم اختبارات متقدمة ومتنوعة، أدوات قوية للمعلمين، وواجهة مستخدم سهلة الاستعمال وبدعم تام للوضع الداكن.",
    start_learning: "ابدأ رحلتك التعليمية",
    interactive_3d: "رسوم 3D تفاعلية | تعليم ذكي وتجربة ممتعة",
    choose_lang: "اختر اللغة",
    arabic: "العربية",
    english: "English"
  },
  en: {
    smart_education_future: "The Future of Smart Education",
    shadovate_platform: "Shadovate Smart Exam Platform",
    pro_3d_platform: "Pro 3D Platform",
    ai_powered: "AI Powered",
    future_starts_now: "The Future of Learning Starts Now",
    desc:
      "Discover the leading Arabic platform that combines cutting-edge AI with interactive 3D visuals. Inspiring students to achieve and excel through an immersive and enchanting experience. Shadovate offers advanced, diverse exams, powerful teacher tools, and an easy-to-use interface with full dark mode support.",
    start_learning: "Start Your Learning Journey",
    interactive_3d: "Interactive 3D Visuals | Smart & Engaging Learning",
    choose_lang: "Choose Language",
    arabic: "العربية",
    english: "English"
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  const t = (key: string) => translations[lang][key] || key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
