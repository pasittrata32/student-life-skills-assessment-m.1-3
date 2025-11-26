import React, { useState } from 'react';
import { TEACHERS } from '../constants';
import { Teacher } from '../types';
import { Button } from './Button';
import { School, Lock, User } from 'lucide-react';

interface LoginProps {
  onLogin: (teacher: Teacher) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple credential check based on the prompt: User=Pass
    const teacher = TEACHERS[username];
    
    if (teacher && password === username) {
       onLogin(teacher);
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Username or Password incorrect)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-navy-900 p-6 md:p-8 text-center text-white">
          <div className="flex justify-center mb-4">
             <div className="bg-white/10 p-3 md:p-4 rounded-full">
                <School className="w-10 h-10 md:w-12 md:h-12" />
             </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-sans">โรงเรียนสาธิตอุดมศึกษา</h1>
          <p className="text-navy-200 text-sm mt-2">ระบบประเมินความสามารถในการใช้ทักษะชีวิต</p>
          <p className="text-navy-300 text-xs mt-1">Satit Udomseuksa School Life Skills Assessment</p>
        </div>
        
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none transition-all"
                placeholder="Enter username (e.g., teacherm1a)"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none transition-all"
                placeholder="Enter password"
                required
              />
            </div>

            <Button type="submit" className="w-full py-3">
              เข้าสู่ระบบ (Login)
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
             © 2024 Satit Udomseuksa School. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};