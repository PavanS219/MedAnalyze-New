declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    handleMapBooking: (index: number) => void;
    google: {
      maps: {
        Map: any;
        Marker: any;
        InfoWindow: any;
        Geocoder: any;
        Point: any;
        Animation: {
          DROP: any;
          BOUNCE: any;
        };
      };
    };
  }
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, Send, FileText, AlertCircle, CheckCircle, Loader,
  Database, Hospital, Calendar, MapPin, Stethoscope, X, ExternalLink,
  Phone, Mail, Sparkles, TrendingUp, Shield, Zap, ChevronRight, Clock,
  Video, Mic, MicOff, VideoOff, PhoneOff, Users, Copy, MessageSquare
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'https://backend1-production-9ae2.up.railway.app';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

const loadGoogleMapsScript = (apiKey) => {
  return new Promise<void>((resolve, reject) => {
    if (window.google && window.google.maps) { resolve(); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// TEST RESULTS CHART
// ─────────────────────────────────────────────────────────────────────────────
const TestResultsChart = ({ visualization }) => {
  const COLORS = ['#667eea','#764ba2','#f093fb','#4facfe','#00f2fe','#fbbf24','#ef4444','#22c55e'];
  const barChartData = visualization.test_names.map((name, idx) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    value: visualization.test_values[idx],
    normal: visualization.normal_ranges[idx]
  }));
  const pieChartData = visualization.test_names.map((name, idx) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value: visualization.test_values[idx]
  })).filter(item => item.value > 0);

  return (
    <div style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:16, padding:24, marginBottom:20, boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom:20 }}>
        <h4 style={{ fontSize:'1.125rem', fontWeight:700, color:'#1f2937', marginBottom:8 }}>
          {visualization.patient_name} - Test Results Visualization
        </h4>
        <p style={{ fontSize:'0.875rem', color:'#6b7280', margin:0 }}>
          Report Date: {visualization.report_date} | File: {visualization.report_filename}
        </p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns: pieChartData.length > 0 ? '1fr 1fr' : '1fr', gap:24 }}>
        <div>
          <h5 style={{ fontSize:'0.9375rem', fontWeight:600, color:'#374151', marginBottom:16, textAlign:'center' }}>Test Values Comparison</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} style={{ fontSize:'0.75rem' }} />
              <YAxis style={{ fontSize:'0.75rem' }} />
              <Tooltip contentStyle={{ background:'rgba(255,255,255,0.95)', border:'1px solid rgba(102,126,234,0.3)', borderRadius:8, fontSize:'0.875rem' }} />
              <Legend wrapperStyle={{ fontSize:'0.875rem' }} />
              <Bar dataKey="value" fill="#667eea" name="Patient Value" radius={[8,8,0,0]} />
              {visualization.normal_ranges.some(r => r !== null) && (
                <Bar dataKey="normal" fill="#22c55e" name="Normal Range (Avg)" radius={[8,8,0,0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {pieChartData.length > 0 && (
          <div>
            <h5 style={{ fontSize:'0.9375rem', fontWeight:600, color:'#374151', marginBottom:16, textAlign:'center' }}>Test Distribution</h5>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieChartData} cx="50%" cy="40%"
                  labelLine={true}
                  label={({ percent, cx, cy, midAngle, outerRadius }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 35;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill="#374151" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize:11, fontWeight:600 }}>
                        {`${(percent * 100).toFixed(1)}%`}
                      </text>
                    );
                  }}
                  outerRadius={100} fill="#8884d8" dataKey="value" minAngle={5}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background:'rgba(255,255,255,0.95)', border:'1px solid rgba(102,126,234,0.3)', borderRadius:8, fontSize:'0.875rem' }} />
                <Legend verticalAlign="bottom" height={80} wrapperStyle={{ fontSize:'0.75rem', paddingTop:20, lineHeight:'1.8' }} formatter={(value) => value} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VOICE RECOGNITION HOOK
// ─────────────────────────────────────────────────────────────────────────────
const useVoiceRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => { setIsListening(true); setTranscript(''); finalTranscriptRef.current = ''; };
    recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + ' ';
        else interim += t;
      }
      if (final) finalTranscriptRef.current += final;
      setTranscript(finalTranscriptRef.current + interim);
    };
    recognition.onend = () => {
      setIsListening(false);
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) onResult(finalText);
      setTimeout(() => { setTranscript(''); finalTranscriptRef.current = ''; }, 100);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') alert('Microphone access denied.');
      else if (event.error === 'no-speech') alert('No speech detected. Please try again.');
      setTranscript(''); finalTranscriptRef.current = '';
    };
    recognitionRef.current = recognition;
    return () => { try { recognitionRef.current?.stop(); } catch (e) {} };
  }, [onResult]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try { finalTranscriptRef.current = ''; recognitionRef.current.start(); }
      catch (e) { alert('Failed to start voice recognition.'); }
    }
  };
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };
  return { isListening, transcript, startListening, stopListening };
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────
const AnimatedBackground = () => (
  <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:-1, background:'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)', backgroundSize:'400% 400%', animation:'gradientShift 15s ease infinite' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'radial-gradient(circle at 20% 50%, rgba(120,119,198,0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(138,43,226,0.3), transparent 50%)', animation:'pulseGlow 8s ease-in-out infinite' }} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON TABLE
