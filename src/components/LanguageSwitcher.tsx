
import { useI18n } from "../i18n";
import { Globe } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const LanguageSwitcher = () => {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-5 h-5 text-blue-600 dark:text-purple-400" />
      <Select value={lang} onValueChange={(v) => setLang(v as "ar" | "en")}>
        <SelectTrigger className="w-32 rtl:pl-6 ltr:pr-6 bg-background font-bold border-blue-300 dark:border-purple-800 text-blue-800 dark:text-white">
          <SelectValue placeholder={t("choose_lang")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ar">{t("arabic")}</SelectItem>
          <SelectItem value="en">{t("english")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
