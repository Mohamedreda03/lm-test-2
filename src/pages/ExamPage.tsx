import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getExams, 
  getCurrentUser, 
  getExamCodes, 
  saveExamResult
} from "@/lib/localStorage";

const ExamPage = () => {
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const codeId = searchParams.get('code');
  
  const [exam, setExam] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    if (!codeId) {
      navigate('/code-entry');
      return;
    }

    const exams = getExams();
    const foundExam = exams.find(e => e.id === examId);
    
    if (!foundExam) {
      toast({
        title: "امتحان غير موجود",
        description: "الامتحان المطلوب غير موجود",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    setExam(foundExam);
    setAnswers(new Array(foundExam.questions.length).fill(-1));
    setTimeLeft(foundExam.duration * 60); // Convert minutes to seconds
  }, [examId, codeId, navigate, toast]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished && exam) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished && exam) {
      handleFinishExam();
    }
  }, [timeLeft, isFinished, exam]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    if (!exam || !exam.questions) {
      console.error('Exam or questions not available');
      return 0;
    }
    
    let correctAnswers = 0;
    exam.questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / exam.questions.length) * 100);
  };

  const handleFinishExam = () => {
    if (!exam) {
      console.error('Cannot finish exam: exam data not available');
      return;
    }
    
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsFinished(true);
    setShowResults(true);

    // Save exam result
    const currentUser = getCurrentUser();
    if (currentUser) {
      saveExamResult({
        userId: currentUser.id,
        examId: exam.id,
        score: finalScore,
        answers: answers,
        date: new Date().toISOString().split('T')[0],
        duration: `${Math.floor((exam.duration * 60 - timeLeft) / 60)} دقيقة`
      });

      // Mark code as used
      if (codeId) {
        const codes = getExamCodes();
        const codeIndex = codes.findIndex(c => c.id === codeId);
        if (codeIndex !== -1) {
          codes[codeIndex].isUsed = true;
          codes[codeIndex].usedAt = new Date().toISOString();
          localStorage.setItem('shadovate_exam_codes', JSON.stringify(codes));
        }
      }
    }

    toast({
      title: "تم إنهاء الامتحان",
      description: `حصلت على ${finalScore}%`,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الامتحان...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                نتيجة الامتحان
              </CardTitle>
              <div className="text-6xl font-bold mt-4">
                <span className={score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"}>
                  {score}%
                </span>
              </div>
              <Badge className={score >= 80 ? "bg-green-100 text-green-800" : score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                {score >= 80 ? "ممتاز" : score >= 60 ? "جيد" : "يحتاج تحسين"}
              </Badge>
            </CardHeader>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>مراجعة الإجابات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {exam.questions.map((question: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">
                      السؤال {index + 1}: {question.question}
                    </h3>
                    {answers[index] === question.correctAnswer ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {question.options.map((option: string, optionIndex: number) => (
                      <div 
                        key={optionIndex}
                        className={`p-2 rounded ${
                          optionIndex === question.correctAnswer 
                            ? 'bg-green-100 border-green-500 border' 
                            : answers[index] === optionIndex 
                              ? 'bg-red-100 border-red-500 border'
                              : 'bg-gray-50'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm"><strong>التفسير:</strong> {question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              العودة للملف الشخصي
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {exam.title}
                </CardTitle>
                <p className="text-gray-600">السؤال {currentQuestion + 1} من {exam.questions.length}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">الوقت المتبقي</p>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
        </Card>

        {/* Question */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                variant="outline"
              >
                السؤال السابق
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  تم الإجابة على {answers.filter(a => a !== -1).length} من {exam.questions.length} سؤال
                </p>
              </div>

              {currentQuestion === exam.questions.length - 1 ? (
                <Button
                  onClick={handleFinishExam}
                  className="bg-green-600 hover:bg-green-700"
                >
                  إنهاء الامتحان
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  السؤال التالي
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamPage;