// ─────────────────────────────────────────────────────────────────────────────
const ComparisonTable = ({ tableData }) => {
  if (!tableData || !tableData.headers || !tableData.rows || tableData.rows.length === 0) return null;
  return (
    <div style={{ width:'100%', overflowX:'auto', margin:'20px 0', background:'rgba(255,255,255,0.95)', borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.2)' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
        <thead>
          <tr style={{ background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white' }}>
            {tableData.headers.map((h, i) => (
              <th key={i} style={{ padding:'16px 20px', textAlign:'left', fontWeight:600, textTransform:'uppercase', fontSize:'0.75rem', letterSpacing:'0.05em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri%2===0 ? 'rgba(255,255,255,0.5)' : 'rgba(249,250,251,0.5)', borderBottom:'1px solid rgba(229,231,235,0.3)', transition:'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(102,126,234,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background=ri%2===0?'rgba(255,255,255,0.5)':'rgba(249,250,251,0.5)'; }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding:'16px 20px', color: ci===0?'#1f2937':'#4b5563', fontWeight: ci===0?600:400 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR CARD
// ─────────────────────────────────────────────────────────────────────────────
const DoctorCard = ({ doctor, onBook }) => (
  <div style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', borderRadius:20, padding:24, border:'1px solid rgba(255,255,255,0.3)', boxShadow:'0 8px 32px rgba(0,0,0,0.08)', transition:'all 0.4s cubic-bezier(0.4,0,0.2,1)', position:'relative', overflow:'hidden' }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-8px)'; e.currentTarget.style.boxShadow='0 20px 48px rgba(102,126,234,0.25)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.08)'; }}>
    <div style={{ position:'absolute', top:0, right:0, width:100, height:100, background:'linear-gradient(135deg, rgba(102,126,234,0.1), transparent)', borderRadius:'0 0 0 100%' }} />
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', gap:20, position:'relative' }}>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg, #667eea, #764ba2)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:'1.25rem' }}>{doctor.name.charAt(0)}</div>
          <div>
            <h3 style={{ margin:0, fontSize:'1.25rem', fontWeight:700, color:'#1f2937' }}>{doctor.name}</h3>
            <div style={{ fontSize:'0.875rem', background:'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight:600 }}>{doctor.specialty}</div>
          </div>
        </div>
        {doctor.hospital && (
          <div style={{ fontSize:'0.875rem', color:'#6b7280', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
            <Hospital size={16} style={{ color:'#667eea' }} /><span>{doctor.hospital}</span>
          </div>
        )}
        <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginTop:16 }}>
          {doctor.experience && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'rgba(102,126,234,0.1)', borderRadius:12 }}>
              <Clock size={16} style={{ color:'#667eea' }} />
              <span style={{ fontSize:'0.875rem', fontWeight:500, color:'#4b5563' }}>{doctor.experience}</span>
            </div>
          )}
          {doctor.rating && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'rgba(251,191,36,0.1)', borderRadius:12 }}>
              <span style={{ fontSize:'1.25rem' }}>⭐</span>
              <span style={{ fontSize:'0.875rem', fontWeight:600, color:'#f59e0b' }}>{doctor.rating}</span>
            </div>
          )}
        </div>
        {(doctor.phone || doctor.email) && (
          <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid rgba(229,231,235,0.5)', display:'flex', flexDirection:'column', gap:8 }}>
            {doctor.phone && <div style={{ fontSize:'0.875rem', color:'#6b7280', display:'flex', alignItems:'center', gap:8 }}><Phone size={14} style={{ color:'#667eea' }} />{doctor.phone}</div>}
            {doctor.email && <div style={{ fontSize:'0.875rem', color:'#6b7280', display:'flex', alignItems:'center', gap:8 }}><Mail size={14} style={{ color:'#667eea' }} />{doctor.email}</div>}
          </div>
        )}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <button onClick={() => onBook(doctor,'book')}
          style={{ background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white', padding:'12px 24px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.875rem', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 12px rgba(102,126,234,0.4)', transition:'all 0.3s ease' }}>
          <Calendar size={16} />Book Now
        </button>
        <button onClick={() => onBook(doctor,'profile')}
          style={{ background:'rgba(102,126,234,0.1)', color:'#667eea', padding:'12px 24px', borderRadius:12, border:'1px solid rgba(102,126,234,0.3)', cursor:'pointer', fontWeight:600, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:8, justifyContent:'center', transition:'all 0.3s ease' }}>
          <ExternalLink size={14} />View Profile
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR MAP VIEW
// ─────────────────────────────────────────────────────────────────────────────
const DoctorMapView = ({ doctors, city, state, onDoctorSelect }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const configResponse = await fetch(`${API_BASE_URL}/api/config/maps-key`);
        const configData = await configResponse.json();
        await loadGoogleMapsScript(configData.maps_api_key);
        if (!mapRef.current) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address:`${city}, ${state}, India` }, (results, status) => {
          if (status==='OK' && results[0]) {
            const map = new window.google.maps.Map(mapRef.current, { center:results[0].geometry.location, zoom:13 });
            infoWindowRef.current = new window.google.maps.InfoWindow();
            doctors.forEach((doctor, index) => {
              geocoder.geocode({ address: doctor.hospital }, (res, st) => {
                if (st==='OK' && res[0]) {
                  const marker = new window.google.maps.Marker({ position:res[0].geometry.location, map, title:doctor.name, animation:window.google.maps.Animation.DROP });
                  marker.addListener('click', () => {
                    infoWindowRef.current.setContent(`<div style="padding:12px;max-width:260px;font-family:sans-serif"><strong>${doctor.name}</strong><br/>${doctor.specialty}<br/>${doctor.hospital}</div>`);
                    infoWindowRef.current.open(map, marker);
                  });
                  markersRef.current.push(marker);
                }
              });
            });
          }
        });
      } catch (error) { console.error('Map initialization error:', error); }
    };
    initMap();
    return () => { markersRef.current.forEach(m => m.setMap(null)); markersRef.current = []; };
  }, [doctors, city, state]);

  return (
    <div style={{ width:'100%', height:500, borderRadius:16, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', marginBottom:24 }}>
      <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
const ConsultationModal = ({ isOpen, onClose, abnormalTests, patientName }) => {
  const [step, setStep] = useState(1);
  const [city, setCity] = useState('Hyderabad');
  const [viewMode, setViewMode] = useState('list');
  const [state, setState] = useState('Telangana');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const majorCities = [
    { city:'Mumbai', state:'Maharashtra' },{ city:'Delhi', state:'Delhi' },
    { city:'Bangalore', state:'Karnataka' },{ city:'Hyderabad', state:'Telangana' },
    { city:'Chennai', state:'Tamil Nadu' },{ city:'Kolkata', state:'West Bengal' },
    { city:'Pune', state:'Maharashtra' },{ city:'Ahmedabad', state:'Gujarat' }
  ];

  useEffect(() => { if (abnormalTests?.length > 0) setSelectedSpecialty(abnormalTests[0].specialty); }, [abnormalTests]);

  const handleFindDoctors = async () => {
    if (!city || !state) { setError('Please enter both city and state'); return; }
    setLoading(true); setError(''); setDoctors([]);
    try {
      const response = await fetch(`${API_BASE_URL}/api/find-doctors`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ city:city.trim(), state:state.trim(), specialty:selectedSpecialty }) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success && data.doctors?.length > 0) { setDoctors(data.doctors); setStep(2); setError(''); }
      else { setError(data.message || `No ${selectedSpecialty} specialists found in ${city}, ${state}.`); }
    } catch (err) { setError(`Failed to find doctors: ${err.message}.`); }
    finally { setLoading(false); }
  };

  const handleBookAppointment = (doctor, action='book') => {
    if (action==='profile') {
      const url = doctor.profile_url && doctor.profile_url!=='#' ? doctor.profile_url : `https://www.practo.com/search/doctors?results_type=doctor&q=${encodeURIComponent(doctor.name)}&city=${city.toLowerCase()}`;
      window.open(url, '_blank');
    } else {
      const url = doctor.maps_url && doctor.maps_url!=='#' ? doctor.maps_url : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.hospital || doctor.name)}`;
      window.open(url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:'rgba(255,255,255,0.98)', borderRadius:24, maxWidth:1000, width:'100%', maxHeight:'90vh', overflow:'auto', boxShadow:'0 25px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white', padding:32, borderTopLeftRadius:24, borderTopRightRadius:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ margin:'0 0 12px 0', fontSize:'1.75rem', fontWeight:700 }}>Find Your Specialist</h2>
            <p style={{ margin:0, fontSize:'0.95rem', opacity:0.95 }}>{step===1 ? 'Enter your location to discover top specialists' : `${doctors.length} verified specialists found`}</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', cursor:'pointer', padding:12, borderRadius:12 }}><X size={24} /></button>
        </div>
        <div style={{ padding:32 }}>
          {abnormalTests?.length > 0 && (
            <div style={{ background:'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(251,146,60,0.1))', border:'2px solid rgba(239,68,68,0.2)', borderRadius:16, padding:24, marginBottom:32 }}>
              <div style={{ display:'flex', alignItems:'start', gap:16 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg, #ef4444, #fb923c)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><AlertCircle size={24} color="white" /></div>
                <div style={{ flex:1 }}>
                  <h3 style={{ margin:'0 0 12px 0', color:'#991b1b', fontSize:'1.125rem', fontWeight:700 }}>Medical Attention Required</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {abnormalTests.map((test, idx) => (
                      <div key={idx} style={{ background:'white', padding:16, borderRadius:12, border:'1px solid rgba(239,68,68,0.2)' }}>
                        <div style={{ fontWeight:700, marginBottom:6, color:'#1f2937' }}>{test.testName}</div>
                        <div style={{ fontSize:'0.875rem', color:'#6b7280' }}>Value: <strong style={{ color:'#ef4444' }}>{test.value}</strong> (Normal: {test.normalRange})</div>
                        <div style={{ fontSize:'0.8125rem', color:'#667eea', fontWeight:600, marginTop:4 }}>Recommended: {test.specialty}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {step===1 && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
                <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} style={{ padding:16, border:'2px solid rgba(102,126,234,0.2)', borderRadius:12, fontSize:'1rem', outline:'none', background:'rgba(255,255,255,0.8)' }} />
                <input type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} style={{ padding:16, border:'2px solid rgba(102,126,234,0.2)', borderRadius:12, fontSize:'1rem', outline:'none', background:'rgba(255,255,255,0.8)' }} />
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                {majorCities.map((loc, idx) => (
                  <button key={idx} onClick={() => { setCity(loc.city); setState(loc.state); }}
                    style={{ padding:'10px 16px', background: city===loc.city ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.8)', color: city===loc.city ? 'white' : '#4b5563', border: city===loc.city ? 'none' : '2px solid rgba(209,213,219,0.5)', borderRadius:10, fontSize:'0.8125rem', fontWeight:600, cursor:'pointer' }}>
                    {loc.city}
                  </button>
                ))}
              </div>
              <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} style={{ width:'100%', padding:16, border:'2px solid rgba(102,126,234,0.2)', borderRadius:12, fontSize:'1rem', outline:'none', marginBottom:20 }}>
                {abnormalTests?.map((test, idx) => <option key={idx} value={test.specialty}>{test.specialty}</option>)}
              </select>
              {error && <div style={{ background:'rgba(254,242,242,0.9)', color:'#dc2626', padding:16, borderRadius:12, marginBottom:20, fontSize:'0.875rem' }}>{error}</div>}
              <button onClick={handleFindDoctors} disabled={loading || !city || !state}
                style={{ width:'100%', background: loading||!city||!state ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white', padding:18, borderRadius:12, border:'none', cursor: loading||!city||!state ? 'not-allowed' : 'pointer', fontWeight:700, fontSize:'1.0625rem', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
                {loading ? <><Loader style={{ animation:'spin 1s linear infinite' }} size={22} />Finding Specialists…</> : <><Stethoscope size={22} />Find Doctors Near Me</>}
              </button>
            </div>
          )}
          {step===2 && doctors.length > 0 && (
            <div>
              <div style={{ background:'rgba(102,126,234,0.1)', padding:'20px 24px', borderRadius:16, marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:'0.875rem', color:'#6b7280' }}>Showing {selectedSpecialty} specialists in</div>
                  <div style={{ fontWeight:700, color:'#1f2937', fontSize:'1.125rem' }}>{city}, {state}</div>
                </div>
                <button onClick={() => { setStep(1); setDoctors([]); }} style={{ background:'white', border:'2px solid rgba(102,126,234,0.3)', padding:'10px 20px', borderRadius:10, cursor:'pointer', fontWeight:600, color:'#667eea' }}>Change Location</button>
              </div>
              <div style={{ display:'flex', gap:12, marginBottom:20 }}>
                {['list','map'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)} style={{ flex:1, padding:'12px 20px', background: viewMode===mode ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(249,250,251,0.8)', color: viewMode===mode ? 'white' : '#6b7280', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer' }}>
                    {mode==='list' ? '☰ List View' : '📍 Map View'}
                  </button>
                ))}
              </div>
              {viewMode==='map' && <DoctorMapView doctors={doctors} city={city} state={state} onDoctorSelect={handleBookAppointment} />}
              {viewMode==='list' && <div style={{ display:'flex', flexDirection:'column', gap:20 }}>{doctors.map((doctor, idx) => <DoctorCard key={idx} doctor={doctor} onBook={handleBookAppointment} />)}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE CONTENT
// ─────────────────────────────────────────────────────────────────────────────
const MessageContent = ({ content, tableData, abnormalTests, onConsultationClick }) => {
  const formatContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pi) => part.startsWith('**') && part.endsWith('**') ? <strong key={pi}>{part.slice(2,-2)}</strong> : <span key={pi}>{part}</span>);
      return <div key={idx} style={{ marginBottom:'8px' }}>{formattedLine}</div>;
    });
  };

  const ConsultBtn = () => abnormalTests?.length > 0 ? (
    <button onClick={onConsultationClick} style={{ marginTop:20, background:'linear-gradient(135deg, #ef4444, #f59e0b)', color:'white', padding:'14px 28px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:10, fontSize:'0.9375rem', boxShadow:'0 6px 20px rgba(239,68,68,0.4)' }}>
      <Calendar size={20} />Book Consultation for Abnormal Results
    </button>
  ) : null;

  if (tableData) return <div><ComparisonTable tableData={tableData} /><div style={{ marginTop:16, lineHeight:1.7 }}>{formatContent(content)}</div><ConsultBtn /></div>;
  return <div style={{ lineHeight:1.7 }}>{formatContent(content)}<ConsultBtn /></div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO CONSULTATION HOOK
// ─────────────────────────────────────────────────────────────────────────────

const useVideoConsultation = () => {
  const [view, setView]                       = useState<'role'|'entry'|'waiting'|'call'>('role');
  const [role, setRole]                       = useState<'doctor'|'patient'|null>(null);
  const [roomId, setRoomId]                   = useState('');
  const [videoOn, setVideoOn]                 = useState(true);
  const [audioOn, setAudioOn]                 = useState(true);
  const [chatOpen, setChatOpen]               = useState(false);
  // ── UPDATED: isFile flag added to chat message type ──
  const [chatMsgs, setChatMsgs]               = useState<{from:string;text:string;isFile?:boolean}[]>([]);
  const [callSeconds, setCallSeconds]         = useState(0);
  const [waitingCount, setWaitingCount]       = useState(0);
  const [statusMsg, setStatusMsg]             = useState('');
  const [error, setError]                     = useState('');
  const [connectionState, setConnectionState] = useState<'idle'|'connecting'|'connected'|'failed'>('idle');
  const [remoteStream, setRemoteStream]       = useState<MediaStream|null>(null);

  const localVideoRef   = useRef<HTMLVideoElement>(null);
  const remoteVideoRef  = useRef<HTMLVideoElement>(null);
  const pcRef           = useRef<RTCPeerConnection|null>(null);
  const localStreamRef  = useRef<MediaStream|null>(null);
  const pollRef         = useRef<ReturnType<typeof setInterval>|null>(null);
  const timerRef        = useRef<ReturnType<typeof setInterval>|null>(null);
  const endCallPollRef  = useRef<ReturnType<typeof setInterval>|null>(null);
  const roomIdRef       = useRef('');
  const roleRef         = useRef<string>('');
  const dataChannelRef  = useRef<RTCDataChannel|null>(null);

  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { roleRef.current = role || ''; }, [role]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, view, videoOn]);

  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [view]);

  const startTimer = () => {
    clearInterval(timerRef.current!);
    setCallSeconds(0);
    timerRef.current = setInterval(() => setCallSeconds(s => s + 1), 1000);
  };

  const stopTimer       = () => { clearInterval(timerRef.current!); timerRef.current = null; };
  const stopPolling     = () => { clearInterval(pollRef.current!); pollRef.current = null; };
  const stopEndCallPoll = () => { clearInterval(endCallPollRef.current!); endCallPollRef.current = null; };

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (e) {
      setError('Camera/mic not available. Check browser permissions.');
      return null;
    }
  };

  const stopMedia = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setRemoteStream(null);
  };

  const closePC = () => {
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
  };

  const sendCandidate = async (candidate: RTCIceCandidate) => {
    const rid = roomIdRef.current;
    const r   = roleRef.current;
    if (!rid) return;
    await fetch(`${API_BASE_URL}/api/video/room/${rid}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'candidate', sender: r, data: candidate.toJSON() })
    }).catch(err => console.error('sendCandidate error:', err));
  };

  // ── UPDATED: DataChannel setup — handles file messages ──
  const setupDataChannel = (dc: RTCDataChannel) => {
    dc.onopen    = () => console.log('DataChannel open ✅');
    dc.onclose   = () => console.log('DataChannel closed');
    dc.onerror   = (e) => console.error('DataChannel error:', e);
    dc.onmessage = (e) => {
      try {
        const msg  = JSON.parse(e.data);
        const from = roleRef.current === 'doctor' ? 'Patient' : 'Doctor';

        if (msg.type === 'end_call') {
          handleRemoteEndCall();
          return;
        }
        // ── NEW: file message received ──
        if (msg.type === 'file') {
          setChatMsgs(prev => [...prev, { from, text: e.data, isFile: true }]);
          return;
        }
        setChatMsgs(prev => [...prev, { from, text: msg.text }]);
      } catch {
        const from = roleRef.current === 'doctor' ? 'Patient' : 'Doctor';
        setChatMsgs(prev => [...prev, { from, text: e.data }]);
      }
    };
  };

  const handleRemoteEndCall = useCallback(() => {
    stopPolling();
    stopEndCallPoll();
    stopTimer();
    closePC();
    stopMedia();
    setView('role');
    setRole(null);
    setRoomId('');
    roomIdRef.current = '';
    setVideoOn(true);
    setAudioOn(true);
    setChatOpen(false);
    setChatMsgs([]);
    setCallSeconds(0);
    setWaitingCount(0);
    setStatusMsg('');
    setError('The other participant ended the call.');
    setConnectionState('idle');
  }, []);

  const createPC = (stream: MediaStream | null) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));

    if (roleRef.current === 'doctor') {
      const dc = pc.createDataChannel('chat', { ordered: true });
      dataChannelRef.current = dc;
      setupDataChannel(dc);
    } else {
      pc.ondatachannel = (e) => {
        dataChannelRef.current = e.channel;
        setupDataChannel(e.channel);
      };
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) sendCandidate(e.candidate);
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setView('call');
      setConnectionState('connected');
      startTimer();
      stopPolling();
      startEndCallPolling();
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        setConnectionState('failed');
        setError('Connection failed. Please try again.');
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
        handleRemoteEndCall();
      }
    };

    return pc;
  };

  const startEndCallPolling = () => {
    stopEndCallPoll();
    endCallPollRef.current = setInterval(async () => {
      const rid = roomIdRef.current;
      if (!rid) return;
      try {
        const res  = await fetch(`${API_BASE_URL}/api/video/room/${rid}`);
        if (!res.ok) { handleRemoteEndCall(); return; }
        const room = await res.json();
        if (room.call_ended) { handleRemoteEndCall(); }
      } catch {
        handleRemoteEndCall();
      }
    }, 2000);
  };

  const createRoom = async () => {
    setError('');
    setStatusMsg('Starting camera…');
    const stream = await getMedia();

    setStatusMsg('Creating consultation room…');
    let rid = '';
    try {
      const res  = await fetch(`${API_BASE_URL}/api/video/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'doctor' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create room');
      rid = data.room_id;
      setRoomId(rid);
      roomIdRef.current = rid;
    } catch (e: any) {
      setError(e.message);
      stopMedia();
      return;
    }

    setView('waiting');
    setStatusMsg('Waiting for patient to join…');

    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/video/room/${rid}`);
        const room = await res.json();

        if (!room.patient_joined) { setWaitingCount(0); return; }

        setWaitingCount(1);
        setStatusMsg('Patient joined! Establishing connection…');
        setConnectionState('connecting');
        stopPolling();

        const pc    = createPC(stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await fetch(`${API_BASE_URL}/api/video/room/${rid}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'offer', sender: 'doctor', data: { type: offer.type, sdp: offer.sdp } })
        });

        pollRef.current = setInterval(async () => {
          try {
            const res2  = await fetch(`${API_BASE_URL}/api/video/room/${rid}`);
            const room2 = await res2.json();
            if (room2.answer && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(room2.answer));
            }
            for (const cand of (room2.patient_candidates || [])) {
              try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch (_) {}
            }
          } catch (e) { console.error('Doctor poll error:', e); }
        }, 2000);

      } catch (e) { console.error('Waiting room poll error:', e); }
    }, 3000);
  };

  const joinRoom = async (code: string) => {
    const rid = code.trim().toUpperCase();
    if (!rid || rid.length < 4) { setError('Please enter a valid room code.'); return; }
    setError('');

    setStatusMsg('Checking room…');
    try {
      const res = await fetch(`${API_BASE_URL}/api/video/room/${rid}`);
      if (!res.ok) { setError('Room not found. Check the code and try again.'); return; }
    } catch (e) {
      setError('Cannot reach server. Is the backend running?');
      return;
    }

    setStatusMsg('Starting camera…');
    const stream = await getMedia();

    await fetch(`${API_BASE_URL}/api/video/room/${rid}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'patient' })
    }).catch(console.error);

    setRoomId(rid);
    roomIdRef.current = rid;
    setView('waiting');
    setStatusMsg('Waiting for doctor to connect…');
    setConnectionState('connecting');

    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/video/room/${rid}`);
        const room = await res.json();

        if (!room.offer) return;
        stopPolling();

        const pc = createPC(stream);
        await pc.setRemoteDescription(new RTCSessionDescription(room.offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await fetch(`${API_BASE_URL}/api/video/room/${rid}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'answer', sender: 'patient', data: { type: answer.type, sdp: answer.sdp } })
        });

        for (const cand of (room.doctor_candidates || [])) {
          try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch (_) {}
        }

        let appliedCount = (room.doctor_candidates || []).length;
        pollRef.current = setInterval(async () => {
          try {
            const res2  = await fetch(`${API_BASE_URL}/api/video/room/${rid}`);
            const room2 = await res2.json();
            const newCands = (room2.doctor_candidates || []).slice(appliedCount);
            for (const cand of newCands) {
              try { await pc.addIceCandidate(new RTCIceCandidate(cand)); appliedCount++; } catch (_) {}
            }
          } catch (e) { console.error('Patient ICE poll error:', e); }
        }, 2000);

      } catch (e) { console.error('Patient offer poll error:', e); }
    }, 2000);
  };

  const endCall = useCallback(async () => {
    const rid = roomIdRef.current;

    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      try {
        dataChannelRef.current.send(JSON.stringify({ type: 'end_call' }));
        await new Promise(r => setTimeout(r, 200));
      } catch (_) {}
    }

    if (rid) {
      try {
        await fetch(`${API_BASE_URL}/api/video/room/${rid}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (_) {}
    }

    stopPolling();
    stopEndCallPoll();
    stopTimer();
    closePC();
    stopMedia();

    if (rid) {
      try {
        await fetch(`${API_BASE_URL}/api/video/room/${rid}`, { method: 'DELETE' });
      } catch (_) {}
    }

    setView('role');
    setRole(null);
    setRoomId('');
    roomIdRef.current = '';
    setVideoOn(true);
    setAudioOn(true);
    setChatOpen(false);
    setChatMsgs([]);
    setCallSeconds(0);
    setWaitingCount(0);
    setStatusMsg('');
    setError('');
    setConnectionState('idle');
  }, []);

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setVideoOn(v => !v);
  };

  const toggleAudio = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setAudioOn(a => !a);
  };

  // ── UPDATED: sendChat handles both plain text and file JSON ──
  const sendChat = (msg: string) => {
    if (!msg.trim()) return;

    let parsed: any = null;
    try { parsed = JSON.parse(msg); } catch (_) {}

    if (parsed?.type === 'file') {
      // Show as file bubble in our own chat
      setChatMsgs(prev => [...prev, { from: 'You', text: msg, isFile: true }]);
    } else {
      setChatMsgs(prev => [...prev, { from: 'You', text: msg.trim() }]);
    }

    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      const payload = parsed?.type === 'file'
        ? msg
        : JSON.stringify({ type: 'chat', text: msg.trim() });
      dataChannelRef.current.send(payload);
    } else {
      console.warn('DataChannel not open — message not sent to remote.');
    }
  };

  useEffect(() => () => {
    stopPolling();
    stopEndCallPoll();
    stopTimer();
    closePC();
    stopMedia();
  }, []);

  const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return {
    view, setView, role, setRole,
    roomId, videoOn, audioOn, chatOpen, setChatOpen,
    chatMsgs, callSeconds, waitingCount, statusMsg, error, setError,
    connectionState, localVideoRef, remoteVideoRef, remoteStream,
    createRoom, joinRoom, endCall,
    toggleVideo, toggleAudio, sendChat, fmtTime
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO CONSULT TAB UI
// ─────────────────────────────────────────────────────────────────────────────

const VideoConsultTab = () => {
  const vc = useVideoConsultation();
  const [joinCode, setJoinCode]     = useState('');
  const [chatInput, setChatInput]   = useState('');
  const [copied, setCopied]         = useState(false);
  // ── NEW: file sharing state ──
  const [uploading, setUploading]   = useState(false);
  const chatEndRef                  = useRef<HTMLDivElement>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [vc.chatMsgs]);

  const copyCode = () => {
    navigator.clipboard.writeText(vc.roomId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── NEW: file share handler ──
  const handleFileShare = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vc.roomId) return;

    const allowed = ['application/pdf','image/jpeg','image/jpg','image/png','image/gif','image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Only PDF and image files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10 MB.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res  = await fetch(
        `${API_BASE_URL}/api/video/room/${vc.roomId}/share-file?sender=${vc.role}`,
        { method: 'POST', body: fd }
      );
      const data = await res.json();

      if (data.success) {
        // Send file metadata over DataChannel so the other side gets a clickable link
        const fileMsg = JSON.stringify({
          type:     'file',
          file_id:  data.file_id,
          filename: data.filename,
          size:     data.size,
        });
        vc.sendChat(fileMsg);
      } else {
        alert('File upload failed.');
      }
    } catch (err) {
      alert('Error uploading file.');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── ROLE SELECT ────────────────────────────────────────────────────────
  if (vc.view === 'role') return (
    <div style={{ maxWidth:500, margin:'0 auto', textAlign:'center', paddingTop:24 }}>
      <div style={{ fontSize:52, marginBottom:16 }}>🎥</div>
      <h3 style={{ fontSize:'1.5rem', fontWeight:700, color:'#1f2937', marginBottom:8 }}>Video Consultation</h3>
      <p style={{ color:'#6b7280', marginBottom:32, fontSize:'0.9375rem' }}>Secure face-to-face consultation — fully peer-to-peer via WebRTC</p>

      {vc.error && (
        <div style={{ marginBottom:20, padding:'12px 16px', background:'rgba(254,242,242,0.9)', color:'#dc2626', borderRadius:10, fontSize:'0.875rem', border:'1px solid rgba(220,38,38,0.2)' }}>
          ⚠️ {vc.error}
          <button onClick={() => vc.setError('')} style={{ marginLeft:12, background:'none', border:'none', cursor:'pointer', color:'#dc2626', fontWeight:700 }}>✕</button>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
        {[
          { emoji:'👤', title:"I'm a Patient",  desc:'Enter room code and wait for your doctor', role:'patient' as const, color:'#667eea' },
          { emoji:'🩺', title:"I'm a Doctor",   desc:'Create a room and admit patients', role:'doctor' as const, color:'#0F6E56' },
        ].map(card => (
          <button key={card.role}
            onClick={() => { vc.setRole(card.role); vc.setView('entry'); vc.setError(''); }}
            style={{ padding:24, borderRadius:16, border:'2px solid rgba(229,231,235,0.5)', background:'rgba(255,255,255,0.95)', cursor:'pointer', textAlign:'left', transition:'all 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(229,231,235,0.5)'}>
            <div style={{ fontSize:36, marginBottom:12 }}>{card.emoji}</div>
            <div style={{ fontWeight:700, fontSize:'1rem', color:'#1f2937', marginBottom:6 }}>{card.title}</div>
            <div style={{ fontSize:'0.8125rem', color:'#6b7280', lineHeight:1.5 }}>{card.desc}</div>
          </button>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:20, fontSize:'0.8125rem', color:'#9ca3af', flexWrap:'wrap' }}>
        <span>🔒 End-to-end encrypted</span><span>📡 WebRTC peer-to-peer</span><span>🚫 No downloads needed</span>
      </div>
    </div>
  );

  // ── ROOM ENTRY ─────────────────────────────────────────────────────────
  if (vc.view === 'entry') return (
    <div style={{ maxWidth:440, margin:'0 auto' }}>
      <button onClick={() => { vc.setView('role'); vc.setRole(null); vc.setError(''); }}
        style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.875rem', color:'#6b7280', marginBottom:20, padding:0, display:'flex', alignItems:'center', gap:6 }}>
        ← Back
      </button>
      <h3 style={{ fontSize:'1.25rem', fontWeight:700, color:'#1f2937', marginBottom:8 }}>
        {vc.role==='doctor' ? 'Start a consultation room' : 'Join consultation'}
      </h3>
      <p style={{ color:'#6b7280', marginBottom:24, fontSize:'0.9375rem' }}>
        {vc.role==='doctor'
          ? 'Creates a secure room on the server. Share the 6-char code with your patient.'
          : 'Enter the room code your doctor shared with you.'}
      </p>

      {vc.role==='doctor' ? (
        <button onClick={vc.createRoom}
          style={{ width:'100%', padding:16, background:'linear-gradient(135deg, #667eea, #764ba2)', color:'white', border:'none', borderRadius:12, fontSize:'1rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 8px 24px rgba(102,126,234,0.4)' }}>
          <Video size={20} />Create Consultation Room
        </button>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter room code (e.g. AB12CD)"
            maxLength={6}
            style={{ padding:14, border:'2px solid rgba(102,126,234,0.2)', borderRadius:12, fontSize:'1.5rem', letterSpacing:8, textAlign:'center', fontFamily:'monospace', outline:'none', background:'rgba(249,250,251,0.8)', color:'#1f2937' }}
          />
          <button
            onClick={() => vc.joinRoom(joinCode)}
            disabled={joinCode.length < 4}
            style={{ padding:16, background: joinCode.length>=4 ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#d1d5db', color:'white', border:'none', borderRadius:12, fontSize:'1rem', fontWeight:700, cursor: joinCode.length>=4 ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <Phone size={18} />Join Waiting Room
          </button>
        </div>
      )}

      {vc.error && (
        <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(254,242,242,0.9)', color:'#dc2626', borderRadius:10, fontSize:'0.875rem', border:'1px solid rgba(220,38,38,0.2)' }}>
          ⚠️ {vc.error}
        </div>
      )}
    </div>
  );

  // ── WAITING ROOM ───────────────────────────────────────────────────────
  if (vc.view === 'waiting') return (
    <div style={{ maxWidth:520, margin:'0 auto', textAlign:'center' }}>
      <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:20, padding:36, border:'1px solid rgba(255,255,255,0.3)', boxShadow:'0 8px 32px rgba(0,0,0,0.08)', marginBottom:16 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>
          {vc.role==='patient' ? '⏱️' : vc.waitingCount > 0 ? '👥' : '🔗'}
        </div>
        <h3 style={{ fontSize:'1.25rem', fontWeight:700, color:'#1f2937', marginBottom:8 }}>
          {vc.role==='patient' ? "You're in the waiting room" : 'Consultation room open'}
        </h3>
        <p style={{ color:'#6b7280', marginBottom:20, lineHeight:1.6 }}>
          {vc.statusMsg || (vc.role==='patient' ? 'Waiting for your doctor to connect…' : 'Share the code below with your patient.')}
        </p>

        <div style={{ background:'rgba(102,126,234,0.08)', borderRadius:14, padding:'16px 24px', display:'inline-flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <div>
            <div style={{ fontSize:'0.75rem', color:'#6b7280', marginBottom:4, textAlign:'left' }}>Room code</div>
            <span style={{ fontFamily:'monospace', fontSize:'2rem', fontWeight:800, color:'#667eea', letterSpacing:6 }}>{vc.roomId}</span>
          </div>
          <button onClick={copyCode}
            style={{ background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(102,126,234,0.12)', border:'none', borderRadius:10, padding:'8px 14px', cursor:'pointer', color: copied ? '#16a34a' : '#667eea', fontWeight:600, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:6, transition:'all 0.2s' }}>
            <Copy size={14} />{copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          {vc.connectionState==='connecting' ? (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 18px', background:'rgba(251,191,36,0.12)', borderRadius:20, color:'#92400e', fontSize:'0.875rem', fontWeight:600 }}>
              <Loader size={14} style={{ animation:'spin 1s linear infinite' }} />
              {vc.role==='doctor' ? (vc.waitingCount > 0 ? 'Patient found — negotiating…' : 'Waiting for patient to join…') : 'Connecting to doctor…'}
            </div>
          ) : (
            <div style={{ padding:'8px 18px', background:'rgba(249,250,251,0.8)', borderRadius:20, color:'#6b7280', fontSize:'0.875rem' }}>
              Polling server every 2–3 seconds
            </div>
          )}
        </div>

        <div style={{ marginTop:20, width:180, height:120, borderRadius:12, background:'#1a1a2e', margin:'20px auto 0', overflow:'hidden', border:'2px solid rgba(102,126,234,0.3)', position:'relative' }}>
          <video ref={vc.localVideoRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          <div style={{ position:'absolute', bottom:6, left:0, right:0, textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.8)', background:'rgba(0,0,0,0.4)', padding:'2px 0' }}>
            Your preview ({vc.role==='doctor'?'Doctor':'Patient'})
          </div>
        </div>
      </div>

      {vc.error && <div style={{ padding:'12px 16px', background:'rgba(254,242,242,0.9)', color:'#dc2626', borderRadius:10, fontSize:'0.875rem', marginBottom:12 }}>⚠️ {vc.error}</div>}

      <button onClick={vc.endCall}
        style={{ padding:'11px 28px', background:'#ef4444', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:'0.9375rem' }}>
        Leave waiting room
      </button>
    </div>
  );

  // ── ACTIVE CALL ────────────────────────────────────────────────────────
  if (vc.view === 'call') return (
    <div style={{ display:'flex', flexDirection:'column', borderRadius:20, overflow:'hidden', border:'1px solid rgba(255,255,255,0.3)', boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', background:'rgba(255,255,255,0.98)', borderBottom:'1px solid rgba(229,231,235,0.5)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Stethoscope size={18} style={{ color:'#667eea' }} />
          <span style={{ fontWeight:700, fontSize:'0.9375rem', color:'#1f2937' }}>MedAnalyze Consultation</span>
          <span style={{ fontFamily:'monospace', fontSize:'0.8125rem', background:'rgba(102,126,234,0.1)', color:'#667eea', padding:'2px 10px', borderRadius:20 }}>{vc.roomId}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulse 2s infinite' }} />
          <span style={{ fontFamily:'monospace', fontWeight:700, color:'#15803d', fontSize:'0.9375rem' }}>{vc.fmtTime(vc.callSeconds)}</span>
        </div>
      </div>

      {/* Video area */}
      <div style={{ display:'flex', minHeight:580, background:'#0f0f0f' }}>
        <div style={{ flex:1, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>

          <video
            ref={vc.remoteVideoRef}
            autoPlay
            playsInline
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
          />

          {!vc.remoteStream && (
            <div style={{ position:'relative', zIndex:1, textAlign:'center', color:'rgba(255,255,255,0.6)', pointerEvents:'none' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 10px' }}>
                {vc.role==='doctor' ? '👤' : '🩺'}
              </div>
              <div style={{ fontSize:'0.875rem' }}>{vc.role==='doctor' ? 'Patient video' : 'Doctor video'}</div>
              <div style={{ fontSize:'0.75rem', opacity:0.5, marginTop:4 }}>Waiting for stream…</div>
            </div>
          )}

          {/* Local PiP */}
          <div style={{ position:'absolute', bottom:12, right:12, width:150, height:108, background:'#1a1a1a', borderRadius:10, border:'2px solid rgba(255,255,255,0.18)', overflow:'hidden', zIndex:10 }}>
            {vc.videoOn
              ? <video ref={vc.localVideoRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}><span style={{ fontSize:24 }}>📷</span><span style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>Camera off</span></div>
            }
            <div style={{ position:'absolute', bottom:4, left:0, right:0, textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.7)' }}>
              You ({vc.role==='doctor'?'Doctor':'Patient'})
            </div>
          </div>
        </div>

        {/* ── UPDATED: Chat sidebar with file sharing ── */}
        {vc.chatOpen && (
          <div style={{ width:280, background:'rgba(255,255,255,0.97)', borderLeft:'1px solid rgba(229,231,235,0.4)', display:'flex', flexDirection:'column' }}>

            {/* Chat header */}
            <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(229,231,235,0.4)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:600, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:6 }}>
                <MessageSquare size={14} style={{ color:'#667eea' }} />In-call chat
              </span>
              <button onClick={() => vc.setChatOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={14} /></button>
            </div>

            {/* ── NEW: File sharing banner ── */}
            <div style={{ padding:'8px 12px', background:'rgba(102,126,234,0.06)', borderBottom:'1px solid rgba(229,231,235,0.3)', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:14 }}>📎</span>
              <span style={{ fontSize:'0.6875rem', color:'#6b7280', lineHeight:1.4 }}>
                Share PDFs or images via the attachment button below
              </span>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:10, minHeight:200 }}>
              {vc.chatMsgs.length===0 && (
                <div style={{ fontSize:12, color:'#9ca3af', textAlign:'center', marginTop:40 }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
                  No messages yet
                </div>
              )}
              {vc.chatMsgs.map((m, i) => {
                // ── NEW: parse file metadata if this is a file bubble ──
                let fileMeta: any = null;
                if (m.isFile) {
                  try { fileMeta = JSON.parse(m.text); } catch (_) {}
                }
                const isOwn = m.from === 'You';

                return (
                  <div key={i} style={{ marginBottom:10, display:'flex', flexDirection:'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                    <div style={{ fontSize:9, color:'#9ca3af', marginBottom:3, paddingLeft:4, paddingRight:4 }}>{m.from}</div>
                    {fileMeta ? (
                      // ── NEW: File bubble ──
                      <a
                        href={`${API_BASE_URL}/api/video/file/${fileMeta.file_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display:'flex', alignItems:'center', gap:8,
                          padding:'10px 12px',
                          background: isOwn ? 'rgba(102,126,234,0.15)' : 'rgba(249,250,251,1)',
                          border: `1px solid ${isOwn ? 'rgba(102,126,234,0.25)' : 'rgba(229,231,235,0.8)'}`,
                          borderRadius: isOwn ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                          textDecoration:'none',
                          maxWidth:200,
                          transition:'all 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        {/* File type icon */}
                        <div style={{
                          width:36, height:36, borderRadius:8, flexShrink:0,
                          background: fileMeta.filename?.toLowerCase().endsWith('.pdf')
                            ? 'rgba(239,68,68,0.12)' : 'rgba(102,126,234,0.12)',
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18
                        }}>
                          {fileMeta.filename?.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:11, fontWeight:600, color:'#1f2937', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {fileMeta.filename}
                          </div>
                          <div style={{ fontSize:10, color:'#9ca3af', marginTop:2 }}>
                            {fileMeta.size ? `${(fileMeta.size / 1024).toFixed(1)} KB` : ''} · Tap to open
                          </div>
                        </div>
                        <span style={{ fontSize:12, color:'#667eea', flexShrink:0 }}>↗</span>
                      </a>
                    ) : (
                      // Plain text bubble
                      <div style={{
                        maxWidth:190,
                        background: isOwn ? 'rgba(102,126,234,0.15)' : 'rgba(249,250,251,1)',
                        color:'#1f2937',
                        borderRadius: isOwn ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        padding:'8px 10px',
                        fontSize:12,
                        lineHeight:1.5,
                        wordBreak:'break-word',
                        border:`1px solid ${isOwn ? 'rgba(102,126,234,0.2)' : 'rgba(229,231,235,0.6)'}`,
                      }}>
                        {m.text}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* ── UPDATED: Input row with attachment button ── */}
            <div style={{ padding:8, borderTop:'1px solid rgba(229,231,235,0.4)', display:'flex', gap:6, alignItems:'center' }}>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileShare}
                style={{ display:'none' }}
                id="chat-file-input"
              />

              {/* Attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title={uploading ? 'Uploading…' : 'Share a file (PDF or image, max 10 MB)'}
                style={{
                  background: uploading ? 'rgba(209,213,219,0.5)' : 'rgba(102,126,234,0.1)',
                  border: `1px solid ${uploading ? 'rgba(209,213,219,0.5)' : 'rgba(102,126,234,0.2)'}`,
                  borderRadius:8,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  color: uploading ? '#9ca3af' : '#667eea',
                  fontSize:16,
                  padding:'5px 7px',
                  flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.2s',
                }}
              >
                {uploading ? <Loader size={14} style={{ animation:'spin 1s linear infinite' }} /> : '📎'}
              </button>

              {/* Text input */}
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key==='Enter' && chatInput.trim()) {
                    vc.sendChat(chatInput);
                    setChatInput('');
                  }
                }}
                placeholder="Type a message…"
                style={{
                  flex:1, padding:'6px 10px', borderRadius:8,
                  border:'1px solid rgba(229,231,235,0.5)', fontSize:12,
                  outline:'none', background:'rgba(249,250,251,0.8)', color:'#1f2937'
                }}
              />

              {/* Send button */}
              <button
                onClick={() => { if (chatInput.trim()) { vc.sendChat(chatInput); setChatInput(''); } }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#667eea', fontWeight:700, fontSize:16, flexShrink:0 }}
              >
                ➤
              </button>
            </div>

            {/* Upload progress hint */}
            {uploading && (
              <div style={{ padding:'6px 12px', background:'rgba(102,126,234,0.08)', borderTop:'1px solid rgba(229,231,235,0.3)', fontSize:11, color:'#667eea', display:'flex', alignItems:'center', gap:6 }}>
                <Loader size={12} style={{ animation:'spin 1s linear infinite' }} />
                Uploading file…
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, padding:'16px 20px', background:'rgba(255,255,255,0.98)', borderTop:'1px solid rgba(229,231,235,0.5)', flexWrap:'wrap' }}>
        {[
          { label: vc.audioOn?'Mute':'Unmute',            emoji: vc.audioOn?'🎙️':'🔇', off:!vc.audioOn, action: vc.toggleAudio },
          { label: vc.videoOn?'Stop video':'Start video', emoji: vc.videoOn?'📹':'📷', off:!vc.videoOn, action: vc.toggleVideo },
          { label:'Chat', emoji:'💬', sel: vc.chatOpen, action:() => vc.setChatOpen(v => !v) },
        ].map((btn,i) => (
          <button key={i} onClick={btn.action}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'8px 16px', borderRadius:10, border:'1px solid rgba(229,231,235,0.5)', background: (btn as any).off?'rgba(239,68,68,0.1)':(btn as any).sel?'rgba(102,126,234,0.1)':'rgba(255,255,255,0.8)', color: (btn as any).off?'#dc2626':(btn as any).sel?'#667eea':'#4b5563', cursor:'pointer', minWidth:62, transition:'all 0.2s' }}>
            <span style={{ fontSize:18 }}>{btn.emoji}</span>
            <span style={{ fontSize:10, fontWeight:600 }}>{btn.label}</span>
          </button>
        ))}
        <button onClick={vc.endCall}
          style={{ padding:'10px 28px', background:'linear-gradient(135deg, #ef4444, #dc2626)', color:'white', border:'none', borderRadius:24, cursor:'pointer', fontWeight:700, fontSize:'0.9375rem', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 12px rgba(239,68,68,0.4)' }}>
          <PhoneOff size={16} />End call
        </button>
      </div>
    </div>
  );

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

const MediExtractApp = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedReports, setProcessedReports] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [processingPrescription, setProcessingPrescription] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [prescriptionQuery, setPrescriptionQuery] = useState('');
  const [queryingPrescription, setQueryingPrescription] = useState(false);
  const [messages, setMessages] = useState<Array<{ role:string; content:string; tableData?:any; abnormalTests?:any[]; patientName?:string; }>>([
    { role:'assistant', content:"👋 Hello! I'm your Medical Report Analytics Assistant. Upload medical reports to get started, then ask me anything about the patient data!" }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [querying, setQuerying] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [visualizations, setVisualizations] = useState([]);
  const [consultationModal, setConsultationModal] = useState({ isOpen:false, abnormalTests:[], patientName:'' });
  const [compareReports, setCompareReports] = useState({ availableReports:[], selectedReport1:null, selectedReport2:null, report1File:null, report2File:null, useExisting1:true, useExisting2:false, comparing:false, comparisonResult:null });

  const handleVoiceResult = useCallback((t) => {
    setCurrentMessage(t);
    setTimeout(() => { if (t.trim() && dbStatus?.exists) handleSendMessage(); }, 500);
  }, [dbStatus]);
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition(handleVoiceResult);

  useEffect(() => { checkDatabaseStatus(); }, []);

  const checkDatabaseStatus = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/database/status`);
      setDbStatus(await r.json());
    } catch (e) { console.error(e); }
  };

  const handleFileChange       = (e) => setFiles(Array.from(e.target.files));
  const handlePrescriptionFile = (e) => { if (e.target.files[0]) setPrescriptionFile(e.target.files[0]); };

  const handleUploadAndProcess = async () => {
    if (!files.length) return;
    setProcessing(true);
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    try {
      const r    = await fetch(`${API_BASE_URL}/api/process-reports`, { method:'POST', body:fd });
      const data = await r.json();
      setProcessedReports(data.results);
      setVisualizations(data.visualizations || []);
      if (data.success) { alert(`✅ Successfully processed ${data.successful_count} reports!`); checkDatabaseStatus(); setFiles([]); }
      else alert('⚠️ Processed with some errors. Check results.');
    } catch (e: any) { alert(`❌ Error: ${e.message}`); }
    finally { setProcessing(false); }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || querying) return;
    const msg = currentMessage;
    setMessages(prev => [...prev, { role:'user', content:msg }]);
    setCurrentMessage('');
    setQuerying(true);
    try {
      const r    = await fetch(`${API_BASE_URL}/api/query`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ query:msg }) });
      const data = await r.json();
      setMessages(prev => [...prev, { role:'assistant', content:data.response||null, tableData:data.table_data||null, abnormalTests:data.abnormal_tests||null, patientName:data.patient_name||'' }]);
    } catch (e: any) { setMessages(prev => [...prev, { role:'assistant', content:`❌ Error: ${e.message}` }]); }
    finally { setQuerying(false); }
  };

  const fetchAvailableReports = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/reports/list`);
      const d = await r.json();
      if (d.success) setCompareReports(prev => ({ ...prev, availableReports: d.reports }));
    } catch (e) { console.error(e); }
  };

  const handleCompareReports = async () => {
    setCompareReports(prev => ({ ...prev, comparing:true, comparisonResult:null }));
    try {
      const fd = new FormData();
      if (compareReports.useExisting1 && compareReports.selectedReport1)        fd.append('report1_id',   compareReports.selectedReport1);
      else if (compareReports.report1File)                                        fd.append('report1_file', compareReports.report1File);
      else { alert('Please select or upload Report 1'); setCompareReports(p => ({ ...p, comparing:false })); return; }
      if (compareReports.useExisting2 && compareReports.selectedReport2)         fd.append('report2_id',   compareReports.selectedReport2);
      else if (compareReports.report2File)                                        fd.append('report2_file', compareReports.report2File);
      else { alert('Please select or upload Report 2'); setCompareReports(p => ({ ...p, comparing:false })); return; }
      const r = await fetch(`${API_BASE_URL}/api/reports/compare`, { method:'POST', body:fd });
      const d = await r.json();
      if (d.success) setCompareReports(prev => ({ ...prev, comparisonResult:d }));
      else alert(`Comparison failed: ${d.error}`);
    } catch (e: any) { alert(`Error comparing reports: ${e.message}`); }
    finally { setCompareReports(p => ({ ...p, comparing:false })); }
  };

  useEffect(() => { if (activeTab==='compare' && dbStatus?.exists) fetchAvailableReports(); }, [activeTab, dbStatus]);

  const handleProcessPrescription = async () => {
    if (!prescriptionFile) return;
    setProcessingPrescription(true);
    const fd = new FormData();
    fd.append('file', prescriptionFile);
    try {
      const r = await fetch(`${API_BASE_URL}/api/process-prescription`, { method:'POST', body:fd });
      const d = await r.json();
      if (d.success) { setPrescriptionData(d); alert('✅ Prescription processed!'); }
      else alert(`❌ Error: ${d.error}`);
    } catch (e: any) { alert(`❌ Error: ${e.message}`); }
    finally { setProcessingPrescription(false); }
  };

  const handleSendPrescriptionQuery = async () => {
    if (!prescriptionQuery.trim() || queryingPrescription) return;
    const q = prescriptionQuery; setPrescriptionQuery(''); setQueryingPrescription(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/query-prescription`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ query:q }) });
      const d = await r.json();
      alert(d.response);
    } catch (e: any) { alert(`❌ Error: ${e.message}`); }
    finally { setQueryingPrescription(false); }
  };

  const sampleQueries = [
    { text:"I want comparison based on my two blood reports in tabular form", icon:"📊" },
    { text:"Compare the two reports side by side", icon:"🔄" },
    { text:"Are there any abnormal test results?", icon:"⚠️" },
    { text:"Show me all test results with abnormal values", icon:"🔍" },
    { text:"What medical conditions do these results indicate?", icon:"🏥" },
    { text:"List all blood test results with their ranges", icon:"📋" },
  ];

  return (
    <div style={{ minHeight:'100vh', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <AnimatedBackground />

      {/* Header */}
      <div style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.3)', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', position:'relative', zIndex:10 }}>
        <div style={{ padding:'24px 48px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(102,126,234,0.4)' }}><Hospital size={32} color="white" /></div>
            <div>
              <h1 style={{ fontSize:'2rem', fontWeight:800, margin:0, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>MedAnalyze</h1>
              <p style={{ fontSize:'0.9375rem', color:'#6b7280', margin:'4px 0 0 0', fontWeight:500 }}>AI-Powered Medical Intelligence Platform</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ padding:'8px 16px', background:'rgba(102,126,234,0.1)', borderRadius:10, display:'flex', alignItems:'center', gap:8 }}><Shield size={18} style={{ color:'#667eea' }} /><span style={{ fontSize:'0.8125rem', fontWeight:600, color:'#667eea' }}>HIPAA Compliant</span></div>
            <div style={{ padding:'8px 16px', background:'rgba(34,197,94,0.1)', borderRadius:10, display:'flex', alignItems:'center', gap:8 }}><Zap size={18} style={{ color:'#22c55e' }} /><span style={{ fontSize:'0.8125rem', fontWeight:600, color:'#22c55e' }}>AI Enhanced</span></div>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', flex:1, overflow:'hidden', height:'100%' }}>
        {/* Sidebar */}
        <div style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(255,255,255,0.3)', padding:'32px 24px', overflowY:'auto', boxShadow:'4px 0 24px rgba(0,0,0,0.06)' }}>
          <div style={{ background:'rgba(255,255,255,0.9)', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.08)', padding:28, border:'1px solid rgba(255,255,255,0.4)' }}>
            <h3 style={{ fontSize:'1.25rem', fontWeight:700, marginBottom:24, display:'flex', alignItems:'center', gap:12, color:'#1f2937' }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg, #667eea, #764ba2)', display:'flex', alignItems:'center', justifyContent:'center' }}><Upload size={18} color="white" /></div>
              Upload Reports
            </h3>
            <div style={{ border:'3px dashed rgba(102,126,234,0.3)', borderRadius:16, padding:'32px 24px', textAlign:'center', marginBottom:20, cursor:'pointer', transition:'all 0.4s ease', background:'rgba(102,126,234,0.03)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#667eea'; e.currentTarget.style.background='rgba(102,126,234,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(102,126,234,0.3)'; e.currentTarget.style.background='rgba(102,126,234,0.03)'; }}>
              <input type="file" multiple accept="image/*,.pdf,application/pdf" onChange={handleFileChange} style={{ display:'none' }} id="file-upload" />
              <label htmlFor="file-upload" style={{ cursor:'pointer', display:'block' }}>
                <div style={{ width:64, height:64, margin:'0 auto 16px', borderRadius:16, background:'linear-gradient(135deg, #667eea, #764ba2)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(102,126,234,0.3)' }}><FileText size={32} color="white" /></div>
                <p style={{ fontSize:'1rem', color:'#1f2937', margin:'0 0 8px 0', fontWeight:600 }}>{files.length>0 ? `${files.length} files selected` : 'Drop files or click to upload'}</p>
                <p style={{ fontSize:'0.8125rem', color:'#9ca3af', margin:0 }}>PNG, JPG, JPEG, PDF supported</p>
              </label>
            </div>
            {files.length>0 && (
              <div style={{ marginBottom:20, maxHeight:120, overflowY:'auto', background:'rgba(249,250,251,0.6)', borderRadius:12, padding:12 }}>
                {files.map((f, i) => <div key={i} style={{ padding:'8px 12px', display:'flex', alignItems:'center', gap:8, fontSize:'0.8125rem', color:'#6b7280' }}><FileText size={14} style={{ color:'#667eea' }} /><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span></div>)}
              </div>
            )}
            <button onClick={handleUploadAndProcess} disabled={!files.length || processing}
              style={{ width:'100%', background: !files.length||processing ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white', padding:'16px 24px', borderRadius:12, fontWeight:700, border:'none', cursor: !files.length||processing ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:12, fontSize:'1rem', boxShadow: !files.length||processing ? 'none' : '0 8px 24px rgba(102,126,234,0.4)', transition:'all 0.3s ease' }}>
              {processing ? <><Loader style={{ animation:'spin 1s linear infinite' }} size={20} />Processing…</> : <><Sparkles size={20} />Process with AI</>}
            </button>
            <div style={{ marginTop:28, paddingTop:28, borderTop:'1px solid rgba(229,231,235,0.3)' }}>
              <h4 style={{ fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:10, fontSize:'1rem', color:'#374151' }}><Database size={20} style={{ color:'#667eea' }} />Database Status</h4>
              {dbStatus?.exists ? (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, color:'#22c55e', marginBottom:12, padding:12, background:'rgba(34,197,94,0.1)', borderRadius:10 }}><CheckCircle size={20} /><span style={{ fontSize:'0.9375rem', fontWeight:600 }}>System Ready</span></div>
                  <div style={{ background:'rgba(249,250,251,0.6)', borderRadius:10, padding:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'0.875rem', color:'#6b7280', fontWeight:500 }}>Total Reports:</span>
                      <span style={{ fontSize:'1.25rem', fontWeight:700, color:'#667eea' }}>{dbStatus.count||0}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:10, color:'#f59e0b', padding:12, background:'rgba(245,158,11,0.1)', borderRadius:10 }}><AlertCircle size={20} /><span style={{ fontSize:'0.9375rem', fontWeight:600 }}>No data available</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', display:'flex', flexDirection:'column', overflow:'hidden', height:'100%' }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'2px solid rgba(229,231,235,0.5)', background:'rgba(255,255,255,0.6)', backdropFilter:'blur(10px)' }}>
            {[
              { id:'chat',          label:'AI Assistant',    icon:'🤖' },
              { id:'summary',       label:'Report Summary',  icon:'📊' },
              { id:'compare',       label:'Compare Reports', icon:'🔄' },
              { id:'prescriptions', label:'Prescriptions',   icon:'💊' },
              { id:'video',         label:'Video Consult',   icon:'📹' },
              { id:'samples',       label:'Sample Queries',  icon:'💡' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ flex:1, padding:'20px 16px', fontWeight:600, fontSize:'0.875rem', border:'none', background: activeTab===tab.id ? 'rgba(102,126,234,0.1)' : 'transparent', color: activeTab===tab.id ? '#667eea' : '#6b7280', borderBottom: activeTab===tab.id ? '3px solid #667eea' : 'none', cursor:'pointer', transition:'all 0.3s ease', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <span style={{ fontSize:'1.1rem' }}>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {dbStatus?.exists && (
            <div style={{ background:'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.15))', padding:'14px 24px', borderBottom:'1px solid rgba(251,191,36,0.3)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg, #fbbf24, #f59e0b)', display:'flex', alignItems:'center', justifyContent:'center' }}><Stethoscope size={18} color="white" /></div>
                <span style={{ fontSize:'0.9375rem', color:'#78350f', fontWeight:600 }}>Need medical advice? Connect with verified specialists instantly</span>
              </div>
              <button onClick={() => setConsultationModal({ isOpen:true, abnormalTests:[{ testName:'General Health Check', value:'Consultation', normalRange:'N/A', specialty:'Hematologist' }], patientName:'Patient' })}
                style={{ background:'linear-gradient(135deg, #ef4444, #f59e0b)', color:'white', padding:'10px 20px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(239,68,68,0.3)' }}>
                <Calendar size={16} />Find Doctors
              </button>
            </div>
          )}

          <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:0 }}>

            {/* ── CHAT ── */}
            {activeTab==='chat' && (
              <div style={{ display:'grid', gridTemplateRows:'1fr auto', height:'100%', overflow:'hidden' }}>
                <div style={{ overflowY:'auto', padding:32 }}>
                  {messages.map((msg, idx) => (
                    <div key={idx} style={{ display:'flex', justifyContent: msg.role==='user'?'flex-end':'flex-start', marginBottom:20 }}>
                      <div style={{ maxWidth: msg.tableData?'95%':'75%', borderRadius:16, padding:'20px 24px', background: msg.role==='user'?'linear-gradient(135deg, #667eea 0%, #764ba2 100%)':'rgba(255,255,255,0.95)', color: msg.role==='user'?'white':'#1f2937', boxShadow: msg.role==='user'?'0 8px 24px rgba(102,126,234,0.3)':'0 4px 16px rgba(0,0,0,0.08)' }}>
                        <MessageContent content={msg.content} tableData={msg.tableData} abnormalTests={msg.abnormalTests} onConsultationClick={() => setConsultationModal({ isOpen:true, abnormalTests:msg.abnormalTests||[], patientName:msg.patientName||'' })} />
                      </div>
                    </div>
                  ))}
                  {querying && (
                    <div style={{ display:'flex', justifyContent:'flex-start' }}>
                      <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:16, padding:'20px 24px', boxShadow:'0 4px 16px rgba(0,0,0,0.08)', display:'flex', alignItems:'center', gap:12 }}>
                        <Loader style={{ animation:'spin 1s linear infinite', color:'#667eea' }} size={20} />
                        <span style={{ fontSize:'0.875rem', color:'#6b7280' }}>AI is thinking…</span>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ borderTop:'1px solid rgba(229,231,235,0.5)', padding:'20px 32px', background:'rgba(255,255,255,0.98)', backdropFilter:'blur(20px)', boxShadow:'0 -4px 24px rgba(0,0,0,0.1)' }}>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <input type="text" value={isListening ? transcript : currentMessage} onChange={e => setCurrentMessage(e.target.value)} onKeyPress={e => e.key==='Enter' && !isListening && handleSendMessage()} placeholder={isListening ? "Listening…" : "Ask about medical reports…"} disabled={querying||!dbStatus?.exists||isListening}
                      style={{ flex:1, border:'2px solid rgba(102,126,234,0.2)', borderRadius:12, padding:'16px 20px', fontSize:'1rem', outline:'none', background: isListening?'rgba(102,126,234,0.1)':'rgba(255,255,255,0.9)', fontWeight:500 }} />
                    <button onClick={isListening ? stopListening : startListening} disabled={querying||!dbStatus?.exists}
                      style={{ background: isListening?'linear-gradient(135deg, #ef4444, #dc2626)':'linear-gradient(135deg, #22c55e, #16a34a)', color:'white', padding:'16px 20px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                      {isListening ? 'Stop' : 'Voice'}
                    </button>
                    <button onClick={handleSendMessage} disabled={querying||!currentMessage.trim()||!dbStatus?.exists||isListening}
                      style={{ background: querying||!currentMessage.trim()||!dbStatus?.exists||isListening?'#d1d5db':'linear-gradient(135deg, #667eea, #764ba2)', color:'white', padding:'16px 24px', borderRadius:12, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontWeight:700 }}>
                      <Send size={20} />Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── SUMMARY ── */}
            {activeTab==='summary' && (
              <div style={{ flex:1, overflowY:'auto', padding:32 }}>
                <h3 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:24, color:'#1f2937' }}>Processing Summary</h3>
                {processedReports.length>0 ? (
                  <div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:32 }}>
                      {[
                        { label:'Total Reports', value:processedReports.length, color:'#3b82f6', bg:'rgba(59,130,246,0.15)' },
                        { label:'Successful', value:processedReports.filter(r=>r.success).length, color:'#22c55e', bg:'rgba(34,197,94,0.15)' },
                        { label:'Failed', value:processedReports.filter(r=>!r.success).length, color:'#ef4444', bg:'rgba(239,68,68,0.15)' },
                      ].map((s,i) => (
                        <div key={i} style={{ background:s.bg, borderRadius:16, padding:24 }}>
                          <p style={{ fontSize:'0.875rem', color:'#6b7280', margin:'0 0 8px 0', fontWeight:600 }}>{s.label}</p>
                          <p style={{ fontSize:'2.5rem', fontWeight:800, color:s.color, margin:0 }}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    {visualizations.length>0 && (
                      <div style={{ marginBottom:32 }}>
                        <h4 style={{ fontSize:'1.25rem', fontWeight:700, marginBottom:20, color:'#1f2937' }}>📊 Test Results Visualizations</h4>
                        {visualizations.map((viz,i) => <TestResultsChart key={i} visualization={viz} />)}
                      </div>
                    )}
                    {processedReports.filter(r=>r.success).map((report,idx) => (
                      <details key={idx} style={{ background:'rgba(255,255,255,0.95)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:16, marginBottom:16, overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
                        <summary style={{ cursor:'pointer', padding:'20px 24px', fontWeight:700, fontSize:'1rem', display:'flex', alignItems:'center', gap:12, color:'#1f2937' }}><FileText size={20} style={{ color:'#667eea' }} />{report.image_filename}</summary>
                        <div style={{ padding:24, background:'rgba(249,250,251,0.5)', borderTop:'1px solid rgba(229,231,235,0.3)' }}>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                            <div style={{ background:'rgba(255,255,255,0.8)', padding:16, borderRadius:12 }}>
                              <p style={{ fontWeight:700, marginBottom:12, color:'#667eea' }}>Patient Information</p>
                              <p><strong>Name:</strong> {report.structured_json?.patient_info?.name||'N/A'}</p>
                              <p><strong>Age:</strong> {report.structured_json?.patient_info?.age||'N/A'}</p>
                              <p><strong>Gender:</strong> {report.structured_json?.patient_info?.gender||'N/A'}</p>
                            </div>
                            <div style={{ background:'rgba(255,255,255,0.8)', padding:16, borderRadius:12 }}>
                              <p style={{ fontWeight:700, marginBottom:12, color:'#667eea' }}>Hospital Information</p>
                              <p><strong>Hospital:</strong> {report.structured_json?.hospital_info?.hospital_name||'N/A'}</p>
                              <p><strong>Type:</strong> {report.structured_json?.report_info?.report_type||'N/A'}</p>
                              <p><strong>Date:</strong> {report.structured_json?.report_info?.report_date||'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign:'center', padding:'80px 40px', background:'rgba(255,255,255,0.6)', borderRadius:20, border:'2px dashed rgba(102,126,234,0.3)' }}>
                    <FileText size={40} style={{ color:'#667eea', opacity:0.5, marginBottom:16 }} />
                    <h4 style={{ color:'#1f2937' }}>No Reports Yet</h4>
                    <p style={{ color:'#6b7280' }}>Upload medical reports to see your processing summary here</p>
                  </div>
                )}
              </div>
            )}

            {/* ── COMPARE ── */}
            {activeTab==='compare' && (
              <div style={{ flex:1, overflowY:'auto', padding:32 }}>
                <h3 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:16, color:'#1f2937' }}>Compare Two Reports</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32 }}>
                  {[1,2].map(n => {
                    const isExisting  = n===1 ? compareReports.useExisting1 : compareReports.useExisting2;
                    const setExisting = (v) => setCompareReports(p => ({ ...p, [n===1?'useExisting1':'useExisting2']:v }));
                    const selected    = n===1 ? compareReports.selectedReport1 : compareReports.selectedReport2;
                    const setSelected = (v) => setCompareReports(p => ({ ...p, [n===1?'selectedReport1':'selectedReport2']:v }));
                    const file        = n===1 ? compareReports.report1File : compareReports.report2File;
                    const setFile     = (f) => setCompareReports(p => ({ ...p, [n===1?'report1File':'report2File']:f }));
                    return (
                      <div key={n} style={{ background:'rgba(255,255,255,0.95)', borderRadius:16, padding:24, boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
                        <h4 style={{ fontWeight:700, marginBottom:20, color:'#1f2937' }}>Report {n}</h4>
                        <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, cursor:'pointer' }}><input type="radio" checked={isExisting} onChange={() => setExisting(true)} /><span style={{ fontWeight:600 }}>Use Existing</span></label>
                        {isExisting && <select value={selected||''} onChange={e => setSelected(e.target.value)} style={{ width:'100%', padding:12, borderRadius:10, border:'2px solid rgba(102,126,234,0.2)', marginBottom:12, outline:'none' }}><option value="">Select a report…</option>{compareReports.availableReports.map((r,i) => <option key={i} value={r.id}>{r.patient_name} - {r.report_date}</option>)}</select>}
                        <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, cursor:'pointer' }}><input type="radio" checked={!isExisting} onChange={() => setExisting(false)} /><span style={{ fontWeight:600 }}>Upload New</span></label>
                        {!isExisting && <div style={{ border:'2px dashed rgba(102,126,234,0.3)', borderRadius:12, padding:20, textAlign:'center' }}><input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} style={{ display:'none' }} id={`r${n}`} /><label htmlFor={`r${n}`} style={{ cursor:'pointer' }}><FileText size={28} style={{ color:'#667eea', marginBottom:8 }} /><p style={{ fontSize:'0.875rem', color:'#6b7280', margin:0 }}>{file ? file.name : 'Click to upload'}</p></label></div>}
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleCompareReports} disabled={compareReports.comparing}
                  style={{ width:'100%', background: compareReports.comparing?'#d1d5db':'linear-gradient(135deg, #667eea, #764ba2)', color:'white', padding:16, borderRadius:12, border:'none', cursor: compareReports.comparing?'not-allowed':'pointer', fontWeight:700, fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:32, boxShadow:'0 8px 24px rgba(102,126,234,0.4)' }}>
                  {compareReports.comparing ? <><Loader style={{ animation:'spin 1s linear infinite' }} size={20} />Comparing…</> : <><TrendingUp size={20} />Compare Reports</>}
                </button>
                {compareReports.comparisonResult && (
                  <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:16, padding:28, boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
                    <h4 style={{ fontSize:'1.25rem', fontWeight:700, marginBottom:20, color:'#1f2937' }}>Comparison Results</h4>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                      {[compareReports.comparisonResult.report1, compareReports.comparisonResult.report2].map((r,i) => (
                        <div key={i} style={{ padding:16, background:'rgba(102,126,234,0.1)', borderRadius:12 }}>
                          <p style={{ fontSize:'0.875rem', color:'#6b7280', margin:'0 0 4px' }}>Report {i+1}</p>
                          <p style={{ fontWeight:700, color:'#1f2937', margin:'0 0 4px' }}>{r?.patient_name}</p>
                          <p style={{ fontSize:'0.8125rem', color:'#6b7280', margin:0 }}>{r?.report_date} • {r?.hospital_name}</p>
                        </div>
                      ))}
                    </div>
                    {compareReports.comparisonResult.comparison_table && <ComparisonTable tableData={compareReports.comparisonResult.comparison_table} />}
                  </div>
                )}
              </div>
            )}

            {/* ── PRESCRIPTIONS ── */}
            {activeTab==='prescriptions' && (
              <div style={{ flex:1, overflowY:'auto', padding:32 }}>
                <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:20, padding:28, marginBottom:24, boxShadow:'0 8px 32px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ fontSize:'1.25rem', fontWeight:700, marginBottom:20, color:'#1f2937' }}>💊 Upload Prescription</h3>
                  <div style={{ border:'3px dashed rgba(102,126,234,0.3)', borderRadius:16, padding:'32px 24px', textAlign:'center', marginBottom:20 }}>
                    <input type="file" accept="image/*" onChange={handlePrescriptionFile} style={{ display:'none' }} id="prx-upload" />
                    <label htmlFor="prx-upload" style={{ cursor:'pointer', display:'block' }}>
                      <div style={{ fontSize:'3rem', marginBottom:12 }}>💊</div>
                      <p style={{ fontWeight:600, color:'#1f2937', margin:'0 0 8px' }}>{prescriptionFile ? prescriptionFile.name : 'Drop prescription or click to upload'}</p>
                      <p style={{ fontSize:'0.8125rem', color:'#9ca3af', margin:0 }}>Supports handwritten prescriptions (PNG, JPG)</p>
                    </label>
                  </div>
                  <button onClick={handleProcessPrescription} disabled={!prescriptionFile||processingPrescription}
                    style={{ width:'100%', background: !prescriptionFile||processingPrescription?'#d1d5db':'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white', padding:'16px 24px', borderRadius:12, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
                    {processingPrescription ? <><Loader style={{ animation:'spin 1s linear infinite' }} size={20} />Processing…</> : <><Sparkles size={20} />Extract Medicines</>}
                  </button>
                </div>
                {prescriptionData && (
                  <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:20, padding:28, boxShadow:'0 8px 32px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontSize:'1.25rem', fontWeight:700, marginBottom:20, color:'#1f2937' }}>Prescription Details</h3>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                      {[['Doctor',prescriptionData.doctor_name],['Patient',prescriptionData.patient_name],['Date',prescriptionData.date]].map(([l,v],i) => v&&(
                        <div key={i} style={{ padding:12, background:'rgba(102,126,234,0.1)', borderRadius:12 }}>
                          <div style={{ fontSize:'0.75rem', color:'#6b7280', marginBottom:4 }}>{l}</div>
                          <div style={{ fontWeight:600, color:'#1f2937' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {prescriptionData.medicines?.map((med, idx) => (
                      <div key={idx} style={{ background:'rgba(249,250,251,0.8)', borderRadius:12, padding:20, marginBottom:12, border:'1px solid rgba(229,231,235,0.5)' }}>
                        <h5 style={{ fontSize:'1.0625rem', fontWeight:700, color:'#1f2937', marginBottom:8 }}>{med.name}</h5>
                        <div style={{ display:'flex', gap:16, fontSize:'0.875rem', marginBottom:8, flexWrap:'wrap' }}>
                          {[['Dosage',med.dosage],['Timing',med.timing],['Duration',med.duration]].map(([l,v],i) => <div key={i}><span style={{ color:'#6b7280' }}>{l}: </span><span style={{ fontWeight:600, color:'#667eea' }}>{v}</span></div>)}
                        </div>
                        {med.instructions && <div style={{ fontSize:'0.8125rem', color:'#6b7280', fontStyle:'italic', marginBottom:10 }}>📝 {med.instructions}</div>}
                        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                          <span style={{ fontSize:'0.8125rem', fontWeight:600, color:'#374151' }}>Buy Online:</span>
                          {med.buy_links?.map((link,li) => {
                            const name = link.includes('1mg')?'1mg':link.includes('netmeds')?'Netmeds':'PharmEasy';
                            return <a key={li} href={link} target="_blank" rel="noopener noreferrer" style={{ padding:'6px 12px', background:'linear-gradient(135deg, #667eea, #764ba2)', color:'white', borderRadius:8, fontSize:'0.75rem', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}><ExternalLink size={12} />{name}</a>;
                          })}
                        </div>
                      </div>
                    ))}
                    <div style={{ display:'flex', gap:12, marginTop:16 }}>
                      <input value={prescriptionQuery} onChange={e => setPrescriptionQuery(e.target.value)} onKeyPress={e => e.key==='Enter' && handleSendPrescriptionQuery()} placeholder="Ask about medicines, dosages…" disabled={queryingPrescription}
                        style={{ flex:1, border:'2px solid rgba(102,126,234,0.2)', borderRadius:12, padding:'14px 18px', fontSize:'1rem', outline:'none' }} />
                      <button onClick={handleSendPrescriptionQuery} disabled={queryingPrescription||!prescriptionQuery.trim()}
                        style={{ background:'linear-gradient(135deg, #667eea, #764ba2)', color:'white', padding:'14px 24px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                        <Send size={20} />Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── VIDEO CONSULT ── */}
            {activeTab==='video' && (
              <div style={{ flex:1, overflowY:'auto', padding:32 }}>
                <VideoConsultTab />
              </div>
            )}

            {/* ── SAMPLES ── */}
            {activeTab==='samples' && (
              <div style={{ flex:1, overflowY:'auto', padding:32 }}>
                <h3 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:16, color:'#1f2937' }}>Try These Sample Queries</h3>
                <p style={{ fontSize:'0.9375rem', color:'#6b7280', marginBottom:32, lineHeight:1.6 }}>Click any query below to try it instantly.</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
                  {sampleQueries.map((query, idx) => (
                    <button key={idx}
                      onClick={() => { setCurrentMessage(query.text); setActiveTab('chat'); setTimeout(handleSendMessage, 150); }}
                      disabled={!dbStatus?.exists}
                      style={{ textAlign:'left', padding:24, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:16, cursor: !dbStatus?.exists?'not-allowed':'pointer', opacity: !dbStatus?.exists?0.5:1, transition:'all 0.3s ease', boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}
                      onMouseEnter={e => { if (dbStatus?.exists) { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(102,126,234,0.2)'; } }}
                      onMouseLeave={e => { if (dbStatus?.exists) { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.06)'; } }}>
                      <div style={{ fontSize:'1.5rem', marginBottom:12 }}>{query.icon}</div>
                      <div style={{ fontWeight:600, marginBottom:8, color:'#1f2937', fontSize:'0.9375rem' }}>{query.text}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, color:'#667eea', fontSize:'0.8125rem', fontWeight:600 }}>Try this query <ChevronRight size={14} /></div>
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
        onClose={() => setConsultationModal({ isOpen:false, abnormalTests:[], patientName:'' })}
        abnormalTests={consultationModal.abnormalTests}
        patientName={consultationModal.patientName}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(249,250,251,0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MediExtractApp;
