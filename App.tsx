import React, { useState, useEffect } from 'react';
import { STUDENTS } from './constants';
import { Teacher, Student, AssessmentData } from './types';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { EvaluationForm } from './components/EvaluationForm';
import { loadFromGoogleSheets, saveToGoogleSheets } from './services/sheetService';
import Swal from 'sweetalert2';

function App() {
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [assessments, setAssessments] = useState<Record<number, AssessmentData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize App
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);

      // 1. Load User Session
      const savedAuth = localStorage.getItem('lifeSkills_user');
      if (savedAuth) {
        setCurrentUser(JSON.parse(savedAuth));
      }

      // 2. Load Data (Try Cloud first, then Local)
      const cloudData = await loadFromGoogleSheets();
      if (cloudData) {
        setAssessments(cloudData);
        // Sync cloud data to local storage
        localStorage.setItem('lifeSkills_data', JSON.stringify(cloudData));
      } else {
        // Fallback to local if cloud fails
        const localData = localStorage.getItem('lifeSkills_data');
        if (localData) {
          setAssessments(JSON.parse(localData));
        }
        
        // Show Offline Mode Toast if logged in
        if (savedAuth) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'warning',
            title: 'Offline Mode',
            text: 'ไม่สามารถเชื่อมต่อ Server ได้ (Using local data)',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            customClass: {
              popup: 'rounded-lg shadow-lg border border-orange-100'
            }
          });
        }
      }

      setIsLoading(false);
    };

    initApp();
  }, []);

  const handleLogin = (teacher: Teacher) => {
    setCurrentUser(teacher);
    localStorage.setItem('lifeSkills_user', JSON.stringify(teacher));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentStudent(null);
    localStorage.removeItem('lifeSkills_user');
  };

  const handleSaveAssessment = async (data: AssessmentData) => {
    // 1. Optimistic Update (Update Local State & Storage immediately)
    const newAssessments = {
      ...assessments,
      [data.studentId]: data
    };
    setAssessments(newAssessments);
    localStorage.setItem('lifeSkills_data', JSON.stringify(newAssessments));
    
    // 2. Save to Google Sheets (Background/Async)
    // Find student info to send with assessment
    const studentObj = STUDENTS.find(s => s.id === data.studentId) || currentStudent;
    
    if (studentObj) {
      // Show loading Swal while saving
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        html: 'กรุณารอสักครู่ ระบบกำลังอัปเดตฐานข้อมูล<br/><span class="text-sm text-slate-500">(Syncing with database)</span>',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: 'rounded-2xl shadow-xl'
        }
      });

      const success = await saveToGoogleSheets(studentObj, data);
      
      // Switch back to dashboard
      setCurrentStudent(null);

      if (success) {
        Swal.fire({
          title: 'บันทึกสำเร็จ!',
          text: 'ข้อมูลถูกบันทึกลงในระบบเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง (OK)',
          confirmButtonColor: '#334e68', // navy-700
          timer: 2500,
          timerProgressBar: true,
          customClass: {
            popup: 'rounded-2xl shadow-xl',
            title: 'text-navy-900',
            confirmButton: 'rounded-lg px-6 py-2'
          }
        });
      } else {
        Swal.fire({
          title: 'บันทึกในเครื่องเรียบร้อย',
          text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ Cloud ข้อมูลถูกบันทึกไว้ในเครื่องแล้ว\n(Saved locally only, cloud sync failed)',
          icon: 'warning',
          confirmButtonText: 'ตกลง (OK)',
          confirmButtonColor: '#f97316',
          customClass: {
             popup: 'rounded-2xl shadow-xl',
             confirmButton: 'rounded-lg px-6 py-2'
          }
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy-900"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentStudent) {
    return (
      <EvaluationForm
        student={currentStudent}
        teacherName={currentUser.name}
        initialData={assessments[currentStudent.id]}
        onSave={handleSaveAssessment}
        onBack={() => setCurrentStudent(null)}
      />
    );
  }

  return (
    <Dashboard
      teacher={currentUser}
      students={STUDENTS.filter(s => s.room === currentUser.room)}
      assessments={assessments}
      onSelectStudent={setCurrentStudent}
      onLogout={handleLogout}
    />
  );
}

export default App;