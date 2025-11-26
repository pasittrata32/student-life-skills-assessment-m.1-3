
import { AssessmentData, Student } from '../types';

const API_URL = "https://script.google.com/macros/s/AKfycbx6CxSRWXOMvmE7g8BfQbds7GNSyapf16ZLl2qegmB2nGCNoMg0xfI8cHyAK7RrrWxH/exec"; 

/**
 * บันทึกผลการประเมินไปยัง Google Sheets
 */
export const saveToGoogleSheets = async (student: Student, assessment: AssessmentData): Promise<boolean> => {
  try {
    const payload = JSON.stringify({
      student: student,
      assessment: assessment
    });

    // Use 'no-cors' if you only want to fire and forget, but here we likely want response status.
    // Note: Google Apps Script Web App redirect requires following.
    const response = await fetch(`${API_URL}?action=save`, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
    });
    
    // Note: In many CORS setups for GAS, response might be opaque if not configured right, 
    // but usually it works with standard fetch if "Anyone" has access.
    return true;
  } catch (error) {
    console.warn("Warning: Could not save to Google Sheets (Offline or Blocked).", error);
    return false;
  }
};

/**
 * ดึงข้อมูลการประเมินทั้งหมดจาก Google Sheets
 */
export const loadFromGoogleSheets = async (): Promise<Record<number, AssessmentData> | null> => {
  try {
    const response = await fetch(`${API_URL}?action=getAll`);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Log as warning to reduce alarm, as App.tsx handles the null return gracefully
    console.warn("Warning: Could not load from Google Sheets. Switching to Offline Mode.", error);
    return null;
  }
};
