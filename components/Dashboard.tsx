
import React from 'react';
import { Student, Teacher, AssessmentData } from '../types';
import { Button } from './Button';
import { User, FileSpreadsheet, LogOut, ChevronRight, CheckCircle, Edit, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { INDICATORS } from '../constants';
import Swal from 'sweetalert2';

interface DashboardProps {
  teacher: Teacher;
  students: Student[];
  assessments: Record<number, AssessmentData>;
  onSelectStudent: (student: Student) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  teacher, 
  students, 
  assessments, 
  onSelectStudent, 
  onLogout 
}) => {

  const completedCount = students.filter(s => assessments[s.id]).length;
  const totalCount = students.length;
  const pendingCount = totalCount - completedCount;

  const handleExport = () => {
    const data = students.map(s => {
      const assessment = assessments[s.id];
      const row: any = {
        'เลขที่': s.no,
        'ชื่อ-สกุล': `${s.prefix} ${s.firstName} ${s.lastName}`,
      };

      let totalScore = 0;

      if (assessment) {
        INDICATORS.forEach(ind => {
           ind.questions.forEach(q => {
              const score = assessment.scores[q.id] || 0;
              row[`ข้อ ${q.id}`] = score;
              totalScore += score;
           });
        });
        
        // Logic: Max score is 90 (30 questions * 3)
        const percent = (totalScore / 90) * 100;
        row['คะแนนรวม (90)'] = totalScore;
        row['ร้อยละ (%)'] = percent.toFixed(2);
        row['จุดเด่น'] = assessment.comments.strength;
        row['จุดที่ควรพัฒนา'] = assessment.comments.development;
        row['สถานะ'] = 'ประเมินแล้ว';
      } else {
        INDICATORS.forEach(ind => {
            ind.questions.forEach(q => {
               row[`ข้อ ${q.id}`] = "-";
            });
         });
        row['คะแนนรวม (90)'] = "-";
        row['ร้อยละ (%)'] = "-";
        row['สถานะ'] = 'ยังไม่ประเมิน';
      }
      
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AssessmentResults");
    XLSX.writeFile(wb, `LifeSkills_Class_${teacher.room}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'ส่งออกข้อมูลสำเร็จ',
      text: `ไฟล์ LifeSkills_Class_${teacher.room}.xlsx ถูกดาวน์โหลดเรียบร้อยแล้ว`,
      confirmButtonText: 'ตกลง (OK)',
      confirmButtonColor: '#334e68',
      customClass: {
         popup: 'rounded-2xl shadow-xl',
         confirmButton: 'rounded-lg px-6 py-2'
      }
    });
  };

  const getRoomLabel = (room: string) => {
     const map: Record<string, string> = {
        'm1a': 'มัธยมศึกษาปีที่ 1/A',
        'm1b': 'มัธยมศึกษาปีที่ 1/B',
        'm2a': 'มัธยมศึกษาปีที่ 2/A',
        'm3a': 'มัธยมศึกษาปีที่ 3/A',
     };
     return map[room] || room;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-navy-900 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:justify-between items-center gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
             <h1 className="text-xl md:text-2xl font-bold tracking-tight">ระบบประเมินทักษะชีวิต</h1>
             <div className="flex flex-wrap justify-center md:justify-start gap-3 text-navy-200 text-sm mt-1 font-medium">
                <span className="flex items-center gap-1"><User className="w-4 h-4"/> ครูประจำชั้น: {teacher.name}</span>
                <span className="hidden md:inline text-navy-600">|</span>
                <span className="bg-navy-800 px-3 py-0.5 rounded text-xs text-white border border-navy-700">ชั้น: {getRoomLabel(teacher.room)}</span>
             </div>
          </div>
          <Button variant="secondary" onClick={onLogout} className="!text-xs !px-4 !py-2 w-full md:w-auto shadow-sm">
             <LogOut className="w-3 h-3" /> ออกจากระบบ
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           
           {/* Total Students */}
           <div className="bg-white rounded-xl shadow-sm p-6 border-l-[6px] border-navy-900 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                 <User className="w-8 h-8" />
              </div>
              <div>
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">นักเรียนทั้งหมด</p>
                 <p className="text-3xl font-bold text-navy-900 mt-1">{totalCount} <span className="text-base font-normal text-slate-400">คน</span></p>
              </div>
           </div>

           {/* Completed */}
           <div className="bg-white rounded-xl shadow-sm p-6 border-l-[6px] border-green-500 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                 <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">ประเมินแล้ว</p>
                 <p className="text-3xl font-bold text-navy-900 mt-1">{completedCount} <span className="text-base font-normal text-slate-400">คน</span></p>
              </div>
           </div>

           {/* Pending */}
           <div className="bg-white rounded-xl shadow-sm p-6 border-l-[6px] border-orange-500 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                 <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">รอการประเมิน</p>
                 <p className="text-3xl font-bold text-navy-900 mt-1">{pendingCount} <span className="text-base font-normal text-slate-400">คน</span></p>
              </div>
           </div>

        </div>
        
        {/* List Header & Export */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-3 self-start md:self-center">
                <User className="w-6 h-6 text-navy-500" />
                รายชื่อนักเรียน
                <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full ml-2">{students.length} คน</span>
            </h2>
            <Button onClick={handleExport} variant="success" className="w-full md:w-auto shadow-sm text-sm px-6">
                 <FileSpreadsheet className="w-4 h-4" /> ส่งออกไฟล์ Excel
            </Button>
        </div>

        {/* Student List - Table View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-navy-50 text-navy-800 text-sm font-bold border-b border-navy-100">
                       <th className="py-5 px-6 text-center w-24 whitespace-nowrap">เลขที่</th>
                       <th className="py-5 px-6 whitespace-nowrap">ชื่อ-นามสกุล</th>
                       <th className="py-5 px-6 whitespace-nowrap">ชั้น</th>
                       <th className="py-5 px-6 whitespace-nowrap text-center">สถานะ</th>
                       <th className="py-5 px-6 whitespace-nowrap text-center">คะแนน (%)</th>
                       <th className="py-5 px-6 whitespace-nowrap text-center">การจัดการ</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {students.map((student) => {
                       const assessment = assessments[student.id];
                       const isDone = !!assessment;
                       
                       let scoreDisplay = "-";
                       if (assessment) {
                          // Fix type inference by specifying parameter types for reduce
                          const totalScore = Object.values(assessment.scores).reduce((a: number, b: number) => a + b, 0);
                          const percent = (totalScore / 90) * 100;
                          scoreDisplay = `${totalScore} (${percent.toFixed(2)}%)`;
                       }

                       return (
                          <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                             <td className="py-4 px-6 text-center text-slate-500 text-sm font-medium group-hover:text-navy-700">{student.no}</td>
                             <td className="py-4 px-6">
                                <div className="font-medium text-slate-800 text-sm group-hover:text-navy-900">
                                   {student.prefix} {student.firstName} {student.lastName}
                                </div>
                             </td>
                             <td className="py-4 px-6 text-slate-600 text-sm whitespace-nowrap">
                                {getRoomLabel(student.room)}
                             </td>
                             <td className="py-4 px-6 text-center">
                                <span className={`
                                   inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm
                                   ${isDone ? 'bg-green-100 text-green-700 ring-1 ring-green-200' : 'bg-orange-50 text-orange-600 ring-1 ring-orange-200'}
                                `}>
                                   {isDone ? 'ประเมินแล้ว' : 'รอการประเมิน'}
                                </span>
                             </td>
                             <td className="py-4 px-6 text-center text-sm font-medium text-slate-700">
                                {scoreDisplay}
                             </td>
                             <td className="py-4 px-6 text-center">
                                <Button 
                                   variant={isDone ? 'secondary' : 'primary'}
                                   className={`!py-1.5 !px-4 text-xs font-medium ${isDone ? '!border-slate-300' : 'shadow-md'}`}
                                   onClick={() => onSelectStudent(student)}
                                >
                                   {isDone ? (
                                      <><Edit className="w-3 h-3" /> แก้ไข</>
                                   ) : (
                                      <><ChevronRight className="w-3 h-3" /> ประเมิน</>
                                   )}
                                </Button>
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
           {students.length === 0 && (
               <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                  <User className="w-12 h-12 mb-3 opacity-20" />
                  <p>ไม่พบข้อมูลนักเรียนในชั้นเรียนนี้</p>
               </div>
           )}
        </div>
      </main>
    </div>
  );
};
