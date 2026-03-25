
import React from "react";
import { useI18n } from "../i18n";

const Student3D = () => {
  const { t } = useI18n();

  return (
    <div className="relative flex justify-center items-end min-h-[330px] sm:min-h-[380px] select-none mx-auto">
      {/* Glowing border */}
      <div className="absolute z-0 -inset-6 bg-gradient-to-br from-blue-300/40 via-fuchsia-100/80 to-purple-200/60 dark:from-blue-900/60 dark:via-fuchsia-800 dark:to-purple-950 blur-2xl rounded-[40px]" />
      {/* Glassy Card */}
      <div className="relative z-10 rounded-[32px] bg-white/80 dark:bg-background/80 shadow-2xl ring-2 ring-blue-100 dark:ring-purple-900/60 p-1.5 md:p-2 backdrop-blur-xl w-[240px] h-[285px] sm:w-[330px] sm:h-[320px] flex flex-col items-center justify-end animate-scale-in">
        <div className="w-full h-full relative rounded-[28px] overflow-hidden bg-gradient-to-b from-indigo-200/30 via-white/60 to-fuchsia-200/20 flex items-center justify-center">
          {/* صورة لطالب أمام لابتوب */}
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=360&q=80"
            alt="طالب يستخدم لابتوب"
            className="w-full h-full object-cover rounded-[28px] shadow-xl"
            style={{ objectPosition: "center" }}
            draggable={false}
          />
        </div>
        {/* التعليق */}
        <span className="
          absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-background/95 px-6 py-2 rounded-xl 
          text-primary dark:text-white text-sm font-bold shadow ring-1 ring-purple-200
          animate-fade-in backdrop-blur-xl border dark:border-purple-900 select-text
        ">
          {t("interactive_3d")}
        </span>
      </div>
    </div>
  );
};

export default Student3D;
