
import React, { useState, useEffect } from 'react';
import { Student, AssessmentData } from '../types';
import { INDICATORS } from '../constants';
import { Button } from './Button';
import { ChevronLeft, Save } from 'lucide-react';
import Swal from 'sweetalert2';

interface EvaluationFormProps {
  student: Student;
  teacherName: string;
  initialData?: AssessmentData;
  onSave: (data: AssessmentData) => void;
  onBack: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ 
  student, 
  teacherName,
  initialData, 
  onSave, 
  onBack 
}) => {
  const [scores, setScores] = useState<Record<number, number>>(initialData?.scores || {});
  const [comments, setComments] = useState(initialData?.comments || { strength: '', development: '' });

  // Calculate totals (Max score is now 30 questions * 3 = 90)
  const filledScores = Object.values(scores) as number[];
  const totalScore = filledScores.reduce((a, b) => a + b, 0);
  const answeredCount = Object.keys(scores).length;
  const totalQuestions = 30;
  const maxScore = 90; 
  const percentage = (totalScore / maxScore) * 100;

  const handleScoreChange = (qId: number, val: number) => {
    setScores(prev => ({ ...prev, [qId]: val }));
  };

  const isComplete = () => {
     return answeredCount === totalQuestions;
  };

  const handleSubmit = () => {
    if (!isComplete()) {
       Swal.fire({
         icon: 'warning',
         title: 'ข้อมูลไม่ครบถ้วน',
         text: 'กรุณาประเมินให้ครบทุกข้อ (Please complete all items)',
         confirmButtonText: 'ตกลง (OK)',
         confirmButtonColor: '#f97316', // orange-500
         customClass: {
           popup: 'rounded-2xl',
           confirmButton: 'rounded-lg px-6'
         }
       });
       return;
    }

    const data: AssessmentData = {
      studentId: student.id,
      scores,
      comments,
      teacherName,
      date: new Date().toISOString()
    };
    
    onSave(data);
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 pb-32 md:pb-36">
      
      {/* Page Header */}
      <div className="bg-white py-8 px-4 text-center border-b border-slate-200 shadow-sm">
         <h1 className="text-xl md:text-3xl font-bold text-navy-900 mb-2 tracking-tight">
            แบบประเมินความสามารถในการใช้ทักษะชีวิต
         </h1>
         <h2 className="text-lg md:text-xl font-semibold text-slate-600 mb-2">
            ชั้นมัธยมศึกษาปีที่ 1 – 3
         </h2>
         <p className="text-slate-500 text-sm md:text-base font-medium">
            โรงเรียนสาธิตอุดมศึกษา อ.บางละมุง จ.ชลบุรี
         </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Part 1: Student Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 bg-navy-50/50 flex items-center gap-3">
              <div className="w-1 h-6 bg-navy-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-navy-900">ตอนที่ 1 ข้อมูลทั่วไปของนักเรียน</h3>
           </div>
           <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-y-8 md:gap-x-12">
                 <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                    <span className="font-bold text-slate-700 text-sm md:text-base whitespace-nowrap">ชื่อ-สกุล:</span>
                    <div className="border-b border-dotted border-slate-400 px-2 py-1 md:py-0 text-slate-900 font-medium w-full text-lg">
                       {student.prefix} {student.firstName} {student.lastName}
                    </div>
                 </div>
                 <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                    <span className="font-bold text-slate-700 text-sm md:text-base whitespace-nowrap">โรงเรียน:</span>
                    <div className="border-b border-dotted border-slate-400 px-2 py-1 md:py-0 text-slate-900 font-medium w-full text-lg">
                       โรงเรียนสาธิตอุดมศึกษา
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6 md:flex md:gap-12 col-span-1 md:col-span-2">
                     <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                        <span className="font-bold text-slate-700 text-sm md:text-base whitespace-nowrap">ระดับชั้น:</span>
                        <div className="border-b border-dotted border-slate-400 px-4 py-1 md:py-0 text-center text-lg min-w-[100px]">
                           {student.room.toUpperCase().replace('M', 'ม.')}
                        </div>
                     </div>
                     <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                        <span className="font-bold text-slate-700 text-sm md:text-base whitespace-nowrap">ห้อง:</span>
                        <div className="border-b border-dotted border-slate-400 px-4 py-1 md:py-0 text-center text-lg min-w-[80px]">
                           {student.room.slice(-1).toUpperCase()}
                        </div>
                     </div>
                     <div className="flex flex-col md:flex-row md:items-baseline gap-2 col-span-2 md:col-span-1">
                        <span className="font-bold text-slate-700 text-sm md:text-base whitespace-nowrap">เลขที่:</span>
                        <div className="border-b border-dotted border-slate-400 px-4 py-1 md:py-0 text-center text-lg min-w-[80px]">
                           {student.no}
                        </div>
                     </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 relative overflow-hidden">
           <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-navy-600"></div>
           <h3 className="font-bold text-navy-900 mb-3 text-lg">คำชี้แจง</h3>
           <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              ให้ครูทำเครื่องหมาย ✓ ลงในช่องที่ตรงกับพฤติกรรมของนักเรียน ตามเกณฑ์พิจารณาดังนี้
           </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
              <div className="flex items-center gap-3 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                 <span className="shrink-0 w-3 h-3 bg-green-600 rounded-full"></span>
                 <span className="text-sm"><strong className="text-slate-900">ระดับ 3</strong> = <strong className="text-green-700">เป็นประจำ</strong> (Always)</span>
              </div>
              <div className="flex items-center gap-3 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                 <span className="shrink-0 w-3 h-3 bg-blue-500 rounded-full"></span>
                 <span className="text-sm"><strong className="text-slate-900">ระดับ 2</strong> = <strong className="text-blue-600">บ่อยครั้ง</strong> (Often)</span>
              </div>
              <div className="flex items-center gap-3 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                 <span className="shrink-0 w-3 h-3 bg-orange-500 rounded-full"></span>
                 <span className="text-sm"><strong className="text-slate-900">ระดับ 1</strong> = <strong className="text-orange-600">น้อยครั้ง</strong> (Rarely)</span>
              </div>
              <div className="flex items-center gap-3 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                 <span className="shrink-0 w-3 h-3 bg-red-500 rounded-full"></span>
                 <span className="text-sm"><strong className="text-slate-900">ระดับ 0</strong> = <strong className="text-red-600">ไม่เคย</strong> (Never)</span>
              </div>
           </div>
        </div>

        {/* Part 2: Assessment - Responsive Design */}
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
               <div className="w-1 h-6 bg-navy-600 rounded-full"></div>
               <h3 className="text-lg md:text-xl font-bold text-navy-900">ตอนที่ 2 รายการประเมินความสามารถ</h3>
            </div>
            
            {/* MOBILE VIEW (< 768px): Card Layout */}
            <div className="md:hidden space-y-8">
               {INDICATORS.map((indicator) => (
                  <div key={indicator.id} className="space-y-4">
                     <div className="bg-navy-50 p-4 rounded-xl border border-navy-100 shadow-sm">
                        <h4 className="font-bold text-navy-800 text-base leading-snug">{indicator.title}</h4>
                     </div>
                     {indicator.questions.map((q) => (
                        <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                           <div className="flex justify-between items-start mb-4">
                              <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">
                                 ข้อ {q.id}
                              </span>
                           </div>
                           <p className="text-slate-800 mb-5 text-base font-medium leading-relaxed">
                              {q.text}
                           </p>
                           <div className="grid grid-cols-4 gap-2">
                              {[
                                { val: 3, label: 'เป็นประจำ', color: 'bg-green-50 border-green-200 text-green-700', active: 'bg-green-600 text-white border-green-600' }, 
                                { val: 2, label: 'บ่อยครั้ง', color: 'bg-blue-50 border-blue-200 text-blue-700', active: 'bg-blue-500 text-white border-blue-500' }, 
                                { val: 1, label: 'น้อยครั้ง', color: 'bg-orange-50 border-orange-200 text-orange-700', active: 'bg-orange-500 text-white border-orange-500' }, 
                                { val: 0, label: 'ไม่เคย', color: 'bg-red-50 border-red-200 text-red-700', active: 'bg-red-500 text-white border-red-500' }
                              ].map((option) => (
                                 <label 
                                    key={option.val}
                                    className={`
                                       flex flex-col items-center justify-center py-3 px-1 rounded-lg border cursor-pointer transition-all duration-200
                                       ${scores[q.id] === option.val 
                                          ? `${option.active} shadow-md transform scale-105` 
                                          : `${option.color} hover:opacity-80`}
                                    `}
                                 >
                                    <input 
                                       type="radio" 
                                       name={`mobile-q-${q.id}`}
                                       value={option.val}
                                       checked={scores[q.id] === option.val}
                                       onChange={() => handleScoreChange(q.id, option.val)}
                                       className="sr-only" 
                                    />
                                    <span className="text-xl font-bold leading-none mb-1">{option.val}</span>
                                    <span className="text-[10px] font-medium text-center leading-tight">{option.label}</span>
                                 </label>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               ))}
            </div>

            {/* DESKTOP VIEW (>= 768px): Table Layout */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                     <thead>
                        <tr className="bg-slate-50 text-navy-900 border-b border-slate-200">
                           <th className="py-4 px-6 text-center font-bold w-20 border-r border-slate-200 text-sm">ข้อที่</th>
                           <th className="py-4 px-6 text-left font-bold border-r border-slate-200 text-sm">รายการประเมิน</th>
                           <th className="py-0 w-[420px]">
                              <div className="flex flex-col h-full">
                                 <div className="bg-slate-100 py-2 text-center border-b border-slate-200 text-sm font-bold text-slate-700">
                                    ระดับการปฏิบัติ
                                 </div>
                                 <div className="flex h-full">
                                    <div className="flex-1 py-3 text-center text-xs font-semibold border-r border-slate-200 bg-green-50/50 text-green-700">
                                       เป็นประจำ (3)
                                    </div>
                                    <div className="flex-1 py-3 text-center text-xs font-semibold border-r border-slate-200 bg-blue-50/50 text-blue-700">
                                       บ่อยครั้ง (2)
                                    </div>
                                    <div className="flex-1 py-3 text-center text-xs font-semibold border-r border-slate-200 bg-orange-50/50 text-orange-700">
                                       น้อยครั้ง (1)
                                    </div>
                                    <div className="flex-1 py-3 text-center text-xs font-semibold bg-red-50/50 text-red-700">
                                       ไม่เคย (0)
                                    </div>
                                 </div>
                              </div>
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {INDICATORS.map((indicator) => (
                           <React.Fragment key={indicator.id}>
                              <tr className="bg-[#f1f5f9] border-b border-slate-200">
                                 <td colSpan={3} className="py-3 px-6 font-bold text-navy-800 text-sm">
                                    {indicator.title}
                                 </td>
                              </tr>
                              {indicator.questions.map((q, idx) => (
                                 <tr key={q.id} className="border-b border-slate-100 hover:bg-yellow-50/20 transition-colors">
                                    <td className="py-3 px-6 text-center align-middle text-slate-500 border-r border-slate-100 text-sm">{q.id}</td>
                                    <td className="py-3 px-6 text-slate-700 align-middle border-r border-slate-100 text-sm">{q.text}</td>
                                    <td className="py-3 px-4 align-middle">
                                       <div className="flex h-full items-center">
                                          {[3, 2, 1, 0].map((score) => (
                                             <label key={score} className="flex-1 flex justify-center cursor-pointer group h-full items-center py-1">
                                                <div className={`
                                                   w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                                   ${scores[q.id] === score 
                                                      ? 'border-navy-600 bg-navy-600 text-white scale-110 shadow-sm' 
                                                      : 'border-slate-300 text-transparent hover:border-navy-400'}
                                                `}>
                                                   <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                                <input 
                                                   type="radio" 
                                                   name={`q-${q.id}`}
                                                   value={score}
                                                   checked={scores[q.id] === score}
                                                   onChange={() => handleScoreChange(q.id, score)}
                                                   className="sr-only"
                                                />
                                             </label>
                                          ))}
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </React.Fragment>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-6 gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-navy-600 rounded-full"></div>
                  <h3 className="text-lg md:text-xl font-bold text-navy-900">สรุปผลการประเมิน (Summary)</h3>
               </div>
               <div className="flex gap-4 text-sm w-full md:w-auto">
                  <div className="flex-1 md:flex-none bg-slate-50 border border-slate-100 px-5 py-3 rounded-lg text-center min-w-[140px]">
                     <span className="text-slate-500 text-xs block uppercase tracking-wider mb-1">คะแนนรวม</span>
                     <span className="font-bold text-navy-900 text-xl">{totalScore} / {maxScore}</span>
                  </div>
                  <div className="flex-1 md:flex-none bg-slate-50 border border-slate-100 px-5 py-3 rounded-lg text-center min-w-[140px]">
                     <span className="text-slate-500 text-xs block uppercase tracking-wider mb-1">คิดเป็นร้อยละ</span>
                     <span className="font-bold text-navy-900 text-xl">{percentage.toFixed(2)}%</span>
                  </div>
               </div>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2.5">จุดเด่นของนักเรียน (Strength)</label>
                 <textarea 
                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-200 focus:border-navy-400 outline-none text-sm transition-all shadow-sm"
                    rows={4}
                    value={comments.strength}
                    onChange={e => setComments({...comments, strength: e.target.value})}
                    placeholder="ระบุจุดเด่นของนักเรียน..."
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2.5">จุดที่ควรพัฒนา (Areas for Improvement)</label>
                 <textarea 
                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-200 focus:border-navy-400 outline-none text-sm transition-all shadow-sm"
                    rows={4}
                    value={comments.development}
                    onChange={e => setComments({...comments, development: e.target.value})}
                    placeholder="ระบุสิ่งที่ควรปรับปรุงหรือพัฒนา..."
                 />
              </div>
           </div>

           {/* Teacher Signature */}
           <div className="mt-16 flex justify-end px-4 md:px-10">
              <div className="flex flex-col items-end">
                  <div className="flex items-end gap-3 text-slate-800">
                      <span className="font-bold text-base mb-2">ลงชื่อ:</span>
                      <div className="flex flex-col items-center gap-1">
                         <div className="border-b-2 border-dotted border-slate-400 px-10 min-w-[260px] text-center text-navy-900 font-bold text-lg pb-1">
                            {teacherName}
                         </div>
                      </div>
                      <span className="font-bold text-base mb-2">ครูผู้สอน</span>
                  </div>
              </div>
           </div>

        </div>

      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30 py-4 px-4 safe-area-bottom">
         <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <button 
               onClick={onBack}
               className="flex items-center justify-center gap-2 text-slate-600 hover:text-navy-800 transition-colors font-medium px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm"
            >
               <ChevronLeft className="w-4 h-4" />
               <span className="hidden md:inline">ย้อนกลับ</span>
               <span className="md:hidden">Back</span>
            </button>

            <div className="hidden md:flex flex-col items-end flex-1 mx-12">
               <div className="w-full flex justify-between text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                  <span>ความคืบหน้าการประเมิน</span>
                  <span>{Math.round((answeredCount / totalQuestions) * 100)}% ({answeredCount}/{totalQuestions})</span>
               </div>
               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                     className="h-full bg-gradient-to-r from-navy-500 to-navy-400 transition-all duration-500 ease-out rounded-full"
                     style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  />
               </div>
            </div>
            
            {/* Mobile Progress Text */}
            <div className="md:hidden text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
                {answeredCount} / {totalQuestions}
            </div>

            <Button 
               variant="primary" 
               onClick={handleSubmit} 
               disabled={!isComplete()}
               className="bg-navy-800 hover:bg-navy-700 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-navy-900/20 !font-semibold flex items-center gap-2 flex-1 md:flex-none justify-center text-sm tracking-wide"
            >
               <Save className="w-4 h-4" /> 
               <span>บันทึกผลการประเมิน</span>
            </Button>
         </div>
      </div>
    </div>
  );
};
