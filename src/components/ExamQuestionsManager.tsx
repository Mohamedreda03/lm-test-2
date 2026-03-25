
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Check, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateExam, parseExcelQuestions } from "@/lib/localStorage";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ExamQuestionsManagerProps {
  examId: string;
  questionsCount: number;
  onComplete: () => void;
}

const ExamQuestionsManager = ({ examId, questionsCount, onComplete }: ExamQuestionsManagerProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال نص السؤال",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      toast({
        title: "خطأ",
        description: "يجب إدخال جميع الخيارات",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: currentQuestion.question,
      options: [...currentQuestion.options],
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    });

    toast({
      title: "تم إضافة السؤال",
      description: `السؤال ${questions.length + 1} من ${questionsCount}`
    });
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await parseExcelQuestions(file);
      
      // Type guard to ensure result is an array of questions
      let parsedQuestions: Question[] = [];
      if (Array.isArray(result)) {
        parsedQuestions = result.map((item: any) => ({
          id: item.id || Date.now().toString() + Math.random(),
          question: item.question || "",
          options: Array.isArray(item.options) ? item.options : ["", "", "", ""],
          correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
          explanation: item.explanation || ""
        }));
      }
      
      if (parsedQuestions.length > questionsCount) {
        toast({
          title: "تحذير",
          description: `تم العثور على ${parsedQuestions.length} سؤال، سيتم أخذ أول ${questionsCount} أسئلة فقط`,
          variant: "destructive"
        });
      }

      const limitedQuestions = parsedQuestions.slice(0, questionsCount);
      setQuestions(limitedQuestions);
      
      toast({
        title: "تم رفع الأسئلة بنجاح",
        description: `تم إضافة ${limitedQuestions.length} سؤال`
      });
    } catch (error: any) {
      toast({
        title: "خطأ في رفع الملف",
        description: error.message || "حدث خطأ أثناء رفع الملف",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleCompleteExam = () => {
    if (questions.length !== questionsCount) {
      toast({
        title: "الامتحان غير مكتمل",
        description: `يجب إضافة ${questionsCount} أسئلة. تم إضافة ${questions.length} سؤال فقط`,
        variant: "destructive"
      });
      return;
    }

    // Update exam with questions
    const success = updateExam(examId, { questions });
    
    if (success) {
      toast({
        title: "تم إنشاء الامتحان بنجاح",
        description: `تم إضافة ${questions.length} سؤال للامتحان`
      });
      onComplete();
    } else {
      toast({
        title: "خطأ في حفظ الامتحان",
        description: "حدث خطأ أثناء حفظ الأسئلة، حاول مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const progress = (questions.length / questionsCount) * 100;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">إضافة أسئلة الامتحان</h3>
          <Badge variant={questions.length === questionsCount ? "default" : "secondary"}>
            {questions.length}/{questionsCount} أسئلة
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{progress.toFixed(0)}% مكتمل</p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">إضافة يدوية</TabsTrigger>
          <TabsTrigger value="excel">رفع من Excel</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          {/* Manual question input */}
          <Card>
            <CardHeader>
              <CardTitle>إضافة سؤال جديد ({questions.length + 1}/{questionsCount})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">نص السؤال</Label>
                <Textarea
                  id="question"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  placeholder="اكتب السؤال هنا..."
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label>الخيارات</Label>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`الخيار ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label>الإجابة الصحيحة</Label>
                <RadioGroup
                  value={currentQuestion.correctAnswer.toString()}
                  onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswer: parseInt(value) })}
                  className="flex space-x-4 mt-2"
                >
                  {currentQuestion.options.map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                      <Label htmlFor={`answer-${index}`} className="cursor-pointer">
                        {String.fromCharCode(65 + index)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="explanation">شرح الإجابة (اختياري)</Label>
                <Textarea
                  id="explanation"
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                  placeholder="اشرح لماذا هذه الإجابة صحيحة..."
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handleAddQuestion}
                className="w-full"
                disabled={questions.length >= questionsCount}
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة السؤال
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="excel" className="space-y-6">
          {/* Excel upload */}
          <Card>
            <CardHeader>
              <CardTitle>رفع أسئلة من ملف Excel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">اختر ملف Excel</p>
                <p className="text-sm text-gray-600 mb-4">
                  يجب أن يحتوي الملف على الأعمدة التالية: السؤال، الخيار أ، الخيار ب، الخيار ج، الخيار د، رقم الإجابة الصحيحة، الشرح
                </p>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleExcelUpload}
                  disabled={isUploading}
                  className="max-w-xs mx-auto"
                />
                {isUploading && (
                  <div className="flex items-center justify-center mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <span>جاري رفع الملف...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Questions list */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الأسئلة المضافة ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">السؤال {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm mb-2">{question.question}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className={`flex items-center space-x-1 ${optIndex === question.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                        {optIndex === question.correctAnswer && <Check className="w-3 h-3" />}
                        <span>{String.fromCharCode(65 + optIndex)}: {option}</span>
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <p className="text-xs text-gray-600 mt-2 italic">الشرح: {question.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete exam button */}
      {questions.length === questionsCount && (
        <div className="flex justify-center">
          <Button 
            onClick={handleCompleteExam}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Check className="w-5 h-5 mr-2" />
            إنشاء الامتحان نهائياً
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExamQuestionsManager;
