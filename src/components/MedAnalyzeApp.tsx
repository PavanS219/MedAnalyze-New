declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Send, FileText, Activity, AlertCircle, CheckCircle, Loader, Database, Hospital, Calendar, MapPin, Stethoscope, X, ExternalLink, Phone, Mail, Sparkles, TrendingUp, Shield, Zap, ChevronRight, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'https://backend-production-fcea.up.railway.app/';

// Visualization Component
const TestResultsChart = ({ visualization }) => {
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#fbbf24', '#ef4444', '#22c55e'];
  
  // Prepare data for bar chart
  const barChartData = visualization.test_names.map((name, idx) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    value: visualization.test_values[idx],
    normal: visualization.normal_ranges[idx]
  }));
  
  // Prepare data for pie chart (only for tests with numeric values)
  const pieChartData = visualization.test_names.map((name, idx) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value: visualization.test_values[idx]
  })).filter(item => item.value > 0);
  
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          {visualization.patient_name} - Test Results Visualization
        </h4>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
          Report Date: {visualization.report_date} | File: {visualization.report_filename}
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: pieChartData.length > 0 ? '1fr 1fr' : '1fr', gap: '24px' }}>
        {/* Bar Chart */}
        <div>
          <h5 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#374151', marginBottom: '16px', textAlign: 'center' }}>
            Test Values Comparison
          </h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} style={{ fontSize: '0.75rem' }} />
              <YAxis style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
              <Bar dataKey="value" fill="#667eea" name="Patient Value" radius={[8, 8, 0, 0]} />
              {visualization.normal_ranges.some(r => r !== null) && (
                <Bar dataKey="normal" fill="#22c55e" name="Normal Range (Avg)" radius={[8, 8, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Pie Chart - only if we have valid data */}
        {pieChartData.length > 0 && (
          <div>
            <h5 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#374151', marginBottom: '16px', textAlign: 'center' }}>
              Test Distribution
            </h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// Voice Recognition Hook
// Voice Recognition Hook - FIXED VERSION
const useVoiceRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(''); // Add ref to store final transcript

  useEffect(() => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    // Create recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      finalTranscriptRef.current = ''; // Reset ref
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText + ' ';
        } else {
          interimTranscript += transcriptText;
        }
      }

      // Store final transcript in ref
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
      }

      // Update display with either final or interim
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Use the ref value which persists
      const finalText = finalTranscriptRef.current.trim();
      
      if (finalText) {
        onResult(finalText);
      }
      
      // Clear after a small delay
      setTimeout(() => {
        setTranscript('');
        finalTranscriptRef.current = '';
      }, 100);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      }
      setTranscript('');
      finalTranscriptRef.current = '';
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [onResult]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        finalTranscriptRef.current = ''; // Reset before starting
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        alert('Failed to start voice recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Failed to stop recognition:', e);
      }
    }
  };

  return { isListening, transcript, startListening, stopListening };
};
// Animated Background Component
const AnimatedBackground = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite'
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.3), transparent 50%), radial-gradient(circle at 40% 20%, rgba(72, 209, 204, 0.2), transparent 50%)',
      animation: 'pulseGlow 8s ease-in-out infinite'
    }} />
  </div>
);

