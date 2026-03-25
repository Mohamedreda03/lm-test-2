import Hero from "@/components/Hero";
import { I18nProvider } from "../i18n";

const Index = () => {
  return (
    <I18nProvider>
      <Hero />
    </I18nProvider>
  );
};

export default Index;