// Enhanced Comparison Table
const ComparisonTable = ({ tableData }) => {
  if (!tableData || !tableData.headers || !tableData.rows || tableData.rows.length === 0) {
    return null;
  }

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      margin: '20px 0',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            {tableData.headers.map((header, idx) => (
              <th key={idx} style={{
                padding: '16px 20px',
                textAlign: 'left',
                fontWeight: '600',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIdx) => (
            <tr key={rowIdx} style={{
              background: rowIdx % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(249, 250, 251, 0.5)',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid rgba(229, 231, 235, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = rowIdx % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(249, 250, 251, 0.5)';
              e.currentTarget.style.transform = 'scale(1)';
            }}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} style={{
                  padding: '16px 20px',
                  color: cellIdx === 0 ? '#1f2937' : '#4b5563',
                  fontWeight: cellIdx === 0 ? '600' : '400'
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Premium Doctor Card Component
const DoctorCard = ({ doctor, onBook }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-8px)';
    e.currentTarget.style.boxShadow = '0 20px 48px rgba(102, 126, 234, 0.25)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), transparent)',
      borderRadius: '0 0 0 100%'
    }} />
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px', position: 'relative' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}>
            {doctor.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
              {doctor.name}
            </h3>
            <div style={{
              fontSize: '0.875rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '600'
            }}>
              {doctor.specialty}
            </div>
          </div>
        </div>
        
        {doctor.hospital && (
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 0'
          }}>
            <Hospital size={16} style={{ color: '#667eea' }} />
            <span>{doctor.hospital}</span>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '16px' }}>
          {doctor.experience && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '12px'
            }}>
              <Clock size={16} style={{ color: '#667eea' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>
                {doctor.experience}
              </span>
            </div>
          )}
          
          {doctor.rating && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '12px'
            }}>
              <span style={{ fontSize: '1.25rem' }}>⭐</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f59e0b' }}>
                {doctor.rating}
              </span>
            </div>
          )}
        </div>

        {(doctor.phone || doctor.email) && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(229, 231, 235, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {doctor.phone && (
              <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} style={{ color: '#667eea' }} />
                {doctor.phone}
              </div>
            )}
            {doctor.email && (
              <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} style={{ color: '#667eea' }} />
                {doctor.email}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => onBook(doctor)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
        >
          <Calendar size={16} />
          Book Now
        </button>
        
        {doctor.profile_url && doctor.profile_url !== '#' && (
          <a
            href={doctor.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
            }}
          >
            <ExternalLink size={14} />
            Profile
          </a>
        )}
      </div>
    </div>
  </div>
);

// Enhanced Consultation Modal
const ConsultationModal = ({ isOpen, onClose, abnormalTests, patientName }) => {
  const [step, setStep] = useState(1);
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const majorCities = [
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Bangalore', state: 'Karnataka' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Ahmedabad', state: 'Gujarat' }
  ];

  useEffect(() => {
    if (abnormalTests && abnormalTests.length > 0) {
      setSelectedSpecialty(abnormalTests[0].specialty);
    }
  }, [abnormalTests]);

  const handleFindDoctors = async () => {
    if (!city || !state) {
      setError('Please enter both city and state');
      return;
    }

    setLoading(true);
    setError('');
    setDoctors([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/find-doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city.trim(),
          state: state.trim(),
          specialty: selectedSpecialty
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.doctors && data.doctors.length > 0) {
        setDoctors(data.doctors);
        setStep(2);
        setError('');
      } else {
        setError(data.message || `No ${selectedSpecialty} specialists found in ${city}, ${state}. Please try a nearby major city.`);
        setDoctors([]);
      }
    } catch (err) {
      setError(`Failed to find doctors: ${err.message}. Please check your connection and try again.`);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor) => {
    if (doctor.profile_url && doctor.profile_url !== '#') {
      window.open(doctor.profile_url, '_blank');
    } else {
      const message = `Contact ${doctor.name} for appointment:\n\n` +
        `Specialty: ${doctor.specialty}\n` +
        `Hospital: ${doctor.hospital || 'N/A'}\n` +
        (doctor.phone ? `Phone: ${doctor.phone}\n` : '') +
        (doctor.email ? `Email: ${doctor.email}\n` : '') +
        `\nPlease call or visit their clinic to book an appointment.`;
      
      alert(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(40px)',
        borderRadius: '24px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '32px',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.75rem', fontWeight: '700' }}>
              Find Your Specialist
            </h2>
            <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95 }}>
              {step === 1 ? 'Enter your location to discover top specialists' : `${doctors.length} verified specialists found`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          {abnormalTests && abnormalTests.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(251, 146, 60, 0.1))',
              border: '2px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444, #fb923c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertCircle size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#991b1b', fontSize: '1.125rem', fontWeight: '700' }}>
                    Medical Attention Required
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#7f1d1d', lineHeight: '1.6' }}>
                    Our analysis detected abnormal values in your test results. We strongly recommend consulting with a specialist:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {abnormalTests.map((test, idx) => (
                      <div key={idx} style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}>
                        <div style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.95rem', color: '#1f2937' }}>
                          {test.testName}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '6px' }}>
                          Your value: <strong style={{ color: '#ef4444' }}>{test.value}</strong> (Normal: {test.normalRange})
                        </div>
                        <div style={{
                          fontSize: '0.8125rem',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '600',
                          marginTop: '6px'
                        }}>
                          Recommended: {test.specialty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  color: '#374151'
                }}>
                  <MapPin size={18} style={{ color: '#667eea' }} />
                  Your Location
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="City (e.g., Mumbai, Bangalore)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      padding: '16px',
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{
                      padding: '16px',
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                  />
                </div>
                
                <div>
                  <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '12px', fontWeight: '500' }}>
                    Quick select major cities:
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {majorCities.map((loc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCity(loc.city);
                          setState(loc.state);
                        }}
                        style={{
                          padding: '10px 16px',
                          background: city === loc.city ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.8)',
                          color: city === loc.city ? 'white' : '#4b5563',
                          border: city === loc.city ? 'none' : '2px solid rgba(209, 213, 219, 0.5)',
                          borderRadius: '10px',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (city !== loc.city) {
                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                            e.currentTarget.style.borderColor = '#667eea';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (city !== loc.city) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                            e.currentTarget.style.borderColor = 'rgba(209, 213, 219, 0.5)';
                          }
                        }}
                      >
                        {loc.city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  color: '#374151'
                }}>
                  <Stethoscope size={18} style={{ color: '#667eea' }} />
                  Specialist Type
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'rgba(249, 250, 251, 0.8)',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {abnormalTests?.map((test, idx) => (
                    <option key={idx} value={test.specialty}>
                      {test.specialty}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.9))',
                  color: '#dc2626',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.6',
                  border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} />
                    Unable to Find Doctors
                  </div>
                  {error}
                </div>
              )}

              <button
                onClick={handleFindDoctors}
                disabled={loading || !city || !state}
                style={{
                  width: '100%',
                  background: loading || !city || !state ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '18px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading || !city || !state ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '1.0625rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: loading || !city || !state ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading && city && state) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && city && state) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader style={{ animation: 'spin 1s linear infinite' }} size={22} />
                    Finding Specialists...
                  </>
                ) : (
                  <>
                    <Stethoscope size={22} />
                    Find Doctors Near Me
                  </>
                )}
              </button>
            </div>
          )}

          {step === 2 && doctors.length > 0 && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                padding: '20px 24px',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
                    Showing {selectedSpecialty} specialists in
                  </div>
                  <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '1.125rem' }}>
                    {city}, {state}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStep(1);
                    setDoctors([]);
                    setError('');
                  }}
                  style={{
                    background: 'white',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#667eea',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  Change Location
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {doctors.map((doctor, idx) => (
                  <DoctorCard key={idx} doctor={doctor} onBook={handleBookAppointment} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Message Component
const MessageContent = ({ content, tableData, abnormalTests, onConsultationClick }) => {
  const formatContent = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
        }
        return <span key={partIdx}>{part}</span>;
      });
      
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={idx} style={{ marginBottom: '12px', paddingLeft: '8px' }}>
            {formattedLine}
          </div>
        );
      }
      
      if (line.trim().startsWith('- ')) {
        return (
          <div key={idx} style={{ marginBottom: '8px', paddingLeft: '16px' }}>
            {formattedLine}
          </div>
        );
      }
      
      return (
        <div key={idx} style={{ marginBottom: line.trim() ? '8px' : '4px' }}>
          {formattedLine}
        </div>
      );
    });
  };

  if (tableData) {
    return (
      <div>
        <ComparisonTable tableData={tableData} />
        <div style={{ marginTop: '16px', fontSize: '0.9375rem', color: '#374151', lineHeight: '1.7' }}>
          {formatContent(content)}
        </div>
        {abnormalTests && abnormalTests.length > 0 && (
          <button
            onClick={onConsultationClick}
            style={{
              marginTop: '20px',
              background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.9375rem',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
          >
            <Calendar size={20} />
            Book Consultation for Abnormal Results
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ lineHeight: '1.7' }}>
      {formatContent(content)}
      {abnormalTests && abnormalTests.length > 0 && (
        <button
          onClick={onConsultationClick}
          style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9375rem',
            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(239, 68, 68, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
          }}
        >
          <Calendar size={20} />
          Book Consultation for Abnormal Results
        </button>
      )}
    </div>
  );
};

const MediExtractApp = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedReports, setProcessedReports] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [messages, setMessages] = useState<Array<{
    role: string;
    content: string;
    tableData?: any;
    abnormalTests?: any[];
    patientName?: string;
  }>>([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your Medical Report Analytics Assistant. Upload medical reports to get started, then ask me anything about the patient data!"
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [querying, setQuerying] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [visualizations, setVisualizations] = useState([]);
  const [consultationModal, setConsultationModal] = useState({
    isOpen: false,
    abnormalTests: [],
    patientName: ''
  });
    const handleVoiceResult = (transcript) => {
    setCurrentMessage(transcript);
    // Auto-send after voice input
    setTimeout(() => {
      if (transcript.trim() && dbStatus?.exists) {
        handleSendMessage();
      }
    }, 500);
  };

  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition(handleVoiceResult);
  // END OF VOICE RECOGNITION CODE

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/database/status`);
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      console.error('Failed to check database status:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUploadAndProcess = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch(`${API_BASE_URL}/api/process-reports`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setProcessedReports(data.results);
      setVisualizations(data.visualizations || []);
      
      if (data.success) {
        alert(`✅ Successfully processed ${data.successful_count} reports!`);
        checkDatabaseStatus();
        setFiles([]);
      } else {
        alert(`⚠️ Processed with some errors. Check results.`);
      }
    } catch (error) {
      alert(`❌ Error processing reports: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || querying) return;

    const userMessage = currentMessage;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setCurrentMessage('');
    setQuerying(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || null,
        tableData: data.table_data || null,
        isComparison: data.is_comparison || false,
        abnormalTests: data.abnormal_tests || null,
        patientName: data.patient_name || ''
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${error.message}` 
      }]);
    } finally {
      setQuerying(false);
    }
  };

  const handleConsultationClick = (abnormalTests, patientName) => {
    setConsultationModal({
      isOpen: true,
      abnormalTests,
      patientName
    });
  };

  const sampleQueries = [
    { text: "I want comparison based on my two blood reports in tabular form", icon: "📊" },
    { text: "Compare the two reports side by side", icon: "🔄" },
    { text: "Are there any abnormal test results?", icon: "⚠️" },
    { text: "Show me all test results with abnormal values", icon: "🔍" },
    { text: "What medical conditions do these results indicate?", icon: "🏥" },
    { text: "List all blood test results with their ranges", icon: "📋" }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AnimatedBackground />
      
      {/* Premium Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
            }}>
              <Hospital size={32} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '800',
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}>
                MedAnalyze
              </h1>
              <p style={{ fontSize: '0.9375rem', color: '#6b7280', margin: '4px 0 0 0', fontWeight: '500' }}>
                AI-Powered Medical Intelligence Platform
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Shield size={18} style={{ color: '#667eea' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#667eea' }}>
                HIPAA Compliant
              </span>
            </div>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Zap size={18} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#22c55e' }}>
                AI Enhanced
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '380px 1fr', 
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        height: '100%'
      }}>
        {/* Premium Sidebar */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '32px 24px',
          overflowY: 'auto',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            padding: '28px',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#1f2937'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Upload size={18} color="white" />
              </div>
              Upload Reports
            </h3>

            <div style={{
              border: '3px dashed rgba(102, 126, 234, 0.3)',
              borderRadius: '16px',
              padding: '32px 24px',
              textAlign: 'center',
              marginBottom: '20px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'rgba(102, 126, 234, 0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.03)';
              e.currentTarget.style.transform = 'scale(1)';
            }}>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                }}>
                  <FileText size={32} color="white" />
                </div>
                <p style={{ fontSize: '1rem', color: '#1f2937', margin: '0 0 8px 0', fontWeight: '600' }}>
                  {files.length > 0 ? `${files.length} files selected` : 'Drop files or click to upload'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
                  Supports PNG, JPG, JPEG formats and PDF Formats
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div style={{
                marginBottom: '20px',
                fontSize: '0.8125rem',
                color: '#6b7280',
                maxHeight: '120px',
                overflowY: 'auto',
                background: 'rgba(249, 250, 251, 0.6)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                {files.map((file, idx) => (
                  <div key={idx} style={{
                    padding: '8px 12px',
                    borderBottom: idx < files.length - 1 ? '1px solid rgba(229, 231, 235, 0.5)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileText size={14} style={{ color: '#667eea' }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUploadAndProcess}
              disabled={files.length === 0 || processing}
              style={{
                width: '100%',
                background: files.length === 0 || processing ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: files.length === 0 || processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '1rem',
                boxShadow: files.length === 0 || processing ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (files.length > 0 && !processing) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (files.length > 0 && !processing) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {processing ? (
                <>
                  <Loader style={{ animation: 'spin 1s linear infinite' }} size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Process with AI
                </>
              )}
            </button>

            <div style={{ marginTop: '28px', paddingTop: '28px', borderTop: '1px solid rgba(229, 231, 235, 0.3)' }}>
              <h4 style={{
                fontWeight: '700',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1rem',
                color: '#374151'
              }}>
                <Database size={20} style={{ color: '#667eea' }} />
                Database Status
              </h4>
              {dbStatus?.exists ? (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#22c55e',
                    marginBottom: '12px',
                    padding: '12px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '10px'
                  }}>
                    <CheckCircle size={20} />
                    <span style={{ fontSize: '0.9375rem', fontWeight: '600' }}>System Ready</span>
                  </div>
                  <div style={{
                    background: 'rgba(249, 250, 251, 0.6)',
                    borderRadius: '10px',
                    padding: '16px',
                    border: '1px solid rgba(229, 231, 235, 0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Total Reports:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#667eea' }}>{dbStatus.count || 0}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#f59e0b',
                  padding: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '10px'
                }}>
                  <AlertCircle size={20} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: '600' }}>No data available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          position: 'relative'
        }}>
          {/* Premium Tab Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid rgba(229, 231, 235, 0.5)',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)'
          }}>
            {[
              { id: 'chat', label: 'AI Assistant', icon: '🤖' },
              { id: 'summary', label: 'Report Summary', icon: '📊' },
              { id: 'samples', label: 'Sample Queries', icon: '💡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '20px 24px',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  border: 'none',
                  background: activeTab === tab.id ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  color: activeTab === tab.id ? '#667eea' : '#6b7280',
                  borderBottom: activeTab === tab.id ? '3px solid #667eea' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Premium Alert Banner */}
          {dbStatus?.exists && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                }}>
                  <Stethoscope size={20} color="white" />
                </div>
                <span style={{ fontSize: '0.9375rem', color: '#78350f', fontWeight: '600' }}>
                  Need medical advice? Connect with verified specialists instantly
                </span>
              </div>
              <button
                onClick={() => {
                  handleConsultationClick([
                    {
                      testName: 'General Health Check',
                      value: 'Consultation',
                      normalRange: 'N/A',
                      specialty: 'Hematologist'
                    }
                  ], 'Patient');
                }}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                <Calendar size={16} />
                Find Doctors
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' , position: 'relative', minHeight:0}}>
            {activeTab === 'chat' && (
              <div style={{ 
                display: 'grid',
                gridTemplateRows: '1fr auto',
                height: '100%',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {/* Messages Area */}
                <div style={{
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: '32px'
                }}>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '20px',
                        animation: 'slideIn 0.4s ease'
                      }}
                    >
                      <div style={{
                        maxWidth: msg.tableData ? '95%' : '75%',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        background: msg.role === 'user' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : 'rgba(255, 255, 255, 0.95)',
                        color: msg.role === 'user' ? 'white' : '#1f2937',
                        boxShadow: msg.role === 'user' 
                          ? '0 8px 24px rgba(102, 126, 234, 0.3)' 
                          : '0 4px 16px rgba(0, 0, 0, 0.08)',
                        backdropFilter: 'blur(10px)',
                        border: msg.role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
                      }}>
                        <MessageContent 
                          content={msg.content} 
                          tableData={msg.tableData}
                          abnormalTests={msg.abnormalTests}
                          onConsultationClick={() => handleConsultationClick(msg.abnormalTests, msg.patientName)}
                        />
                      </div>
                    </div>
                  ))}
                  {querying && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <Loader style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} size={20} />
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>AI is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar - Fixed at bottom via grid */}
                <div style={{
                  borderTop: '1px solid rgba(229, 231, 235, 0.5)',
                  padding: '20px 32px',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={isListening ? transcript : currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isListening && handleSendMessage()}
                      placeholder={isListening ? "Listening..." : "Ask about medical reports..."}
                      disabled={querying || !dbStatus?.exists || isListening}
                      style={{
                        flex: 1,
                        border: '2px solid rgba(102, 126, 234, 0.2)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: isListening ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '500'
                      }}
                      onFocus={(e) => {
                        if (!isListening) {
                          e.currentTarget.style.borderColor = '#667eea';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    
                    {/* Voice Button */}
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={querying || !dbStatus?.exists}
                      style={{
                        background: isListening 
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                          : 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: querying || !dbStatus?.exists ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '700',
                        boxShadow: querying || !dbStatus?.exists 
                          ? 'none' 
                          : isListening 
                            ? '0 6px 20px rgba(239, 68, 68, 0.4)' 
                            : '0 6px 20px rgba(34, 197, 94, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!querying && dbStatus?.exists) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = isListening 
                            ? '0 8px 28px rgba(239, 68, 68, 0.5)' 
                            : '0 8px 28px rgba(34, 197, 94, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!querying && dbStatus?.exists) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = isListening 
                            ? '0 6px 20px rgba(239, 68, 68, 0.4)' 
                            : '0 6px 20px rgba(34, 197, 94, 0.4)';
                        }
                      }}
                    >
                      {isListening ? (
                        <>
                          <div style={{ 
                            width: '10px', 
                            height: '10px', 
                            background: 'white', 
                            borderRadius: '2px' 
                          }} />
                          Stop
                        </>
                      ) : (
                        <>
                          <div style={{ 
                            width: '16px', 
                            height: '16px', 
                            position: 'relative' 
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '6px',
                              height: '12px',
                              background: 'white',
                              borderRadius: '3px'
                            }} />
                          </div>
                          Voice
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={querying || !currentMessage.trim() || !dbStatus?.exists || isListening}
                      style={{
                        background: querying || !currentMessage.trim() || !dbStatus?.exists || isListening
                          ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' 
                          : 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: querying || !currentMessage.trim() || !dbStatus?.exists || isListening ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '700',
                        boxShadow: querying || !currentMessage.trim() || !dbStatus?.exists || isListening
                          ? 'none' 
                          : '0 6px 20px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!querying && currentMessage.trim() && dbStatus?.exists && !isListening) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 8px 28px rgba(102, 126, 234, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!querying && currentMessage.trim() && dbStatus?.exists && !isListening) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                        }
                      }}
                    >
                      <Send size={20} />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
{activeTab === 'summary' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', color: '#1f2937' }}>
                  Processing Summary
                </h3>
                {processedReports.length > 0 ? (
                  <div>
                    {/* Stats Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '20px',
                      marginBottom: '32px'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0', fontWeight: '600' }}>
                          Total Reports
                        </p>
                        <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
                          {processedReports.length}
                        </p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15))',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0', fontWeight: '600' }}>
                          Successful
                        </p>
                        <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#22c55e', margin: 0 }}>
                          {processedReports.filter(r => r.success).length}
                        </p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 8px 0', fontWeight: '600' }}>
                          Failed
                        </p>
                        <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444', margin: 0 }}>
                          {processedReports.filter(r => !r.success).length}
                        </p>
                      </div>
                    </div>

                    {/* VISUALIZATIONS SECTION */}
                    {visualizations.length > 0 && (
                      <div style={{ marginBottom: '32px' }}>
                        <h4 style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700', 
                          marginBottom: '20px', 
                          color: '#1f2937',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ fontSize: '1.5rem' }}>📊</span>
                          Test Results Visualizations
                        </h4>
                        {visualizations.map((viz, idx) => (
                          <TestResultsChart key={idx} visualization={viz} />
                        ))}
                      </div>
                    )}

                    {/* Report Details Section */}
                    <div>
                      <h4 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700', 
                        marginBottom: '20px', 
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <FileText size={20} style={{ color: '#667eea' }} />
                        Report Details
                      </h4>
                      {processedReports.filter(r => r.success).map((report, idx) => (
                        <details key={idx} style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '16px',
                          marginBottom: '16px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)'}>
                          <summary style={{
                            cursor: 'pointer',
                            padding: '20px 24px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: '#1f2937'
                          }}>
                            <FileText size={20} style={{ color: '#667eea' }} />
                            {report.image_filename}
                          </summary>
                          <div style={{
                            padding: '24px',
                            background: 'rgba(249, 250, 251, 0.5)',
                            borderTop: '1px solid rgba(229, 231, 235, 0.3)'
                          }}>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gap: '24px',
                              fontSize: '0.9375rem'
                            }}>
                              <div style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(229, 231, 235, 0.3)'
                              }}>
                                <p style={{ fontWeight: '700', marginBottom: '12px', color: '#667eea', fontSize: '1rem' }}>
                                  Patient Information
                                </p>
                                <p style={{ marginBottom: '6px' }}>
                                  <strong>Name:</strong> {report.structured_json?.patient_info?.name || 'N/A'}
                                </p>
                                <p style={{ marginBottom: '6px' }}>
                                  <strong>Age:</strong> {report.structured_json?.patient_info?.age || 'N/A'}
                                </p>
                                <p style={{ marginBottom: 0 }}>
                                  <strong>Gender:</strong> {report.structured_json?.patient_info?.gender || 'N/A'}
                                </p>
                              </div>
                              <div style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(229, 231, 235, 0.3)'
                              }}>
                                <p style={{ fontWeight: '700', marginBottom: '12px', color: '#667eea', fontSize: '1rem' }}>
                                  Hospital Information
                                </p>
                                <p style={{ marginBottom: '6px' }}>
                                  <strong>Hospital:</strong> {report.structured_json?.hospital_info?.hospital_name || 'N/A'}
                                </p>
                                <p style={{ marginBottom: '6px' }}>
                                  <strong>Report Type:</strong> {report.structured_json?.report_info?.report_type || 'N/A'}
                                </p>
                                <p style={{ marginBottom: 0 }}>
                                  <strong>Date:</strong> {report.structured_json?.report_info?.report_date || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 40px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '2px dashed rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 24px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={40} style={{ color: '#667eea', opacity: 0.5 }} />
                    </div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
                      No Reports Yet
                    </h4>
                    <p style={{ fontSize: '0.9375rem', color: '#6b7280' }}>
                      Upload medical reports to see your processing summary here
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'samples' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', color: '#1f2937' }}>
                  Try These Sample Queries
                </h3>
                <p style={{ fontSize: '0.9375rem', color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
                  Click on any query below to try it. Our AI will automatically detect abnormal values and offer consultation booking with specialists.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {sampleQueries.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentMessage(query.text);
                        setActiveTab('chat');
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      disabled={!dbStatus?.exists}
                      style={{
                        textAlign: 'left',
                        padding: '24px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '16px',
                        cursor: !dbStatus?.exists ? 'not-allowed' : 'pointer',
                        opacity: !dbStatus?.exists ? 0.5 : 1,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (dbStatus?.exists) {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 28px rgba(102, 126, 234, 0.2)';
                          e.currentTarget.style.borderColor = '#667eea';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (dbStatus?.exists) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        }
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        marginBottom: '16px'
                      }}>
                        {query.icon}
                      </div>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937', fontSize: '0.9375rem', lineHeight: '1.5' }}>
                        {query.text}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#667eea',
                        fontSize: '0.8125rem',
                        fontWeight: '600'
                      }}>
                        <span>Try this query</span>
                        <ChevronRight size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConsultationModal
        isOpen={consultationModal.isOpen}
        onClose={() => setConsultationModal({ isOpen: false, abnormalTests: [], patientName: '' })}
        abnormalTests={consultationModal.abnormalTests}
        patientName={consultationModal.patientName}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        * {
          box-sizing: border-box;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(249, 250, 251, 0.5);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5568d3, #6a3f8f);
        }
      `}</style>
    </div>
  );
};

export default MediExtractApp;
