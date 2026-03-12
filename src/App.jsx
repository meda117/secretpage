import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, getDoc, doc, 
  getDocs, serverTimestamp, query, orderBy, updateDoc, where, onSnapshot, deleteDoc, arrayUnion
} from 'firebase/firestore'; 
import {
  getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword,
  setPersistence, inMemoryPersistence
} from 'firebase/auth';
import { 
  Heart, Music, Image as ImageIcon, Calendar, Lock, X, Play, Pause, SkipForward, SkipBack, ListMusic,
  Sparkles, Link as LinkIcon, Trash2, Plus, Users, Eye, Copy, LayoutDashboard, LogOut,
  Globe, Star, Gift, Sun, Moon, Rocket, LayoutList, Gem, Home, MessageCircle, Send,
  Cake, HeartHandshake, Zap, Award, Lightbulb, Smile, Camera, Infinity, Flame, Bird, 
  Anchor, Coffee, Crown, Key, MapPin, Shield, CheckCircle, Check, CheckCheck, RefreshCw, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, ListOrdered, Milestone, Edit3, Type, UploadCloud, MonitorPlay, Video as VideoIcon, AlertCircle, Loader2, FileAudio, Wifi, WifiOff, Info, Clock, Palette, Quote, Disc, Film, MailOpen, XCircle, TrendingUp, Phone, User, Activity, Gamepad2, Menu, BarChart3, Settings, BellRing, MessageSquare, PhoneCall, Move, Mic, Square, Smartphone, Laptop, Download, Dices
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAxgxawMWe6gRc6PZEj4qGsY21VrLW7CAQ",
  authDomain: "secret-72655.firebaseapp.com",
  projectId: "secret-72655",
  storageBucket: "secret-72655.firebasestorage.app",
  messagingSenderId: "720937094156",
  appId: "1:720937094156:web:8d8d8be4384f147f317229",
  measurementId: "G-264KMFBJFX"
};

// --- Cloudinary ---
const CLOUDINARY_CLOUD_NAME = "de6fxtgrc"; 
const CLOUDINARY_UPLOAD_PRESET = "ncnopwyi"; 

// Helper for fast loading and compressing images automatically
const getOptimizedUrl = (url, isVideo = false) => {
    if (!url || isVideo) return url;
    if (url.includes('res.cloudinary.com')) {
        return url.replace('/upload/', '/upload/w_800,q_auto,f_auto/');
    }
    return url;
};

// Initialize Firebase
let db;
let auth;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

// --- Audio Helper for Secret Notifications ---
const playSoftNotificationChime = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.1); 

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
        console.log("Audio play blocked", e);
    }
};

// --- Audio Helper for New Chat Messages ---
const playChatNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.log("Chat audio play blocked", e);
    }
};

// --- Icon Library ---
const ICON_LIBRARY = {
  Heart, Star, Gift, Sparkles, Flame, Infinity, 
  Smile, Camera, Music, Bird, Anchor, Coffee, 
  Crown, Key, MapPin, Gem, Sun, Moon, Rocket, Zap, Lock, Shield, BellRing, ListMusic
};

// --- Animations ---
const ANIMATION_TYPES = [
  { id: 'classic', name: 'كلاسيكي', icon: '🫧' },
  { id: 'love', name: 'قلوب', icon: '❤️' },
  { id: 'romantic', name: 'رومانسي/جواز', icon: '💍' },
  { id: 'stars', name: 'سماء ونجوم', icon: '✨' },
  { id: 'fireflies', name: 'يراعات', icon: '🧚' },
  { id: 'snow', name: 'ثلج', icon: '❄️' },
  { id: 'confetti', name: 'احتفال', icon: '🎉' },
  { id: 'birthday', name: 'عيد ميلاد', icon: '🎂' },
  { id: 'ramadan', name: 'رمضان', icon: '🌙' },
  { id: 'eid', name: 'العيد', icon: '🎈' },
  { id: 'friends', name: 'أصحاب', icon: '🥂' },
  { id: 'matrix', name: 'ماتريكس', icon: '💻' }
];

// --- Themes ---
const PREDEFINED_THEMES = [
  { id: 'romantic_dark', name: 'سهرة رومانسية', animation: 'love', colors: { start: '#2a0815', end: '#0f050b', accent: '#ff4d6d' } },
  { id: 'engagement', name: 'خطوبة وعشاق', animation: 'romantic', colors: { start: '#0d1b2a', end: '#040810', accent: '#e0a96d' } },
  { id: 'birthday_pop', name: 'عيد ميلاد مبهج', animation: 'confetti', colors: { start: '#3a0ca3', end: '#14053e', accent: '#f72585' } },
  { id: 'birthday_warm', name: 'حفلة ميلاد', animation: 'birthday', colors: { start: '#450a0a', end: '#170303', accent: '#f59e0b' } },
  { id: 'starry_night', name: 'سماء مرصعة بالنجوم', animation: 'stars', colors: { start: '#0b0c10', end: '#020204', accent: '#4ea8de' } },
  { id: 'winter_snow', name: 'شتاء دافئ', animation: 'snow', colors: { start: '#1b263b', end: '#0a0f18', accent: '#e0e1dd' } },
  { id: 'fireflies_forest', name: 'غابة اليراعات', animation: 'fireflies', colors: { start: '#132a13', end: '#040d04', accent: '#a7c957' } },
  { id: 'ramadan_gold', name: 'ليالي رمضان', animation: 'ramadan', colors: { start: '#073b4c', end: '#021117', accent: '#ffd166' } },
  { id: 'eid_joy', name: 'فرحة العيد', animation: 'eid', colors: { start: '#006d77', end: '#00262a', accent: '#83c5be' } },
  { id: 'best_friends', name: 'أصحاب العمر', animation: 'friends', colors: { start: '#451a03', end: '#1a0a01', accent: '#ffb703' } },
  { id: 'luxury_gold', name: 'فخامة كلاسيكية', animation: 'classic', colors: { start: '#1a1a1a', end: '#050505', accent: '#d4af37' } },
  { id: 'ocean_breeze', name: 'نسيم المحيط', animation: 'classic', colors: { start: '#003f5c', end: '#001a26', accent: '#00b4d8' } },
  { id: 'sunset_love', name: 'غروب الشمس', animation: 'love', colors: { start: '#4a0e4e', end: '#1a051d', accent: '#f8961e' } },
  { id: 'neon_cyber', name: 'نيون سايبر', animation: 'matrix', colors: { start: '#10002b', end: '#05000d', accent: '#e01e37' } },
  { id: 'pure_love', name: 'حب نقي', animation: 'love', colors: { start: '#3d0000', end: '#140000', accent: '#ff0000' } },
  { id: 'magical_night', name: 'ليلة سحرية', animation: 'fireflies', colors: { start: '#240046', end: '#0c0018', accent: '#ff9e00' } }
];

// --- Components ---

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration, isVisible]);

    return <span ref={ref}>{count.toLocaleString('en-US')}{suffix}</span>;
};

const DynamicBackground = ({ isDarkMode, type = 'classic', customColors }) => {
    const particles = useMemo(() => {
        const count = ['stars', 'snow', 'confetti'].includes(type) ? 100 : ['ramadan', 'eid', 'birthday', 'romantic', 'friends', 'portfolio-mixed'].includes(type) ? 30 : 40; 
        return [...Array(count)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: type === 'snow' ? `-${Math.random() * 20}%` : `${Math.random() * 100}%`,
            size: Math.random() * (type === 'stars' ? 3 : 15) + 5 + 'px', 
            duration: Math.random() * 10 + 5 + 's',
            delay: `-${Math.random() * 10}s`,
            rotation: `${Math.random() * 360}deg`
        }));
    }, [type]);

    const bgStyle = customColors?.start && customColors?.end 
        ? { background: `linear-gradient(180deg, ${customColors.start} 0%, ${customColors.end} 100%)` } 
        : {};
    const baseGradient = customColors?.start ? '' : (isDarkMode ? 'bg-[#050511]' : 'bg-[#fff0f5]');

    return (
        <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden h-full w-full ${baseGradient}`} style={bgStyle}>
            {(!['matrix', 'stars'].includes(type)) && (
                <>
                    <div className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 animate-float ${isDarkMode ? 'bg-indigo-600' : 'bg-rose-400'}`}></div>
                    <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 animate-float ${isDarkMode ? 'bg-purple-600' : 'bg-purple-400'}`} style={{animationDelay: '2s'}}></div>
                </>
            )}

            {particles.map((p, index) => {
                const glowStyle = { 
                    left: p.left, top: p.top, width: p.size, height: p.size, 
                    animationDuration: p.duration, animationDelay: p.delay,
                };

                if (type === 'classic') return <div key={p.id} className={`absolute rounded-full animate-rise ${isDarkMode ? 'bg-white/10' : 'bg-indigo-400/20'}`} style={{ ...glowStyle, top: 'auto', bottom: '-20px', boxShadow: `0 0 10px 2px rgba(255, 255, 255, 0.2)` }}></div>;
                if (type === 'love') return <div key={p.id} className={`absolute animate-rise text-red-500/50 drop-shadow-md`} style={{ ...glowStyle, top: 'auto', bottom: '-20px', fontSize: parseInt(p.size)*1.5 + 'px' }}>{index % 3 === 0 ? '💖' : '❤️'}</div>;
                if (type === 'romantic') return <div key={p.id} className={`absolute animate-slow-drift text-rose-400/60 drop-shadow-lg`} style={{ ...glowStyle, top: 'auto', bottom: '-50px', fontSize: parseInt(p.size)*2 + 'px', filter: 'blur(0.5px)' }}>{['🌹', '✨', '💍', '🤍'][index % 4]}</div>;
                if (type === 'stars') return <div key={p.id} className={`absolute rounded-full animate-twinkle bg-white shadow-[0_0_5px_white]`} style={{...glowStyle, boxShadow: '0 0 8px 2px white'}}></div>;
                if (type === 'snow') return <div key={p.id} className={`absolute rounded-full animate-fall bg-white/70`} style={{...glowStyle, boxShadow: '0 0 5px white'}}></div>;
                if (type === 'fireflies') return <div key={p.id} className={`absolute rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-float`} style={{ left: p.left, top: p.top, width: '6px', height: '6px', animationDuration: p.duration, animationDelay: p.delay }}></div>;
                if (type === 'ramadan') return <div key={p.id} className={`absolute animate-rise opacity-70`} style={{ ...glowStyle, top: 'auto', bottom: '-50px', fontSize: parseInt(p.size)*2 + 'px' }}>{['🌙', '⭐', '✨', '🏮'][index % 4]}</div>;
                if (type === 'eid') return <div key={p.id} className={`absolute animate-rise opacity-80`} style={{ ...glowStyle, top: 'auto', bottom: '-50px', fontSize: parseInt(p.size)*2 + 'px' }}>{['🎈', '🎊', '🎇', '✨'][index % 4]}</div>;
                if (type === 'birthday') return <div key={p.id} className={`absolute animate-rise opacity-80`} style={{ ...glowStyle, top: 'auto', bottom: '-50px', fontSize: parseInt(p.size)*2 + 'px' }}>{['🎈', '🎁', '🎂', '🎉'][index % 4]}</div>;
                if (type === 'friends') return <div key={p.id} className={`absolute animate-bounce-float opacity-70`} style={{ ...glowStyle, top: 'auto', bottom: '-50px', fontSize: parseInt(p.size)*2 + 'px' }}>{['✌️', '🥂', '💛', '✨'][index % 4]}</div>;
                if (type === 'matrix') return <div key={p.id} className={`absolute animate-fall text-green-500 font-mono text-xs opacity-50`} style={{ ...glowStyle }}>{String.fromCharCode(0x30A0 + Math.random() * 96)}</div>;
                if (type === 'portfolio-mixed') return <div key={p.id} className={`absolute animate-slow-drift opacity-60 hover:opacity-100 transition-opacity`} style={{ ...glowStyle, top: 'auto', bottom: '-50px', fontSize: parseInt(p.size)*1.5 + 'px' }}>{['✨', '💖', '🎁', '🎉', '🎈', '🔮'][index % 6]}</div>;

                return null;
            })}
            <style>{`
                @keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(30px, -30px) rotate(10deg); } }
                @keyframes rise { 0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-100vh) scale(1.5) rotate(45deg); opacity: 0; } }
                @keyframes slow-drift { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 50% { opacity: 0.6; transform: translateY(-50vh) translateX(50px) rotate(180deg); } 100% { transform: translateY(-100vh) translateX(-50px) rotate(360deg); opacity: 0; } }
                @keyframes bounce-float { 0%, 100% { transform: translateY(0) scale(1); opacity:0;} 50% { transform: translateY(-80vh) scale(1.2); opacity:1;} }
                @keyframes fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } }
                @keyframes twinkle { 0%, 100% { opacity: 0.1; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
                
                .animate-float { animation: float 10s ease-in-out infinite; }
                .animate-rise { animation: rise linear infinite; }
                .animate-slow-drift { animation: slow-drift linear infinite; }
                .animate-bounce-float { animation: bounce-float cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                .animate-fall { animation: fall linear infinite; }
                .animate-twinkle { animation: twinkle linear infinite; }
                
                @keyframes soft-pulse { 0%, 100% { opacity: 1; transform: scale(1); filter: brightness(1); } 50% { opacity: 0.8; transform: scale(0.98); filter: brightness(1.2); } }
                .animate-soft-pulse { animation: soft-pulse 3s ease-in-out infinite; }
                
                /* POPUP ANIMATION (Spring Physics) */
                @keyframes modal-spring {
                    0% { opacity: 0; transform: scale(0.5) translateY(50px); }
                    60% { opacity: 1; transform: scale(1.05) translateY(-10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-spring { animation: modal-spring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                
                /* Inner Glowing Edge Animation */
                @keyframes edge-glow {
                    0%, 100% { box-shadow: inset 0 0 20px var(--accent-color-30), inset 0 0 10px var(--accent-color-10), 0 0 10px rgba(0,0,0,0.5); border-color: var(--accent-color-50); }
                    50% { box-shadow: inset 0 0 40px var(--accent-color-50), inset 0 0 20px var(--accent-color-30), 0 0 15px rgba(0,0,0,0.7); border-color: var(--accent-color); }
                }
                .animate-edge-glow { animation: edge-glow 3s infinite alternate; }

                /* Error Shake Animation */
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }

                /* Cinematic Fade & Blur Out */
                @keyframes blur-out-scale {
                    0% { opacity: 1; transform: scale(1); filter: blur(0px); }
                    100% { opacity: 0; transform: scale(1.2); filter: blur(10px); }
                }
                .animate-blur-out { animation: blur-out-scale 0.8s ease-in forwards; }
            `}</style>
        </div>
    );
};

const LoadingScreen = ({ text = "جاري التحميل", animationType = "classic", themeColors, isDarkMode = true }) => {
    return (
        <div dir="rtl" className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fafafa] text-gray-900'}`}>
            <DynamicBackground isDarkMode={isDarkMode} type={animationType} customColors={themeColors} />
            <div className="relative z-10 flex flex-col items-center p-8 rounded-3xl backdrop-blur-md bg-black/10 border border-white/5 shadow-2xl">
                <div className="relative mb-6 flex items-center justify-center">
                    <div className="w-20 h-20 border-4 border-gray-500/30 border-t-indigo-500 border-r-pink-500 rounded-full animate-spin-smooth"></div>
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse-slow">
                        <Heart size={28} className="text-pink-500 fill-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                    </div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-alexandria mb-3 tracking-wider text-center drop-shadow-md">{text}</h2>
                <div className="flex gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
            </div>
            <style>{`
                @keyframes spin-smooth { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .animate-spin-smooth { animation: spin-smooth 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite; }
                .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </div>
    );
};

const AutoPlayVideo = ({ src, className }) => {
    const videoRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                videoRef.current.play().catch(() => {});
            } else {
                videoRef.current.pause();
            }
        }, { threshold: 0.5 });
        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    return <video ref={videoRef} src={src} className={className} loop muted playsInline controls />;
};

const ScrollReveal = ({ children, delay = 0, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(ref.current);
          }
        },
        { threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => { if (ref.current) observer.unobserve(ref.current); };
    }, []);
  
    return (
      <div
        ref={ref}
        className={`transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] transform ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-16 scale-95"
        } ${className}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
};

const CustomFileUpload = ({ onChange, accept, label, uploading, progress, icon: Icon = UploadCloud }) => (
  <label className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group
    ${uploading ? 'bg-indigo-500/10 border-indigo-500' : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-indigo-400/50'}
  `}>
    <div className="flex flex-col items-center justify-center text-center w-full">
      {uploading ? (
        <div className="w-full max-w-[150px]">
           <div className="flex justify-between text-xs mb-1 text-indigo-400 font-bold">
               <span>جاري الرفع...</span>
               <span>{Math.round(progress)}%</span>
           </div>
           <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
               <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
           </div>
        </div>
      ) : (
        <>
            <Icon className="w-8 h-8 mb-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            <p className="mb-1 text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{label}</p>
            <p className="text-xs text-gray-500">اضغط للاختيار</p>
        </>
      )}
    </div>
    <input type="file" className="hidden" accept={accept} onChange={onChange} disabled={uploading}/>
  </label>
);

const LeadFormModal = ({ isOpen, onClose, isDarkMode }) => {
    const [formData, setFormData] = useState({ name: '', occasion: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.occasion || !formData.phone) return alert('برجاء إكمال جميع البيانات المطلوبة');
        if (!db) return alert('عذراً، خدمة الطلبات غير متوفرة حالياً');

        setSubmitting(true);
        try {
            await addDoc(collection(db, "leads"), {
                ...formData,
                status: 'pending',
                isArchived: false,
                createdAt: serverTimestamp()
            });

            const text = `مرحباً، مهتم بطلب تصميم صفحة SecretPage%0A%0Aالاسم: ${formData.name}%0Aنوع المناسبة/الفكرة: ${formData.occasion}%0Aرقم التليفون: ${formData.phone}`;
            window.open(`https://wa.me/201202789980?text=${text}`, '_blank');
            onClose(); 
        } catch (error) {
            console.error("Error submitting lead: ", error);
            alert('حدث خطأ أثناء إرسال الطلب، الرجاء المحاولة مرة أخرى.');
        }
        setSubmitting(false);
    };

    return (
        <div dir="rtl" className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className={`relative z-10 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-modal-spring border ${isDarkMode ? 'bg-[#12121f] border-white/10' : 'bg-white border-gray-200'}`}>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 text-gray-400 hover:text-white rounded-full transition"><X size={20}/></button>
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                        <MessageCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-bold font-alexandria mb-2">أهلاً بك في SecretPage ✨</h3>
                    <p className="text-sm opacity-60">سيب بياناتك البسيطة عشان نقدر نساعدك بأفضل شكل قبل ما نحولك للواتساب.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1 text-right">
                        <label className="text-xs font-bold opacity-70 px-2">الاسم الكريم</label>
                        <div className="relative">
                            <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40" />
                            <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} type="text" className={`w-full p-4 pr-12 rounded-xl border outline-none transition-all ${isDarkMode ? 'bg-black/20 border-white/10 focus:border-green-500' : 'bg-gray-50 border-gray-200 focus:border-green-500'}`} placeholder="اكتب اسمك هنا..." />
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <label className="text-xs font-bold opacity-70 px-2">نوع المناسبة / الفكرة</label>
                        <div className="relative">
                            <Gift size={18} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40" />
                            <input required value={formData.occasion} onChange={e=>setFormData({...formData, occasion: e.target.value})} type="text" className={`w-full p-4 pr-12 rounded-xl border outline-none transition-all ${isDarkMode ? 'bg-black/20 border-white/10 focus:border-green-500' : 'bg-gray-50 border-gray-200 focus:border-green-500'}`} placeholder="مثال: عيد ميلاد خطيبتي، ذكرى جواز..." />
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <label className="text-xs font-bold opacity-70 px-2">رقم التليفون للتواصل</label>
                        <div className="relative">
                            <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40" />
                            <input required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} type="tel" className={`w-full p-4 pr-12 rounded-xl border outline-none transition-all text-left dir-ltr ${isDarkMode ? 'bg-black/20 border-white/10 focus:border-green-500' : 'bg-gray-50 border-gray-200 focus:border-green-500'}`} placeholder="01X XXXX XXXX" />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={submitting} className="w-full py-4 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95 disabled:opacity-50">
                        {submitting ? <Loader2 className="animate-spin" size={20}/> : <><Send size={20}/> تأكيد والانتقال للواتساب</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- PORTFOLIO ---
const PortfolioLanding = ({ onLoginClick, isDarkMode, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('home'); 
  const [showcase, setShowcase] = useState([]);
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [bgType, setBgType] = useState('portfolio-mixed');
  const [showLeadForm, setShowLeadForm] = useState(false);
  
  const [publicStats, setPublicStats] = useState({ clients: 2500, visits: 145000, memories: 4200 });

  const bgOptions = ['portfolio-mixed', 'stars', 'love', 'fireflies', 'snow', 'matrix', 'classic'];
  const cycleBg = () => setBgType(bgOptions[(bgOptions.indexOf(bgType) + 1) % bgOptions.length]);

  useEffect(() => {
    let unsubscribe;
    
    const fetchPortfolioAndStats = async () => {
      if (!db) return;
      try {
          const q = query(collection(db, "memories"));
          const querySnapshot = await getDocs(q);
          const allMemories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(item => !item.isArchived);
          
          setShowcase(allMemories.filter(item => item.showInPortfolio));
          
          const realCount = allMemories.length;
          const baseDate = new Date('2024-01-01').getTime();
          const now = new Date().getTime();
          const daysPassed = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24));
          
          const dynamicClients = 2500 + (daysPassed * 3);
          const dynamicVisits = 145000 + (daysPassed * 120); 
          const dynamicMemories = 4200 + (daysPassed * 4);

          setPublicStats({
              clients: dynamicClients + realCount,
              visits: dynamicVisits + (realCount * 85),
              memories: dynamicMemories + realCount
          });
      } catch (error) { console.error("Error fetching portfolio:", error); }
    };

    if (auth) {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (!sessionStorage.getItem('visited_main') && db) {
                    sessionStorage.setItem('visited_main', 'true');
                    try {
                        await addDoc(collection(db, 'visits'), {
                            date: new Date().toISOString().split('T')[0],
                            month: new Date().toISOString().slice(0, 7),
                            timestamp: serverTimestamp(),
                            isArchived: false 
                        });
                    } catch (e) { console.error('Visit tracking error', e); }
                }
                fetchPortfolioAndStats();
            }
        });
    }
      
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleSecretClick = () => {
      setSecretClickCount(prev => prev + 1);
      if (secretClickCount + 1 >= 5) { onLoginClick(); setSecretClickCount(0); }
  };

  const NavButton = ({ active, onClick, icon: Icon, label, highlight }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? '-translate-y-1' : 'opacity-50 hover:opacity-100'}`}>
        <div className={`p-2.5 rounded-2xl transition-all ${highlight ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-900/30' : (active ? (isDarkMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'bg-rose-500 text-white') : 'bg-transparent text-gray-400')}`}>
            <Icon size={20} strokeWidth={2} />
        </div>
        <span className={`text-[10px] font-bold ${active ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-500'}`}>{label}</span>
    </button>
  );

  return (
    <div dir="rtl" className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fff0f5] text-gray-900'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;700;900&family=Cairo:wght@300;400;600;800&display=swap');
        body { font-family: 'Cairo', sans-serif; }
        .font-alexandria { font-family: 'Alexandria', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .glass-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(16px); }
        .light .glass-card { background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.05); backdrop-filter: blur(16px); }
        .text-gradient { background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>
      
      <DynamicBackground isDarkMode={isDarkMode} type={bgType} />
        
      <nav className={`flex justify-between items-center p-6 z-20 sticky top-0 ${isDarkMode ? 'bg-[#050511]/80 border-white/5' : 'bg-[#fff0f5]/80 border-black/5'} backdrop-blur-xl border-b transition-colors`}>
        <div className="flex items-center gap-2 font-black text-xl font-alexandria tracking-wide">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-500'}`}>
                <Sparkles size={20} />
            </div>
            SecretPage
        </div>
        <div className="flex items-center gap-3">
            <button onClick={cycleBg} className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'border-white/10 hover:bg-white/10 bg-black/20' : 'border-black/5 hover:bg-black/5 bg-white/50'}`} title="تغيير شكل الخلفية">
                <Palette size={18} className={isDarkMode ? "text-indigo-400" : "text-rose-500"} />
            </button>
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'border-white/10 hover:bg-white/10 bg-black/20' : 'border-black/5 hover:bg-black/5 bg-white/50'}`}>
                {isDarkMode ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-slate-600"/>}
            </button>
        </div>
      </nav>

      <main className="flex-1 z-10 overflow-y-auto no-scrollbar pb-32">
         {activeTab === 'home' && (
            <div className="animate-slide-up space-y-12 pt-8 px-4 text-center max-w-4xl mx-auto">
                <div className="relative">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-[100px] rounded-full pointer-events-none opacity-30 ${isDarkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-rose-400 to-pink-400'}`}></div>
                    <div className="relative z-10">
                        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-6 border shadow-lg ${isDarkMode ? 'bg-[#1a1a2e]/80 border-indigo-500/30 text-indigo-300' : 'bg-rose-50/80 border-rose-200 text-rose-600'}`}>
                            <Star size={12} className="fill-current animate-pulse" /> المنصة الأولى لإهداء الذكريات التفاعلية
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-normal md:leading-snug font-alexandria drop-shadow-lg">
                            اعمل أحلى مفاجأة، <br className="hidden sm:block"/> 
                            <span className={`text-gradient ${isDarkMode ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500'}`}>ذكرى تعيش العمر كله</span>
                        </h1>
                        <p className={`text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            ابعت مشاعرك في صفحة ويب معمولة مخصوص ليكم.. صوركم، قائمة الأغاني المفضلة، عداد لأحلى أيامكم، ورسايل سرية محدش هيشوفها غيركم بـ باسوورد! 💌
                        </p>
                        <button onClick={() => setActiveTab('order')} className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1">
                            يلا نبدأ نصمم هديتك <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={20}/>
                        </button>
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold opacity-70">
                            <Shield size={16} className="text-emerald-500"/> أمان تام وخصوصية 100% لبياناتك وصورك.
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 mt-16 mb-8 border-y border-white/10 py-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
                    <div className="flex flex-col items-center justify-center z-10">
                        <h3 className="text-4xl md:text-5xl font-black text-white mb-2 font-mono drop-shadow-md">
                            <AnimatedCounter end={publicStats.visits} suffix="+" />
                        </h3>
                        <p className={`text-[10px] md:text-xs opacity-60 uppercase tracking-widest font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>زيارة للموقع</p>
                    </div>
                    <div className="flex flex-col items-center justify-center sm:border-x border-y sm:border-y-0 py-6 sm:py-0 border-white/10 z-10">
                        <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2 font-mono drop-shadow-md">
                            <AnimatedCounter end={publicStats.clients} suffix="+" />
                        </h3>
                        <p className={`text-[10px] md:text-xs opacity-60 uppercase tracking-widest font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>عملاء وثقوا بنا</p>
                    </div>
                    <div className="flex flex-col items-center justify-center z-10">
                        <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2 font-mono drop-shadow-md">
                            <AnimatedCounter end={publicStats.memories} suffix="+" />
                        </h3>
                        <p className={`text-[10px] md:text-xs opacity-60 uppercase tracking-widest font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ذكرى صممناها</p>
                    </div>
                </div>

                <div className="pt-10">
                    <p className={`text-sm font-bold mb-6 opacity-50 uppercase tracking-widest`}>أيا كانت مناسبتك، الهدية دي عشانك</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[{ title: "للكابلز 👩‍❤️‍👨", icon: Heart, color: "text-red-500", bg: "bg-red-500/10" }, { title: "للمخطوبين 💍", icon: Gem, color: "text-blue-400", bg: "bg-blue-400/10" }, { title: "عيد جوازكم 🥂", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" }, { title: "عيد ميلاد 🎂", icon: Cake, color: "text-pink-500", bg: "bg-pink-500/10" }, { title: "سنة جديدة ✨", icon: Sparkles, color: "text-yellow-400", bg: "bg-yellow-400/10" }, { title: "تصالح حبيبك 🥺", icon: HeartHandshake, color: "text-emerald-500", bg: "bg-emerald-500/10" }, { title: "هدية رمضان 🌙", icon: Moon, color: "text-amber-500", bg: "bg-amber-500/10" }, { title: "فكرة مجنونة؟ 💡", icon: Star, color: "text-indigo-400", bg: "bg-indigo-400/10" }].map((cat, i) => (
                            <button key={i} onClick={() => setActiveTab('order')} className={`glass-card group relative p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
                                <div className={`p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${cat.bg} ${cat.color}`}>
                                    <cat.icon size={26} strokeWidth={2} />
                                </div>
                                <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>{cat.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
         )}

         {activeTab === 'work' && (
            <div className="animate-slide-up pt-8 px-4 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-black mb-4 font-alexandria text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 inline-block leading-normal">شغلنا اللي فرح ناس كتير 🎨</h2>
                    <p className="opacity-60 text-sm max-w-md mx-auto leading-relaxed">خد فكرة عن الصفحات والذكريات اللي صممناها لعملائنا قبل كده.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {showcase.map((item, index) => (
                        <ScrollReveal key={item.id} delay={index * 100}>
                            <div onClick={() => window.open(`?id=${item.id}`, '_blank')} className={`glass-card p-2 rounded-[2rem] cursor-pointer group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)]`}>
                                <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-3">
                                    {item.coverImage ? (
                                        item.coverType === 'video' ? 
                                        <video src={item.coverImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" muted loop autoPlay playsInline /> :
                                        <img src={item.coverImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                    ) : <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50"></div>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050511] via-transparent to-transparent opacity-80"></div>
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-white border border-white/10">
                                        <Globe size={12} className="text-green-400 animate-pulse"/> Live
                                    </div>
                                    <div className="absolute bottom-4 right-4">
                                        <h3 className="font-bold text-white text-lg drop-shadow-lg">{item.portfolioTitle || 'ذكرى مميزة ✨'}</h3>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                    {showcase.length === 0 && (
                        <div className="col-span-full text-center py-20 glass-card rounded-[2rem]">
                            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="opacity-50 font-bold">لا توجد أعمال معروضة حالياً.</p>
                        </div>
                    )}
                </div>
            </div>
         )}
         
         {activeTab === 'features' && (
            <div className="animate-slide-up pt-8 px-4 max-w-3xl mx-auto pb-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black mb-4 font-alexandria leading-normal">ليه تختار Secret Page؟ <br className="block sm:hidden"/><span className="text-pink-500">مش مجرد موقع!</span></h2>
                    <p className="text-base opacity-60 max-w-lg mx-auto leading-relaxed">عشان بنقدملك تجربة كاملة متتنسيش، هدية تفضل عايشة معاكم طول العمر.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {[
                        {t:"أمان وخصوصية 100%", d:"صفحتك مقفولة بباسوورد خاص بيك وبشريكك بس.", i:Lock, c: "text-purple-400 bg-purple-500/10 border-purple-500/20"}, 
                        {t:"تجربة موسيقية متكاملة", d:"قائمة تشغيل بأغانيكم المفضلة بتشتغل ورا بعض.", i:ListMusic, c: "text-blue-400 bg-blue-500/10 border-blue-500/20"}, 
                        {t:"إشعارات ذكية ومحادثة", d:"رسايل بتظهر فجأة بشكل شيك، وشات ومكالمات بينكم.", i:MessageSquare, c: "text-pink-400 bg-pink-500/10 border-pink-500/20"},
                        {t:"ألعاب تفاعلية للكابلز", d:"ألعاب زي عجلة الحظ وكروت الصراحة مخصصة ليكم.", i:Dices, c: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"}
                    ].map((x,i)=>(
                        <ScrollReveal key={i} delay={i * 100}>
                            <div className={`glass-card p-6 rounded-[2rem] flex flex-col gap-4 hover:-translate-y-1 transition-transform`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${x.c}`}>
                                    <x.i size={24} strokeWidth={2}/>
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold mb-2 font-alexandria ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{x.t}</h3>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{x.d}</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
         )}
         
         {activeTab === 'steps' && (
            <div className="animate-slide-up pb-24 pt-8 px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black mb-4 font-alexandria leading-normal">هنعملها إزاي؟ 🚀</h2>
                    <p className="text-base opacity-60 max-w-lg mx-auto leading-relaxed">٣ خطوات بسيطة وهتستلم أحلى هدية.</p>
                </div>
                
                <div className="space-y-6 relative max-w-xl mx-auto">
                    <div className="absolute top-10 bottom-10 right-[3.5rem] w-px bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent hidden md:block"></div>

                    {[{ step: "١", title: "تواصل معنا", desc: "كلمني واتساب وقولنا فكرتك والمناسبة إيه.", icon: MessageCircle, color: "text-green-400", bg: "bg-green-400/10" }, { step: "٢", title: "أرسل التفاصيل", desc: "ابعتلنا صوركم، الأغاني، وتواريخكم المهمة.", icon: UploadCloud, color: "text-blue-400", bg: "bg-blue-400/10" }, { step: "٣", title: "استلم هديتك", desc: "هنجهز الصفحة ونبعتلك اللينك في أسرع وقت.", icon: Gift, color: "text-purple-400", bg: "bg-purple-400/10" }].map((s, i) => (
                        <div key={i} className={`glass-card p-6 md:p-8 rounded-[2rem] relative z-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/5 shadow-inner ${s.bg} ${s.color}`}>
                                <s.icon size={32} />
                            </div>
                            <div className="flex-1">
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-black mb-3 border ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-black/5 border-black/10 text-gray-700'}`}>الخطوة {s.step}</div>
                                <h3 className={`text-xl font-bold mb-2 font-alexandria ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{s.title}</h3>
                                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         )}

         {activeTab === 'order' && (
            <div className="animate-slide-up pt-10 px-4 flex flex-col items-center text-center h-[70vh] justify-center max-w-lg mx-auto">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-green-500 blur-[50px] opacity-20 rounded-full animate-pulse"></div>
                    <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl relative z-10 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <MessageCircle size={48} />
                    </div>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 font-alexandria leading-normal">جاهز تعمل أحلى مفاجأة؟ 😍</h2>
                <p className="mb-10 opacity-60 text-base sm:text-lg max-w-xs leading-relaxed">الطلب بيتم بكل سهولة على الواتساب.. دوس على الزرار وهنرد عليك في ثواني!</p>
                <button 
                    onClick={() => setShowLeadForm(true)} 
                    className="w-full max-w-sm py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.6)] transition-all active:scale-95"
                >
                    <Send size={24} /> يلا نطلب دلوقتي
                </button>
                <div className={`mt-6 w-full max-w-sm flex items-center justify-center gap-2 text-xs font-bold opacity-80 p-3 rounded-xl border ${isDarkMode ? 'bg-black/30 border-white/5 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
                    <Shield size={18} className="text-emerald-500 shrink-0"/>
                    <span className="text-right">متقلقش خالص! كل صورك ورسايلك مشفرة ومحمية بباسوورد عشان خصوصيتكم 100%.</span>
                </div>
            </div>
         )}
         
         <div className="text-center pt-8"><p onClick={handleSecretClick} className="text-[10px] opacity-20 cursor-default hover:opacity-50 transition font-mono tracking-widest">SECRET PAGE © 2026</p></div>
      </main>

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[600px] rounded-[2rem] p-2 backdrop-blur-2xl border shadow-2xl transition-colors ${isDarkMode ? 'bg-[#1a1a2e]/80 border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.5)]' : 'bg-white/80 border-gray-200 shadow-[0_10px_50px_rgba(0,0,0,0.1)]'}`}>
        <div className="flex justify-between items-center px-1">
            <NavButton active={activeTab==='home'} onClick={()=>setActiveTab('home')} icon={Home} label="الرئيسية" />
            <NavButton active={activeTab==='work'} onClick={()=>setActiveTab('work')} icon={LayoutList} label="أعمالنا" />
            <NavButton active={activeTab==='features'} onClick={()=>setActiveTab('features')} icon={Gem} label="المميزات" />
            <NavButton active={activeTab==='steps'} onClick={()=>setActiveTab('steps')} icon={Rocket} label="الخطوات" />
            <NavButton active={activeTab==='order'} onClick={()=>setActiveTab('order')} icon={Send} label="اطلب" highlight />
        </div>
      </div>

      <LeadFormModal isOpen={showLeadForm} onClose={() => setShowLeadForm(false)} isDarkMode={isDarkMode} />
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ onLogOut, onCreateNew, onEdit, isDarkMode }) => {
    const [memories, setMemories] = useState([]);
    const [visits, setVisits] = useState([]);
    const [leads, setLeads] = useState([]);
    const [adminTab, setAdminTab] = useState('memories'); 
    const [selectedLead, setSelectedLead] = useState(null); 
    const [showArchivedMemories, setShowArchivedMemories] = useState(false); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        let unsubscribeMemories, unsubscribeLeads, unsubscribeVisits;
        
        const fetchData = async () => {
            if (!db) return;
            const qMemories = query(collection(db, "memories"), orderBy("createdAt", "desc"));
            unsubscribeMemories = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const snapMemories = await getDocs(qMemories);
                    setMemories(snapMemories.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    
                    const qLeads = query(collection(db, "leads"), orderBy("createdAt", "desc"));
                    const snapLeads = await getDocs(qLeads);
                    setLeads(snapLeads.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                    const qVisits = query(collection(db, "visits"));
                    const snapVisits = await getDocs(qVisits);
                    setVisits(snapVisits.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            });
        };

        fetchData();
        return () => {
            if(unsubscribeMemories) unsubscribeMemories();
        };
    }, []);

    const statsInfo = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().slice(0, 7);
        
        const dailyVisits = visits.filter(v => v.date === today && !v.isArchived).length;
        const monthlyVisits = visits.filter(v => v.month === thisMonth && !v.isArchived).length;
        const totalVisits = visits.filter(v => !v.isArchived).length;
        const totalLeads = leads.filter(l => !l.isArchived).length;

        return { dailyVisits, monthlyVisits, totalVisits, totalLeads };
    }, [visits, leads]);

    const handleDelete = async (id) => { 
        if(window.confirm("هل أنت متأكد من أرشفة هذه الذكرى؟ (لن يتم مسحها نهائياً ويمكن استرجاعها لاحقاً)")) { 
            try {
                await updateDoc(doc(db, "memories", id), { isArchived: true }); 
                setMemories(memories.map(m => m.id === id ? { ...m, isArchived: true } : m));
            } catch(e) {
                console.error(e);
                alert("حدث خطأ أثناء الأرشفة.");
            }
        }
    };

    const handleRestore = async (id) => {
        if(window.confirm("هل تريد استرجاع هذه الذكرى وعودتها للوحة التحكم؟")) {
            try {
                await updateDoc(doc(db, "memories", id), { isArchived: false });
                setMemories(memories.map(m => m.id === id ? { ...m, isArchived: false } : m));
            } catch(e) {
                alert("حدث خطأ أثناء الاسترجاع.");
            }
        }
    };

    const togglePortfolio = async (id, status) => { 
        try {
            await updateDoc(doc(db, "memories", id), { showInPortfolio: !status }); 
            const updated = memories.map(m => m.id === id ? {...m, showInPortfolio: !status} : m);
            setMemories(updated);
        } catch(e) { console.error(e); }
    };
    
    const copyLink = (id) => { 
        const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                alert(`تم نسخ الرابط بنجاح!\n${url}`);
            }).catch(() => {
                fallbackCopyTextToClipboard(url);
            });
        } else {
            fallbackCopyTextToClipboard(url);
        }
    };

    const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; 
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert(`تم نسخ الرابط بنجاح!\n${text}`);
        } catch (err) {
            alert(`يرجى نسخ الرابط يدوياً:\n${text}`);
        }
        document.body.removeChild(textArea);
    };

    const handleResetStats = async () => {
        if(window.confirm("هل أنت متأكد من تصفير الإحصائيات؟ (سيتم أرشفتها ولن تُحذف نهائياً لضمان الأمان)")) {
            try {
                const snap = await getDocs(collection(db, "visits"));
                snap.forEach(async (d) => {
                    if (!d.data().isArchived) {
                        await updateDoc(doc(db, "visits", d.id), { isArchived: true });
                    }
                });
                setVisits(visits.map(v => ({...v, isArchived: true})));
                alert("تم تصفير الإحصائيات بنجاح.");
            } catch(e) {
                console.error(e);
                alert("حدث خطأ أثناء التصفير.");
            }
        }
    };

    const handleDeleteLead = async (id, e) => {
        if(e) e.stopPropagation(); 
        if(window.confirm("هل أنت متأكد من أرشفة هذا الطلب؟ (لن يحذف نهائياً)")) {
            try {
                await updateDoc(doc(db, "leads", id), { isArchived: true });
                setLeads(leads.map(l => l.id === id ? { ...l, isArchived: true } : l));
                if(selectedLead && selectedLead.id === id) setSelectedLead(null); 
            } catch (e) {
                console.error(e);
                alert("حدث خطأ أثناء الأرشفة.");
            }
        }
    };

    const handleClearAllLeads = async () => {
        if(window.confirm("⚠️ تحذير خطير: هل أنت متأكد من حذف جميع الطلبات نهائياً؟ هذا الإجراء سيخفف من مساحة قاعدة البيانات ولكن لا يمكن التراجع عنه!")) {
            if(window.confirm("تأكيد أخير: سيتم مسح كل بيانات طلبات العملاء نهائياً. هل أنت متأكد؟")) {
                try {
                    const snap = await getDocs(collection(db, "leads"));
                    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "leads", d.id)));
                    await Promise.all(deletePromises);
                    setLeads([]);
                    setSelectedLead(null);
                    alert("تم حذف وتفريغ جميع الطلبات نهائياً بنجاح.");
                } catch (e) {
                    console.error(e);
                    alert("حدث خطأ! يرجى التأكد من تعديل قواعد فايربيز (Rules) للسماح للإدمن بالحذف.\n\nتأكد من وجود هذا السطر:\nallow delete: if request.auth != null && request.auth.token.email == 'admin@secretpage.com';");
                }
            }
        }
    };

    const handleToggleLeadStatus = async (lead, e) => {
        if(e) e.stopPropagation();
        const newStatus = lead.status === 'completed' ? 'pending' : 'completed';
        try {
            await updateDoc(doc(db, "leads", lead.id), { status: newStatus });
            const updatedLeads = leads.map(l => l.id === lead.id ? { ...l, status: newStatus } : l);
            setLeads(updatedLeads);
            if(selectedLead && selectedLead.id === lead.id) setSelectedLead({ ...selectedLead, status: newStatus });
        } catch (e) {
            console.error(e);
            alert("حدث خطأ أثناء تحديث الحالة.");
        }
    };

    const SidebarItem = ({ icon: Icon, label, tabId, count }) => (
        <button 
            onClick={() => { setAdminTab(tabId); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between p-4 rounded-2xl mb-2 transition-all duration-300 font-bold ${adminTab === tabId ? 'bg-indigo-600 text-white shadow-[0_5px_20px_rgba(79,70,229,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
            <div className="flex items-center gap-3"><Icon size={20} /> <span>{label}</span></div>
            {count !== undefined && <span className={`text-xs px-2 py-0.5 rounded-lg ${adminTab === tabId ? 'bg-white/20' : 'bg-white/10'}`}>{count}</span>}
        </button>
    );

    return (
        <div dir="rtl" className={`flex h-screen overflow-hidden font-[Cairo] ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#f8fafc] text-gray-900'}`}>
            <style>{`
                .glass-panel { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
                .light .glass-panel { background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.05); shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            `}</style>
            
            <aside className={`hidden md:flex flex-col w-72 h-full glass-panel border-l ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 font-black text-2xl font-alexandria tracking-wide mb-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"><Sparkles size={24} /></div>
                        SecretAdmin
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold px-2"><Shield size={12}/> حماية قصوى مفعلة</div>
                </div>
                
                <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
                    <p className="text-xs font-bold opacity-40 px-4 mb-4 uppercase tracking-widest">إدارة المحتوى</p>
                    <SidebarItem icon={LayoutDashboard} label="الذكريات" tabId="memories" count={memories.filter(m=>!m.isArchived).length} />
                    <SidebarItem icon={Crown} label="المميزات المدفوعة" tabId="features" />
                    
                    <p className="text-xs font-bold opacity-40 px-4 mt-8 mb-4 uppercase tracking-widest">التحليلات والمبيعات</p>
                    <SidebarItem icon={Users} label="العملاء (الطلبات)" tabId="leads" count={leads.filter(l=>!l.isArchived && l.status==='pending').length} />
                    <SidebarItem icon={BarChart3} label="الإحصائيات" tabId="stats" />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={onLogOut} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors font-bold"><LogOut size={20} /> تسجيل الخروج</button>
                </div>
            </aside>

            <div className="md:hidden fixed top-0 w-full z-50 glass-panel border-b border-white/5 px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 font-black text-lg font-alexandria"><Sparkles className="text-indigo-500" size={20}/> SecretAdmin</div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-xl"><Menu size={24}/></button>
            </div>
            
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-4 pb-4 flex flex-col">
                    <nav className="flex-1 space-y-2">
                        <SidebarItem icon={LayoutDashboard} label="الذكريات" tabId="memories" count={memories.filter(m=>!m.isArchived).length} />
                        <SidebarItem icon={Crown} label="المميزات المدفوعة" tabId="features" />
                        <SidebarItem icon={Users} label="العملاء (الطلبات)" tabId="leads" count={leads.filter(l=>!l.isArchived && l.status==='pending').length} />
                        <SidebarItem icon={BarChart3} label="الإحصائيات" tabId="stats" />
                    </nav>
                    <button onClick={onLogOut} className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-red-400 bg-red-500/10 font-bold"><LogOut size={20} /> تسجيل الخروج</button>
                </div>
            )}

            <main className="flex-1 h-full overflow-y-auto bg-black/20 pt-20 md:pt-0">
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black font-alexandria mb-1 text-white">
                                {adminTab === 'memories' && 'إدارة الذكريات'}
                                {adminTab === 'features' && 'المميزات المدفوعة'}
                                {adminTab === 'leads' && 'طلبات العملاء'}
                                {adminTab === 'stats' && 'الإحصائيات والأداء'}
                            </h1>
                            <p className="text-sm opacity-60">مرحباً بك مجدداً في لوحة التحكم الخاصة بك.</p>
                        </div>
                        {adminTab === 'memories' && (
                            <button onClick={onCreateNew} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 md:px-8 py-3.5 rounded-[1.2rem] font-bold flex items-center gap-2 shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1 w-full md:w-auto justify-center">
                                <Plus size={20} className=""/> <span className="text-sm md:text-base">ذكرى جديدة</span>
                            </button>
                        )}
                    </div>

                    {adminTab === 'features' && (
                        <div className="animate-fade-in glass-panel rounded-[2rem] overflow-hidden shadow-xl border border-white/5">
                            <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-yellow-500/5 to-transparent">
                                <h2 className="text-xl font-bold flex items-center gap-3 text-yellow-400"><Crown size={24}/> تفعيل المميزات المتقدمة</h2>
                                <p className="text-sm opacity-70 mt-2 max-w-2xl">تحكم في الباقات والمميزات لكل عميل بشكل منفصل. التغييرات يتم حفظها وتطبيقها عند العميل فورياً بدون الحاجة لإعادة التحميل.</p>
                            </div>
                            {memories.filter(m => !m.isArchived).length === 0 ? (
                                <div className="p-16 text-center opacity-50 flex flex-col items-center">
                                    <Users size={48} className="mb-4 opacity-20"/>
                                    <p>لا يوجد عملاء حالياً لتخصيص مميزاتهم.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right whitespace-nowrap">
                                        <thead className="bg-black/40 text-xs opacity-60 uppercase font-black tracking-wider">
                                            <tr>
                                                <th className="p-5 px-8">العميل (الذكرى)</th>
                                                <th className="p-5">الإنشاء</th>
                                                <th className="p-5 text-center border-r border-white/5"><div className="flex items-center justify-center gap-2 text-emerald-400"><MessageCircle size={16}/> ميزة الدردشة الخاصة</div></th>
                                                <th className="p-5 text-center border-r border-white/5"><div className="flex items-center justify-center gap-2 text-blue-400"><Phone size={16}/> المكالمات الصوتية</div></th>
                                                <th className="p-5 text-center border-r border-white/5"><div className="flex items-center justify-center gap-2 text-fuchsia-400"><MonitorPlay size={16}/> التطبيق</div></th>
                                                <th className="p-5 text-center border-r border-white/5"><div className="flex items-center justify-center gap-2 text-yellow-400"><Dices size={16}/> صالة الألعاب</div></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {memories.filter(m => !m.isArchived).map(mem => (
                                                <tr key={mem.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-5 px-8">
                                                        <p className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">{mem.memoryTitle || mem.recipientName}</p>
                                                        <p className="text-xs opacity-50 mt-1 flex items-center gap-1"><Gift size={10}/> من: {mem.senderName}</p>
                                                    </td>
                                                    <td className="p-5 opacity-50 text-xs font-mono">{mem.createdAt ? new Date(mem.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : '-'}</td>
                                                    
                                                    <td className="p-5 text-center border-r border-white/5">
                                                        <label className="relative inline-flex items-center cursor-pointer justify-center hover:scale-105 transition-transform">
                                                            <input 
                                                                type="checkbox" className="sr-only peer" checked={mem.allowChat || false}
                                                                onChange={async (e) => {
                                                                    const isAllowed = e.target.checked;
                                                                    try {
                                                                        await updateDoc(doc(db, "memories", mem.id), { allowChat: isAllowed });
                                                                        setMemories(memories.map(m => m.id === mem.id ? { ...m, allowChat: isAllowed } : m));
                                                                    } catch (error) { alert("حدث خطأ."); }
                                                                }}
                                                            />
                                                            <div className="w-14 h-7 bg-black/50 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                                        </label>
                                                    </td>

                                                    <td className="p-5 text-center border-r border-white/5">
                                                        <label className="relative inline-flex items-center cursor-pointer justify-center hover:scale-105 transition-transform">
                                                            <input 
                                                                type="checkbox" className="sr-only peer" checked={mem.allowVoiceCall || false}
                                                                onChange={async (e) => {
                                                                    const isAllowed = e.target.checked;
                                                                    try {
                                                                        await updateDoc(doc(db, "memories", mem.id), { allowVoiceCall: isAllowed });
                                                                        setMemories(memories.map(m => m.id === mem.id ? { ...m, allowVoiceCall: isAllowed } : m));
                                                                    } catch (error) { alert("حدث خطأ."); }
                                                                }}
                                                            />
                                                            <div className="w-14 h-7 bg-black/50 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                                                        </label>
                                                    </td>

                                                    <td className="p-5 text-center border-r border-white/5">
                                                        <label className="relative inline-flex items-center cursor-pointer justify-center hover:scale-105 transition-transform">
                                                            <input 
                                                                type="checkbox" className="sr-only peer" checked={mem.allowAppInstall || false}
                                                                onChange={async (e) => {
                                                                    const isAllowed = e.target.checked;
                                                                    try {
                                                                        await updateDoc(doc(db, "memories", mem.id), { allowAppInstall: isAllowed });
                                                                        setMemories(memories.map(m => m.id === mem.id ? { ...m, allowAppInstall: isAllowed } : m));
                                                                    } catch (error) { alert("حدث خطأ."); }
                                                                }}
                                                            />
                                                            <div className="w-14 h-7 bg-black/50 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-500 shadow-inner"></div>
                                                        </label>
                                                    </td>

                                                    <td className="p-5 text-center border-r border-white/5">
                                                        <label className="relative inline-flex items-center cursor-pointer justify-center hover:scale-105 transition-transform">
                                                            <input 
                                                                type="checkbox" className="sr-only peer" checked={mem.allowGames || false}
                                                                onChange={async (e) => {
                                                                    const isAllowed = e.target.checked;
                                                                    try {
                                                                        await updateDoc(doc(db, "memories", mem.id), { allowGames: isAllowed });
                                                                        setMemories(memories.map(m => m.id === mem.id ? { ...m, allowGames: isAllowed } : m));
                                                                    } catch (error) { alert("حدث خطأ."); }
                                                                }}
                                                            />
                                                            <div className="w-14 h-7 bg-black/50 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500 shadow-inner"></div>
                                                        </label>
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {adminTab === 'memories' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-[1.5rem] border border-white/5 backdrop-blur-sm">
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button onClick={() => setShowArchivedMemories(false)} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition ${!showArchivedMemories ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>النشطة</button>
                                    <button onClick={() => setShowArchivedMemories(true)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition ${showArchivedMemories ? 'bg-red-500/20 text-red-400 shadow-lg' : 'text-gray-500 hover:text-red-400'}`}><Trash2 size={16}/> الأرشيف</button>
                                </div>
                            </div>
                            
                            {memories.filter(m => showArchivedMemories ? m.isArchived : !m.isArchived).length === 0 ? (
                                <div className="text-center py-24 glass-panel border-white/10 rounded-[2.5rem] opacity-60">
                                    <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-bold">{showArchivedMemories ? 'سلة المهملات فارغة حالياً.' : 'لم تقم بإنشاء أي ذكريات بعد. ابدأ الآن!'}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {memories.filter(m => showArchivedMemories ? m.isArchived : !m.isArchived).map((mem) => (
                                        <div key={mem.id} className={`glass-panel p-6 rounded-[2rem] relative flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:border-white/20 ${mem.showInPortfolio && !showArchivedMemories ? 'border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.05)]' : 'border-white/5'} ${showArchivedMemories ? 'opacity-70 grayscale-[50%]' : ''}`}>
                                            
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl font-black text-indigo-300 uppercase shadow-inner">
                                                        {mem.recipientName?.[0] || '?'}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="text-xl font-bold truncate max-w-[150px] text-white">{mem.memoryTitle || mem.recipientName}</h3>
                                                        <p className="text-xs opacity-50 truncate flex items-center gap-1 mt-1"><Gift size={10}/> من: {mem.senderName}</p>
                                                    </div>
                                                </div>
                                                {mem.showInPortfolio && !showArchivedMemories && (
                                                    <div className="px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                                        <Globe size={12} className="animate-pulse" /> Live
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {!showArchivedMemories && (
                                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 mb-6 flex gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-[10px] opacity-50 mb-1 flex items-center gap-1"><Eye size={10}/> للمشاهدة</p>
                                                        <p className="font-mono text-base font-bold text-white tracking-widest">{mem.password}</p>
                                                    </div>
                                                    {mem.editPassword && (
                                                        <div className="flex-1 border-r border-white/10 pr-4">
                                                            <p className="text-[10px] text-indigo-300 opacity-70 mb-1 flex items-center gap-1"><Edit3 size={10}/> للتعديل</p>
                                                            <p className="font-mono text-base font-bold text-indigo-400 tracking-widest">{mem.editPassword}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {!showArchivedMemories && (
                                                <div className="flex gap-2 mb-6 mt-auto">
                                                    <button onClick={()=>copyLink(mem.id)} className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"><LinkIcon size={16}/> نسخ الرابط</button>
                                                    <button onClick={()=>window.open(`?id=${mem.id}`, '_blank')} className="p-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/5 transition-colors" title="معاينة الصفحة"><Eye size={18}/></button>
                                                </div>
                                            )}
                                            
                                            <div className={`flex justify-between items-center pt-4 border-t border-white/5 mt-auto ${showArchivedMemories ? '' : 'mt-0'}`}>
                                                <span className="text-[10px] opacity-40 font-mono flex items-center gap-1"><Calendar size={10}/> {new Date(mem.createdAt?.seconds * 1000).toLocaleDateString('en-GB')}</span>
                                                <div className="flex gap-2">
                                                    {showArchivedMemories ? (
                                                        <button onClick={() => handleRestore(mem.id)} className="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-4 py-2 rounded-xl transition-colors font-bold text-xs flex items-center gap-2"><RefreshCw size={14}/> استرجاع النشاط</button>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => onEdit(mem)} className="bg-white/5 hover:bg-indigo-500/20 text-gray-300 hover:text-indigo-400 p-2.5 rounded-xl transition-colors" title="تعديل"><Edit3 size={16}/></button>
                                                            <button onClick={()=>handleDelete(mem.id)} className="bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 p-2.5 rounded-xl transition-colors" title="أرشفة"><Trash2 size={16}/></button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {adminTab === 'stats' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-8 rounded-[2rem]">
                                <div>
                                    <h3 className="font-black text-2xl mb-2 font-alexandria text-white">نظرة عامة على الأداء 📈</h3>
                                    <p className="text-sm opacity-60">إحصائيات تفاعل الزوار مع الصفحة الرئيسية وزر الواتساب.</p>
                                </div>
                                <button onClick={handleResetStats} className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                    <Trash2 size={18}/> تصفير العدادات
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { t: "زوار اليوم", v: statsInfo.dailyVisits, i: Activity, c: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                                    { t: "زوار الشهر", v: statsInfo.monthlyVisits, i: Calendar, c: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                                    { t: "إجمالي الزيارات", v: statsInfo.totalVisits, i: Users, c: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
                                    { t: "طلبات الواتساب", v: statsInfo.totalLeads, i: MessageCircle, c: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
                                ].map((stat, i) => (
                                    <div key={i} className={`glass-panel p-8 rounded-[2rem] border-t-4 ${stat.bg} flex flex-col gap-4 hover:-translate-y-1 transition-transform`}>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-black/40 border border-white/5 ${stat.c}`}><stat.i size={28}/></div>
                                        <div>
                                            <p className="text-sm opacity-60 mb-1 font-bold">{stat.t}</p>
                                            <h3 className="text-5xl font-black font-mono tracking-tight text-white">{stat.v}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {adminTab === 'leads' && (
                        <div className="animate-fade-in glass-panel border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-black/20">
                                <div>
                                    <h2 className="text-2xl font-black font-alexandria flex items-center gap-3 text-white"><Users className="text-indigo-400"/> بيانات العملاء والطلبات</h2>
                                    <p className="text-sm opacity-60 mt-2">قائمة بالعملاء المحتملين الذين طلبوا التواصل (اضغط على العميل لعرض التفاصيل).</p>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                                    <div className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-xl text-sm font-bold border border-indigo-500/30 whitespace-nowrap">
                                        إجمالي الطلبات: {leads.filter(l=>!l.isArchived).length}
                                    </div>
                                    <button onClick={handleClearAllLeads} className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                        <Trash2 size={16}/> حذف الكل نهائياً
                                    </button>
                                </div>
                            </div>
                            
                            {leads.filter(l => !l.isArchived).length === 0 ? (
                                <div className="p-20 text-center opacity-50 flex flex-col items-center">
                                    <MessageCircle size={48} className="mb-4 opacity-20"/>
                                    <p className="font-bold text-lg">صندوق الطلبات فارغ حالياً.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto p-4">
                                    <table className="w-full text-right whitespace-nowrap border-collapse">
                                        <thead className="text-xs opacity-50 uppercase tracking-widest font-black text-gray-400 border-b border-white/5">
                                            <tr>
                                                <th className="p-4 px-6 pb-4">العميل</th>
                                                <th className="p-4 pb-4">المناسبة</th>
                                                <th className="p-4 pb-4">الحالة</th>
                                                <th className="p-4 pb-4">التاريخ</th>
                                                <th className="p-4 pb-4 text-center">إجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {leads.filter(l => !l.isArchived).map(lead => (
                                                <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 group">
                                                    <td className="p-4 px-6 font-bold text-white group-hover:text-indigo-300 transition-colors">{lead.name}</td>
                                                    <td className="p-4"><span className="bg-black/40 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs">{lead.occasion}</span></td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase border ${lead.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                            {lead.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 opacity-50 text-xs font-mono">{lead.createdAt ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '-'}</td>
                                                    <td className="p-4 text-center">
                                                        <button onClick={(e) => handleDeleteLead(lead.id, e)} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-500/20" title="أرشفة الطلب"><Trash2 size={16}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>

            {selectedLead && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
                    <div className={`relative z-10 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-modal-spring border ${isDarkMode ? 'bg-[#12121f] border-white/10' : 'bg-white border-gray-200'}`}>
                        <button onClick={() => setSelectedLead(null)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition border border-white/5"><X size={20}/></button>
                        
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                            <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                                <User size={28}/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-alexandria">{selectedLead.name}</h3>
                                <p className="text-xs opacity-50 mt-1 font-mono">{selectedLead.createdAt ? new Date(selectedLead.createdAt.seconds * 1000).toLocaleString('ar-EG') : ''}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-6 text-sm bg-black/20 p-6 rounded-2xl border border-white/5">
                            <div><span className="opacity-50 block mb-1 text-[10px] uppercase tracking-wider">نوع المناسبة</span> <p className="font-bold text-base">{selectedLead.occasion}</p></div>
                            <div><span className="opacity-50 block mb-1 text-[10px] uppercase tracking-wider">رقم الهاتف</span> <p className="font-bold font-mono text-lg text-indigo-400">{selectedLead.phone}</p></div>
                            
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="opacity-50 text-[10px] uppercase tracking-wider">حالة الطلب</span>
                                <button 
                                    onClick={(e) => handleToggleLeadStatus(selectedLead, e)}
                                    className={`px-4 py-2 rounded-xl font-bold text-xs transition shadow-lg active:scale-95 border ${selectedLead.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
                                >
                                    {selectedLead.status === 'completed' ? <span className="flex items-center gap-1.5"><CheckCircle size={14}/> مكتمل</span> : <span className="flex items-center gap-1.5"><Clock size={14}/> قيد الانتظار (تغيير)</span>}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3">
                            <button 
                                onClick={() => window.open(`https://wa.me/20${selectedLead.phone.startsWith('0') ? selectedLead.phone.substring(1) : selectedLead.phone}`, '_blank')} 
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                            >
                                <MessageCircle size={20}/> فتح محادثة واتساب
                            </button>
                            <button onClick={(e) => handleDeleteLead(selectedLead.id, e)} className="w-full py-4 bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Trash2 size={18}/> أرشفة الطلب
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- EDITOR ---
// Component for adjusting image visible part natively
const ImagePositioner = ({ src, pos, setPos, type }) => {
    const [dragging, setDragging] = useState(false);
    const [last, setLast] = useState({x:0, y:0});

    const startDrag = (clientX, clientY) => {
        setDragging(true);
        setLast({x: clientX, y: clientY});
    };
    const moveDrag = (clientX, clientY) => {
        if(!dragging) return;
        const dx = clientX - last.x;
        const dy = clientY - last.y;
        setPos({
            x: Math.max(0, Math.min(100, pos.x - dx * 0.6)),
            y: Math.max(0, Math.min(100, pos.y - dy * 0.6))
        });
        setLast({x: clientX, y: clientY});
    };
    const stopDrag = () => setDragging(false);

    if (type === 'video') {
        return (
            <div className="relative w-40 md:w-64 aspect-[4/5] rounded-xl overflow-hidden bg-black shadow-lg mx-auto border-2 border-blue-500/30">
                <video src={src} className="w-full h-full object-cover" muted autoPlay loop playsInline />
            </div>
        );
    }

    return (
        <div className="text-center w-full flex flex-col items-center">
            <p className="text-xs text-blue-300 mb-3 font-bold flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                <Move size={14}/> اسحب الصورة لتحديد الجزء الظاهر (تعمل باللمس)
            </p>
            <div 
                className="relative w-full max-w-[280px] md:max-w-xs aspect-[4/5] rounded-2xl overflow-hidden bg-black shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-2 border-blue-500/50 cursor-move touch-none group mx-auto"
                onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
                onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchEnd={stopDrag}
            >
                <img src={getOptimizedUrl(src)} className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-75" style={{ objectPosition: `${pos?.x || 50}% ${pos?.y || 50}%` }} draggable={false} />
                <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.4)] pointer-events-none"></div>
                
                {/* Visual Grid for Cropping Guide */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity">
                    <div className="border-b border-r border-white"></div>
                    <div className="border-b border-r border-white"></div>
                    <div className="border-b border-white"></div>
                    <div className="border-b border-r border-white"></div>
                    <div className="border-b border-r border-white"></div>
                    <div className="border-b border-white"></div>
                    <div className="border-r border-white"></div>
                    <div className="border-r border-white"></div>
                    <div></div>
                </div>
            </div>
        </div>
    );
};

const MemoryEditor = ({ onCancel, onSave, isDarkMode, initialData, isClientMode = false, existingMemoryId }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
      recipientName: '', senderName: '', memoryTitle: '', eventTitle: '', password: '', editPassword: '', 
      timers: [], 
      timeline: [], 
      quiz: [], 
      notifications: [],
      quizMode: 'before_page', 
      allowChat: false,
      allowVoiceCall: false,
      allowAppInstall: false,
      allowGames: false,
      quizIntroMessage: '', 
      quizSectionText: '',
      quizButtonText: '',
      sectionOrder: ['countdown', 'timeline', 'marquees', 'cards', 'gallery', 'quiz'],
      targetDate: '', timerLabel: '', mainMessage: '', 
      loadingText: 'جاري التحميل ✨', 
      sectionTitles: { countdown: '', timeline: '', gallery: '', cards: '', marquees: '', quiz: '' }, 
      themeColors: { start: '', end: '', accent: '#f472b6' },
      playlist: [], // Playlist array instead of single song
      coverImage: '', coverType: 'image', 
      backgroundAnimation: 'classic',
      showInPortfolio: false, 
      portfolioTitle: '', 
      secretMessage: '', secretButtonLabel: '', secretModalTitle: '',
      photos: [], marquees: [], flipCards: [],
      loginTitle: '', loginPlaceholder: '', loginButtonText: '',
      loginDescription: '', loginIcon: 'Lock', loginImage: '',
      isArchived: false 
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadState, setUploadState] = useState({ type: null, progress: 0 }); 
  const [tempPhoto, setTempPhoto] = useState({ id: null, img: '', title: '', desc: '', type: 'image', pos: { x: 50, y: 50 } });
  const [tempMarquee, setTempMarquee] = useState({ text: '', icon: 'Heart' });
  const [tempFlip, setTempFlip] = useState({ message: '', icon: 'Star', hint: '' }); 
  const [tempTimer, setTempTimer] = useState({ label: '', date: '' }); 
  const [tempTimeline, setTempTimeline] = useState({ title: '', date: '' });
  const [tempQuiz, setTempQuiz] = useState({ question: '', answer: '' });
  const [tempNotification, setTempNotification] = useState('');
  const [tempSong, setTempSong] = useState({ id: null, url: '', title: '', image: '', type: 'link' });
  const [authState, setAuthState] = useState({ connected: false, user: null });

  const SECTION_NAMES = { countdown: 'العدادات الزمنية', timeline: 'التواريخ المهمة', marquees: 'الشريط المتحرك', cards: 'الكروت القلابة', gallery: 'معرض الصور', quiz: 'الأسئلة والإجابات' };

  useEffect(() => {
    if (initialData) {
        let loadedTimers = initialData.timers || [];
        if (initialData.targetDate && loadedTimers.length === 0) {
            loadedTimers = [{ id: Date.now(), label: initialData.timerLabel || '', date: initialData.targetDate }];
        }

        let loadedOrder = initialData.sectionOrder?.length ? initialData.sectionOrder : ['countdown', 'timeline', 'marquees', 'cards', 'gallery', 'quiz'];
        if (initialData.quiz?.length > 0 && !loadedOrder.includes('quiz')) {
            loadedOrder.push('quiz');
        }

        let loadedPlaylist = initialData.playlist || [];
        if (loadedPlaylist.length === 0 && initialData.songUrl) {
            loadedPlaylist = [{
                id: Date.now(),
                url: initialData.songUrl,
                title: initialData.songTitle || 'أغنية الذكرى',
                image: initialData.songImage || '',
                type: initialData.songType || 'link'
            }];
        }

        setFormData({ 
            ...formData, 
            ...initialData,
            timers: loadedTimers,
            timeline: initialData.timeline || [],
            quiz: initialData.quiz || [], 
            notifications: initialData.notifications || [],
            quizMode: initialData.quizMode || 'before_page', 
            allowChat: initialData.allowChat || false,
            allowVoiceCall: initialData.allowVoiceCall || false,
            allowAppInstall: initialData.allowAppInstall || false,
            allowGames: initialData.allowGames || false,
            quizIntroMessage: initialData.quizIntroMessage || '',
            quizSectionText: initialData.quizSectionText || '',
            quizButtonText: initialData.quizButtonText || '',
            sectionOrder: loadedOrder,
            playlist: loadedPlaylist,
            targetDate: '', 
            timerLabel: '', 
            sectionTitles: initialData.sectionTitles || { countdown: '', timeline: '', gallery: '', cards: '', marquees: '', quiz: '' },
            themeColors: { ...formData.themeColors, ...initialData.themeColors },
            secretButtonLabel: initialData.secretButtonLabel || '',
            secretModalTitle: initialData.secretModalTitle || '',
            loadingText: initialData.loadingText || 'جاري التحميل ✨',
            portfolioTitle: initialData.portfolioTitle || ''
        });
    }
    if(auth) {
        return onAuthStateChanged(auth, (user) => {
            setAuthState({ connected: true, user });
        });
    }
  }, [initialData]);

  const uploadToCloudinary = async (file, field, onProgress) => {
      if (!file) return;
      if (file.size > 100 * 1024 * 1024) { 
          alert("الملف كبير جداً. الحد الأقصى 100 ميجا.");
          return;
      }
      setUploading(true);
      setUploadState({ type: field, progress: 0 });

      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      fd.append('resource_type', 'auto'); 

      try {
          const xhr = new XMLHttpRequest();
          const promise = new Promise((resolve, reject) => {
              xhr.upload.addEventListener("progress", (event) => {
                  if (event.lengthComputable) {
                      const progress = Math.round((event.loaded * 100) / event.total);
                      setUploadState({ type: field, progress });
                      if(onProgress) onProgress(progress);
                  }
              });
              xhr.addEventListener("load", () => {
                  if (xhr.status >= 200 && xhr.status < 300) {
                      const response = JSON.parse(xhr.responseText);
                      resolve(response.secure_url);
                  } else {
                      reject(new Error("Upload Failed"));
                  }
              });
              xhr.addEventListener("error", () => reject(new Error("Network Error")));
          });
          xhr.open("POST", url);
          xhr.send(fd);
          const secureUrl = await promise;
          return secureUrl;
      } catch (error) {
          console.error("Cloudinary Error:", error);
          alert(error.message);
          return null;
      } finally {
          setUploading(false);
          setUploadState({ type: null, progress: 0 });
      }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
        const url = await uploadToCloudinary(file, field);
        if (url) {
            if(field === 'cover') setFormData({ ...formData, coverImage: url, coverType: mediaType });
            if(field === 'photo') setTempPhoto({ ...tempPhoto, img: url, type: mediaType }); 
            if(field === 'loginImage') setFormData({...formData, loginImage: url}); 
            if(field === 'songImage') setTempSong({...tempSong, image: url}); 
        }
    }
  };

  const handleAudioUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
          setTempSong(prev => ({ ...prev, url: '', title: file.name.replace(/\.[^/.]+$/, "") })); 
          const url = await uploadToCloudinary(file, 'audio');
          if (url) {
            setTempSong(prev => ({ ...prev, url: url, type: 'file' }));
          }
      }
      e.target.value = null;
  };

  const generatePasswords = () => {
      const chars = "0123456789";
      let pass = "";
      let editPass = "";
      for(let i=0; i<4; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
      for(let i=0; i<4; i++) editPass += chars.charAt(Math.floor(Math.random() * chars.length));
      setFormData({...formData, password: pass, editPassword: editPass});
  };

  const handleThemeSelect = (theme) => {
      setFormData({
          ...formData,
          backgroundAnimation: theme.animation,
          themeColors: theme.colors
      });
  };

  const updateItem = (list, id, field, value) => {
      setFormData(prev => ({
          ...prev,
          [list]: prev[list].map(item => item.id === id ? { ...item, [field]: value } : item)
      }));
  };

  const moveItemIndex = (list, index, direction) => {
      const newList = [...formData[list]];
      if (direction === -1 && index > 0) {
          [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
      } else if (direction === 1 && index < newList.length - 1) {
          [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      }
      setFormData({ ...formData, [list]: newList });
  };

  const addItem = (list, item, reset) => { if(item) { setFormData({...formData, [list]: [...formData[list], {...item, id: Date.now()}]}); reset(); }};
  const removeItem = (list, id) => setFormData({...formData, [list]: formData[list].filter(x=>x.id!==id)});
   
  const moveSection = (index, direction) => {
      const newOrder = [...formData.sectionOrder];
      if (direction === -1 && index > 0) {
          [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      } else if (direction === 1 && index < newOrder.length - 1) {
          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      }
      setFormData({...formData, sectionOrder: newOrder});
  };

  const handleSave = async () => {
    if (!isClientMode && (!formData.password || !formData.recipientName)) return alert("الاسم وباسورد المشاهدة مطلوبين!");
    if (!db) return alert("Database error");

    setSaving(true);
    try {
        const targetId = existingMemoryId || initialData?.id || formData?.id;
        
        const payload = { ...formData };
        delete payload.id; 
        
        delete payload.songUrl;
        delete payload.songTitle;
        delete payload.songImage;
        delete payload.songType;

        if (isClientMode) {
            if (!targetId) {
                alert("حدث خطأ تقني: تعذر العثور على معرف الصفحة. يرجى تحديث المتصفح والمحاولة.");
                setSaving(false);
                return;
            }
            delete payload.isArchived;
            delete payload.showInPortfolio;
            delete payload.portfolioTitle;
            delete payload.allowChat; 
            delete payload.allowVoiceCall; 
            delete payload.allowAppInstall; 
            delete payload.allowGames; // حماية الميزة من التعديل عبر العميل
            
            await updateDoc(doc(db, "memories", targetId), { ...payload, updatedAt: serverTimestamp() });
            alert("تم حفظ التعديلات بنجاح! ✨\nالرابط الخاص بك (والـ QR Code) سيظل كما هو ولن يتغير أبداً.");
        } else {
            if (targetId) {
                await updateDoc(doc(db, "memories", targetId), { ...payload, updatedAt: serverTimestamp() });
                alert("تم التعديل بنجاح! الرابط القديم (QR Code) كما هو ولن يتغير.");
            } else {
                await addDoc(collection(db, "memories"), { ...payload, createdAt: serverTimestamp(), isArchived: false }); 
                alert("تم الحفظ بنجاح!");
            }
        }
        
        onSave();
    } catch (e) {
        console.error("Save Error:", e);
        alert("خطأ في الحفظ: " + e.message);
    } finally {
        setSaving(false);
    }
  };

  const IconGrid = ({ onSelect, selected }) => (
      <div className="grid grid-cols-6 gap-2 mt-2 max-h-32 overflow-y-auto no-scrollbar bg-black/10 p-2 rounded-xl border border-white/5">
          {Object.keys(ICON_LIBRARY).map(key => {
              const Icon = ICON_LIBRARY[key];
              return (
                  <button key={key} onClick={(e) => { e.preventDefault(); onSelect(key); }} className={`p-2 rounded-lg flex items-center justify-center transition-all ${selected === key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      <Icon size={18} />
                  </button>
              );
          })}
      </div>
  );

  return (
    <div dir="rtl" className={`min-h-screen p-4 flex items-center justify-center ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fff0f5] text-gray-900'}`}>
      <div className={`w-full max-w-5xl rounded-[2.5rem] relative h-[90vh] flex flex-col overflow-hidden border shadow-2xl ${isDarkMode ? 'bg-[#12121f]/90 backdrop-blur-2xl border-white/10' : 'bg-white/90 backdrop-blur-2xl border-gray-100'}`}>
        
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/5 bg-black/20">
            <div>
                <h2 className="text-xl md:text-2xl font-black font-alexandria mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">{isClientMode ? 'تعديل صفحتي ✨' : (initialData ? 'تعديل الذكرى' : 'تصميم ذكرى جديدة')}</h2>
                <p className="text-xs opacity-50 font-bold tracking-widest">خطوة {step} من 4</p>
            </div>
            <div className="flex gap-4 items-center">
                <div className={`hidden md:flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-bold border ${authState.user ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {authState.user ? <Wifi size={12}/> : <WifiOff size={12}/>}
                    {authState.user ? 'متصل بالسيرفر' : 'غير متصل'}
                </div>
                <div className="flex gap-1.5">
                    {[1,2,3,4].map(s => <div key={s} onClick={()=>setStep(s)} className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${step===s ? 'bg-indigo-500 scale-150 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/20 hover:bg-white/40'}`}></div>)}
                </div>
                <button onClick={onCancel} className="mr-2 p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"><X size={18} strokeWidth={3}/></button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {step === 1 && (
            <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
                {!isClientMode && (
                    <div className="space-y-2 mb-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-indigo-300"><LayoutDashboard size={14}/> عنوان الملف (للوحة التحكم)</label>
                        <input value={formData.memoryTitle} onChange={e=>setFormData({...formData, memoryTitle: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition text-white" placeholder="مثال: عيد ميلاد سارة 2026" />
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">اسم المستلم</label><input value={formData.recipientName} onChange={e=>setFormData({...formData, recipientName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-indigo-500 outline-none transition font-bold" placeholder="مثال: سارة" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">اسم الراسل</label><input value={formData.senderName} onChange={e=>setFormData({...formData, senderName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-indigo-500 outline-none transition font-bold" placeholder="مثال: أحمد" /></div>
                </div>
                
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">عنوان المناسبة (تظهر فوق الاسم)</label><input value={formData.eventTitle} onChange={e=>setFormData({...formData, eventTitle: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-indigo-500 outline-none transition font-bold" placeholder="مثال: عيد ميلاد سعيد" /></div>
                
                <div className="p-6 rounded-3xl bg-black/30 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h4 className="text-sm font-black text-white flex items-center gap-2"><Key size={18} className="text-indigo-400"/> إعدادات كلمات المرور</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2 block">للمشاهدة (تُرسل للحبيب)</label>
                            <input value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-center text-xl font-mono tracking-widest font-black focus:border-indigo-500 outline-none transition" placeholder="****" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 opacity-80 mb-2 block">للتعديل (خاصة بالراسل)</label>
                            <input value={formData.editPassword || ''} onChange={e=>setFormData({...formData, editPassword: e.target.value})} className="w-full bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl text-center text-xl font-mono tracking-widest font-black text-indigo-300 focus:border-indigo-500 outline-none transition" placeholder="****" />
                        </div>
                    </div>
                    {!isClientMode && (
                        <button onClick={(e) => { e.preventDefault(); generatePasswords(); }} className="w-full mt-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 text-sm active:scale-95"><RefreshCw size={16}/> إنشاء أرقام عشوائية</button>
                    )}
                </div>
                
                {!isClientMode && (
                     <div className="p-6 rounded-3xl bg-black/30 border border-white/10 mt-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
                        <label className="text-sm font-black mb-6 flex items-center gap-2 text-white"><Type size={18} className="text-pink-400"/> تخصيص واجهة الدخول</label>
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 block">نص شاشة التحميل الأولية</label>
                                <input value={formData.loadingText} onChange={e=>setFormData({...formData, loadingText: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-sm font-bold text-pink-300 outline-none focus:border-pink-500 transition" placeholder="مثال: جاري تجهيز الذكريات..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 block">العنوان الرئيسي</label><input value={formData.loginTitle} onChange={e=>setFormData({...formData, loginTitle: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-sm outline-none focus:border-pink-500 transition" placeholder="رسالة خاصة..." /></div>
                                <div><label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 block">نص زر الدخول</label><input value={formData.loginButtonText || ''} onChange={e=>setFormData({...formData, loginButtonText: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-sm outline-none focus:border-pink-500 transition" placeholder="مثال: فتح الرسالة ✨" /></div>
                                <div className="md:col-span-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 block">النص المخفي داخل خانة إدخال الباسورد</label><input value={formData.loginPlaceholder || ''} onChange={e=>setFormData({...formData, loginPlaceholder: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-sm outline-none focus:border-pink-500 transition" placeholder="مثال: **** أو اكتب كلمة السر هنا..." /></div>
                                <div className="md:col-span-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 block">الوصف</label><input value={formData.loginDescription} onChange={e=>setFormData({...formData, loginDescription: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-sm outline-none focus:border-pink-500 transition h-16 resize-none" placeholder="المحتوى ده سري..." /></div>
                            </div>
                            <div className="pt-5 border-t border-white/5">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3 block">شعار الدخول (أيقونة أو صورة)</label>
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex-1 w-full"><IconGrid selected={formData.loginIcon || 'Lock'} onSelect={icon => setFormData({...formData, loginIcon: icon})} /></div>
                                    <div className="w-full md:w-1/3 shrink-0">
                                        <CustomFileUpload label="صورة مخصصة" uploading={uploading && uploadState.type === 'loginImage'} progress={uploadState.progress} accept="image/*" onChange={e => handleImageUpload(e, 'loginImage')} icon={ImageIcon}/>
                                        {formData.loginImage && <div className="mt-3 relative inline-block"><img src={formData.loginImage} className="h-16 w-16 object-cover rounded-2xl border-2 border-white/20 shadow-lg" /><button onClick={(e)=>{e.preventDefault(); setFormData({...formData, loginImage:''})}} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow"><X size={12}/></button></div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">رسالة الإهداء الرئيسية (تظهر تحت الاسم)</label>
                    <textarea value={formData.mainMessage} onChange={e=>setFormData({...formData, mainMessage: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-base outline-none focus:border-indigo-500 transition h-32 resize-none font-medium leading-relaxed" placeholder="اكتب رسالة من القلب..." />
                </div>
            </div>
          )}
          {step === 2 && (
             <div className="animate-fade-in space-y-8 max-w-3xl mx-auto">
                 <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="font-bold flex items-center gap-2 mb-4 text-white"><ImageIcon size={18} className="text-indigo-400"/> صورة أو فيديو الغلاف</h3>
                    <CustomFileUpload label={formData.coverImage ? "تغيير الغلاف الحالي" : "اختر ملف الغلاف"} uploading={uploading && uploadState.type === 'cover'} progress={uploadState.progress} accept="image/*,video/*" onChange={e => handleImageUpload(e, 'cover')} icon={formData.coverType === 'video' ? VideoIcon : ImageIcon}/>
                    {formData.coverImage && (
                        <div className="relative mt-4 group w-full md:w-1/2 h-48 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 mx-auto">
                            {formData.coverType === 'video' ? <video src={formData.coverImage} className="h-full w-full object-cover" muted autoPlay loop /> : <img src={formData.coverImage} className="h-full w-full object-cover" alt="Cover"/>}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1"><CheckCircle size={12}/> تم الرفع</div>
                            <button onClick={(e)=>{e.preventDefault(); setFormData({...formData, coverImage:''})}} className="absolute bottom-3 right-3 p-2 bg-red-500/80 hover:bg-red-500 rounded-xl text-white transition backdrop-blur"><Trash2 size={16}/></button>
                        </div>
                    )}
                </div>

                <div className="glass-panel p-6 rounded-3xl relative">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-white"><ListMusic size={18} className="text-purple-400"/> قائمة الأغاني (Playlist)</h3>
                    
                    <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20 mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3 block">إضافة أغنية جديدة</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div><label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-2">اسم الأغنية</label><input value={tempSong.title} onChange={e=>setTempSong({...tempSong, title: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-purple-500 transition text-white" placeholder="مثال: بحبك - عمرو دياب" /></div>
                            <div><label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-2">صورة الألبوم (اختياري)</label>
                                <div className="flex gap-3 items-center h-12">
                                    <div className="flex-1"><CustomFileUpload label={tempSong.image ? 'تغيير' : 'رفع صورة'} uploading={uploading && uploadState.type === 'songImage'} accept="image/*" onChange={e => handleImageUpload(e, 'songImage')} icon={Disc}/></div>
                                    {tempSong.image && <img src={tempSong.image} className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow-lg shrink-0"/>}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mb-4 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                            <button onClick={(e)=>{e.preventDefault(); setTempSong({...tempSong, type:'link', url:''})}} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tempSong.type==='link' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>رابط مباشر (يوتيوب أو MP3)</button>
                            <button onClick={(e)=>{e.preventDefault(); setTempSong({...tempSong, type:'file', url:''})}} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tempSong.type==='file' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>رفع ملف صوتي</button>
                        </div>

                        {tempSong.type === 'link' ? (
                            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-4 transition-colors focus-within:border-purple-500 shadow-inner mb-4">
                                <LinkIcon size={18} className="text-purple-400"/>
                                <input value={tempSong.url} onChange={e=>setTempSong({...tempSong, url: e.target.value})} className="bg-transparent border-none p-4 w-full outline-none text-sm dir-ltr text-left text-white" placeholder="https://youtube.com/watch?v=..." />
                            </div>
                        ) : (
                            <div className="mb-4">
                                <CustomFileUpload label={tempSong.url ? "تم رفع الملف بنجاح (يمكنك التغيير)" : "اختر ملف MP3/WAV"} uploading={uploading && uploadState.type === 'audio'} progress={uploadState.progress} accept="audio/*" onChange={handleAudioUpload} icon={FileAudio}/>
                            </div>
                        )}
                        
                        <button 
                            onClick={(e) => { 
                                e.preventDefault(); 
                                if(tempSong.url) {
                                    const finalTitle = tempSong.title.trim() || 'أغنية جديدة';
                                    const songToAdd = { ...tempSong, title: finalTitle };
                                    addItem('playlist', songToAdd, () => {
                                        setTempSong({ id: null, url: '', title: '', image: '', type: tempSong.type });
                                    });
                                }
                            }} 
                            disabled={!tempSong.url || (uploading && uploadState.type === 'audio')} 
                            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:bg-white/5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 text-white"
                        >
                            <Plus size={18}/> إضافة الأغنية للقائمة
                        </button>
                    </div>

                    {formData.playlist && formData.playlist.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3 block">الأغاني المضافة ({formData.playlist.length})</h4>
                            <div className="space-y-3">
                                {formData.playlist.map((song, idx) => (
                                    <div key={song.id} className="bg-black/40 p-3 rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-purple-500/30 transition-colors">
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('playlist', idx, -1); }} disabled={idx === 0} className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white"><ChevronUp size={14}/></button>
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('playlist', idx, 1); }} disabled={idx === formData.playlist.length - 1} className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white"><ChevronDown size={14}/></button>
                                        </div>
                                        <img src={song.image || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&q=80"} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                                        <div className="flex-1 min-w-0">
                                            <input value={song.title} onChange={e=>updateItem('playlist', song.id, 'title', e.target.value)} className="w-full bg-transparent border-none text-sm font-bold text-white outline-none focus:border-b focus:border-purple-400" />
                                            <p className="text-[10px] opacity-50 truncate flex items-center gap-1 mt-1">{song.type === 'link' && song.url.includes('youtu') ? <Film size={10}/> : <Music size={10}/>} {song.type === 'link' ? 'رابط' : 'ملف صوتي'}</p>
                                        </div>
                                        <button onClick={(e)=>{e.preventDefault(); removeItem('playlist', song.id)}} className="text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg shrink-0 transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass-panel p-6 rounded-3xl relative">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-white"><Camera size={18} className="text-blue-400"/> معرض الذكريات السعيدة</h3>
                    
                    <div className="mb-6">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2 block">عنوان قسم الصور في الصفحة</label>
                        <input value={formData.sectionTitles?.gallery || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, gallery: e.target.value}})} className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl text-sm outline-none focus:border-blue-500 transition text-white" placeholder="مثال: أجمل الذكريات 📸" />
                    </div>

                    <div className="bg-black/30 border border-white/5 p-4 rounded-2xl mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3 block">إضافة عنصر جديد للمعرض</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                             <div className="h-full"><CustomFileUpload label="رفع صورة أو فيديو قصير" uploading={uploading && uploadState.type === 'photo'} progress={uploadState.progress} accept="image/*,video/*" onChange={e => handleImageUpload(e, 'photo')} icon={Plus}/></div>
                             <div className="space-y-3 flex flex-col h-full">
                                <input value={tempPhoto.title} onChange={e=>setTempPhoto({...tempPhoto, title: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm focus:border-blue-400 outline-none transition" placeholder="عنوان الصورة (اختياري)"/>
                                <textarea value={tempPhoto.desc} onChange={e=>setTempPhoto({...tempPhoto, desc: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm flex-1 resize-none focus:border-blue-400 outline-none transition min-h-[80px]" placeholder="اكتب وصفاً أو ذكرى عن هذه اللقطة..."/>
                                <button 
                                    onClick={(e) => { 
                                        e.preventDefault(); 
                                        if (tempPhoto.id) {
                                            setFormData(prev => ({ ...prev, photos: prev.photos.map(x => x.id === tempPhoto.id ? { ...tempPhoto } : x) }));
                                            setTempPhoto({id: null, img:'',title:'',desc:'', type:'image', pos: {x:50, y:50}});
                                        } else {
                                            addItem('photos', tempPhoto.img?tempPhoto:null, ()=>setTempPhoto({id: null, img:'',title:'',desc:'', type:'image', pos: {x:50, y:50}})); 
                                        }
                                    }} 
                                    disabled={!tempPhoto.img} 
                                    className="w-full py-3.5 bg-blue-600 disabled:opacity-30 disabled:bg-white/5 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                >
                                    {tempPhoto.id ? <><Edit3 size={18}/> حفظ التعديلات</> : <><Plus size={18}/> حفظ وإضافة للمعرض</>}
                                </button>
                             </div>
                        </div>
                        {tempPhoto.img && (
                            <div id="cropper-section" className="col-span-1 md:col-span-2 mt-4 p-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                                <ImagePositioner src={tempPhoto.img} pos={tempPhoto.pos || {x:50,y:50}} setPos={(newPos) => setTempPhoto({...tempPhoto, pos: newPos})} type={tempPhoto.type} />
                                <div className="text-center w-full mt-2">
                                    <span className="text-xs font-bold text-blue-300">
                                        {tempPhoto.id ? 'قم بتعديل المقاس ثم اضغط (حفظ التعديلات).' : 'تم الرفع بنجاح! ظبط المقاس واضغط (حفظ وإضافة للمعرض) لتأكيد الصورة.'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {formData.photos.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3 block">العناصر المضافة ({formData.photos.length})</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {formData.photos.map((p, idx) => (
                                    <div key={p.id} className="relative bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col gap-2 group hover:border-white/20 transition-colors">
                                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#050511] shadow-inner">
                                            {p.type === 'video' ? <video src={p.img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted /> : <img src={getOptimizedUrl(p.img)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" style={{ objectPosition: p.pos ? `${p.pos.x}% ${p.pos.y}%` : 'center' }}/>}
                                            
                                            {/* أزرار التعديل والحذف */}
                                            <div className="absolute top-2 left-2 flex gap-1.5 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.preventDefault(); setTempPhoto(p); setTimeout(() => document.getElementById('cropper-section')?.scrollIntoView({behavior: 'smooth', block: 'center'}), 100); }} className="bg-blue-500/90 backdrop-blur p-2 rounded-lg text-white hover:bg-blue-500 transition-colors shadow-lg flex items-center justify-center" title="تعديل القص أو الوصف"><Edit3 size={16}/></button>
                                                <button onClick={(e) => { e.preventDefault(); removeItem('photos', p.id); }} className="bg-red-500/90 backdrop-blur p-2 rounded-lg text-white hover:bg-red-500 transition-colors shadow-lg flex items-center justify-center"><Trash2 size={16}/></button>
                                            </div>
                                            
                                            {/* أزرار الترتيب */}
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-black/70 p-1 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                                                <button onClick={(e) => { e.preventDefault(); moveItemIndex('photos', idx, -1); }} disabled={idx === 0} className="p-1.5 text-white rounded-lg hover:bg-blue-500 disabled:opacity-30 transition-colors"><ChevronRight size={16}/></button>
                                                <button onClick={(e) => { e.preventDefault(); moveItemIndex('photos', idx, 1); }} disabled={idx === formData.photos.length - 1} className="p-1.5 text-white rounded-lg hover:bg-blue-500 disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
                                            </div>
                                            
                                            {p.type === 'video' && <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-md text-white z-10 flex items-center gap-1 text-[9px] font-bold"><Film size={10}/> فيديو</div>}
                                        </div>
                                        <div className="space-y-2 mt-1">
                                            <input value={p.title || ''} onChange={e=>updateItem('photos', p.id, 'title', e.target.value)} className="w-full bg-transparent border-b border-white/10 px-1 py-1.5 text-xs font-bold outline-none focus:border-blue-400 text-white placeholder-gray-500 transition-colors" placeholder="عنوان الصورة (بدون عنوان)"/>
                                            <textarea value={p.desc || ''} onChange={e=>updateItem('photos', p.id, 'desc', e.target.value)} className="w-full bg-transparent border-b border-white/10 px-1 py-1.5 text-[11px] outline-none focus:border-blue-400 h-12 resize-none text-gray-300 placeholder-gray-600 transition-colors custom-scrollbar" placeholder="وصف الصورة..."/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
             </div>
          )}

          {step === 3 && (
             <div className="animate-fade-in grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                
                <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                    <h3 className="font-black text-xl mb-2 flex items-center gap-3 text-white">
                        <span className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg"><Palette size={20}/></span> مكتبة الثيمات الجاهزة
                    </h3>
                    <p className="text-xs opacity-60 mb-8 font-medium leading-relaxed">اختر القالب المناسب للذكرى، كل قالب يطبق ألوان متناسقة ومؤثرات بصرية بضغطة واحدة.</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {PREDEFINED_THEMES.map(theme => {
                            const animData = ANIMATION_TYPES.find(a => a.id === theme.animation);
                            const isSelected = formData.backgroundAnimation === theme.animation && formData.themeColors?.start === theme.colors.start;
                            
                            return (
                                <button 
                                    key={theme.id} 
                                    onClick={(e) => { e.preventDefault(); handleThemeSelect(theme); }} 
                                    className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl ${isSelected ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                                    style={{ background: `linear-gradient(135deg, ${theme.colors.start}, ${theme.colors.end})` }}
                                >
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                    <div className="relative p-5 flex flex-col items-center justify-center gap-3 min-h-[120px]">
                                        <span className="text-4xl drop-shadow-lg group-hover:scale-110 transition-transform">{animData?.icon}</span>
                                        <span className="text-[11px] font-bold tracking-wide bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 w-full text-center truncate" style={{ color: theme.colors.accent }}>{theme.name}</span>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg animate-fade-in">
                                            <CheckCircle size={14} strokeWidth={3}/>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                                {/* 🔔 قسم إشعارات الحب التلقائية - متاح للإدمن فقط */}
                {!isClientMode && (
                    <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-cyan-500/20 relative overflow-hidden mt-6">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400"><BellRing size={24}/></div>
                                <div>
                                    <h3 className="font-black text-xl text-white">إشعارات الحب السرية</h3>
                                    <p className="text-[10px] opacity-60 mt-1 uppercase tracking-widest">رسائل تظهر فجأة كل 20 ثانية</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-cyan-500/10 p-5 rounded-2xl border border-cyan-500/20">
                            <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 block">إضافة إشعار جديد</h4>
                            <div className="flex flex-col md:flex-row gap-3">
                                <input 
                                    value={tempNotification} 
                                    onChange={e=>setTempNotification(e.target.value)} 
                                    className="flex-1 bg-black/40 border border-white/10 p-3.5 rounded-xl text-sm focus:border-cyan-500 outline-none transition font-bold text-white" 
                                    placeholder="اكتب الجملة هنا (مثال: محظوظ جداً بوجودك في حياتي ❤️)"
                                />
                                <button 
                                    onClick={(e) => { 
                                        e.preventDefault(); 
                                        if(tempNotification.trim()) { 
                                            addItem('notifications', { text: tempNotification.trim() }, () => setTempNotification('')); 
                                        } 
                                    }} 
                                    disabled={!tempNotification.trim()} 
                                    className="md:w-auto w-full px-6 py-3.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-[0_5px_15px_rgba(6,182,212,0.3)] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Plus size={18}/> إضافة
                                </button>
                            </div>
                        </div>

                        {formData.notifications && formData.notifications.length > 0 && (
                            <div className="space-y-3 mt-6">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block border-b border-white/5 pb-2">الإشعارات المضافة ({formData.notifications.length})</label>
                                {formData.notifications.map((notif, idx) => (
                                    <div key={notif.id} className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center gap-3 relative group hover:border-cyan-500/30 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('notifications', idx, -1); }} disabled={idx === 0} className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white"><ChevronUp size={14}/></button>
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('notifications', idx, 1); }} disabled={idx === formData.notifications.length - 1} className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white"><ChevronDown size={14}/></button>
                                        </div>
                                        <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg shrink-0"><MessageCircle size={16}/></div>
                                        <input 
                                            value={notif.text || ''} 
                                            onChange={e=>updateItem('notifications', notif.id, 'text', e.target.value)} 
                                            className="w-full bg-transparent border-b border-transparent hover:border-white/10 px-2 py-1 text-sm font-bold outline-none focus:border-cyan-500 text-white transition-colors"
                                        />
                                        <button onClick={(e)=>{e.preventDefault(); removeItem('notifications', notif.id)}} className="text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg shrink-0 transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden border border-rose-500/20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-pink-500"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400"><Gamepad2 size={24}/></div>
                            <div>
                                <h3 className="font-black text-xl text-white">الأسئلة والإجابات</h3>
                                <p className="text-[10px] opacity-60 mt-1 uppercase tracking-widest">تفاعل مباشر من القلب للقلب</p>
                            </div>
                        </div>
                    </div>

                    <div className="animate-fade-in space-y-8">
                        <div>
                            <label className="text-xs font-bold opacity-70 block mb-2">عنوان القسم في الصفحة</label>
                            <input value={formData.sectionTitles?.quiz || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, quiz: e.target.value}})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm font-bold focus:border-rose-500 outline-none transition text-white" placeholder="مثال: إجابات من القلب 💬" />
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                            <div className="p-5 border-b border-white/5 bg-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <label className="text-xs font-bold block text-white">متى يظهر اختبار الأسئلة للعميل؟</label>
                                    <p className="text-[10px] opacity-50 mt-1">حدد طريقة تفاعل الحبيب مع الأسئلة.</p>
                                </div>
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-full md:w-auto">
                                    <button onClick={(e) => { e.preventDefault(); setFormData({...formData, quizMode: 'before_page'}); }} className={`flex-1 md:w-32 py-2.5 rounded-lg text-[10px] font-bold transition shadow-md ${formData.quizMode !== 'inside_page' ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-white'}`}>إجباري (قبل الدخول)</button>
                                    <button onClick={(e) => { e.preventDefault(); setFormData({...formData, quizMode: 'inside_page'}); }} className={`flex-1 md:w-32 py-2.5 rounded-lg text-[10px] font-bold transition shadow-md ${formData.quizMode === 'inside_page' ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-white'}`}>اختياري (زر داخلي)</button>
                                </div>
                            </div>

                            {formData.quizMode === 'inside_page' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in p-5 bg-rose-500/5">
                                    <div>
                                        <label className="text-[10px] font-bold opacity-70 block mb-2 text-rose-300">النص التوضيحي (فوق الزر)</label>
                                        <input value={formData.quizSectionText || ''} onChange={e=>setFormData({...formData, quizSectionText: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm focus:border-rose-400 outline-none transition text-white" placeholder="مثال: مستعد تجاوب من قلبك؟" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold opacity-70 block mb-2 text-rose-300">نص الزر</label>
                                        <input value={formData.quizButtonText || ''} onChange={e=>setFormData({...formData, quizButtonText: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm focus:border-rose-400 outline-none transition text-white" placeholder="مثال: ابدأ اللعبة 🎮" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold opacity-70 block mb-2">رسالة مقدمة الأسئلة (بتظهر قبل ما يجاوب)</label>
                            <textarea value={formData.quizIntroMessage || ''} onChange={e=>setFormData({...formData, quizIntroMessage: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm h-20 resize-none focus:border-rose-500 outline-none transition leading-relaxed text-white" placeholder="مثال: جاوب على الأسئلة دي من قلبك الأول عشان تفتح الهدية! 💌" />
                        </div>

                        <div className="bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20">
                            <h4 className="text-xs font-black uppercase tracking-widest text-rose-400 mb-4 block">إضافة سؤال جديد</h4>
                            <div className="flex flex-col md:flex-row gap-3">
                                <input value={tempQuiz.question} onChange={e=>setTempQuiz({...tempQuiz, question: e.target.value})} className="flex-1 bg-black/40 border border-white/10 p-3.5 rounded-xl text-sm focus:border-rose-500 outline-none transition font-bold text-white" placeholder="اكتب السؤال هنا (مثال: أكتر لحظة حبيتها بينا؟)"/>
                                <button onClick={(e) => { e.preventDefault(); if(tempQuiz.question) { addItem('quiz', tempQuiz, ()=>setTempQuiz({question:'', answer:''})); } }} disabled={!tempQuiz.question} className="md:w-auto w-full px-6 py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-[0_5px_15px_rgba(244,63,94,0.3)] active:scale-95 flex items-center justify-center gap-2"><Plus size={18}/> إضافة</button>
                            </div>
                        </div>

                        {formData.quiz.length > 0 && (
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mt-6 border-b border-white/5 pb-2">الأسئلة المضافة ({formData.quiz.length})</label>
                                {formData.quiz.map((q, idx) => (
                                    <div key={q.id} className="bg-black/30 p-5 rounded-2xl border border-white/10 flex flex-col gap-4 relative group hover:border-rose-500/30 transition-colors shadow-inner">
                                        <div className="flex gap-1.5 justify-end">
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('quiz', idx, -1); }} disabled={idx === 0} className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors text-white"><ChevronUp size={16}/></button>
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('quiz', idx, 1); }} disabled={idx === formData.quiz.length - 1} className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors text-white"><ChevronDown size={16}/></button>
                                            <div className="w-px bg-white/10 mx-1 my-1"></div>
                                            <button onClick={(e) => { e.preventDefault(); removeItem('quiz', q.id); }} className="p-1.5 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                        <div>
                                            <label className="text-[9px] uppercase tracking-widest opacity-40 mb-1 block text-white">نص السؤال</label>
                                            <input 
                                                value={q.question || ''} 
                                                onChange={e => updateItem('quiz', q.id, 'question', e.target.value)} 
                                                className="w-full bg-transparent border-b-2 border-white/10 px-2 py-2 text-base font-bold text-rose-300 focus:border-rose-500 outline-none transition-colors" 
                                                placeholder="السؤال..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] uppercase tracking-widest opacity-40 mb-1 block text-white">الإجابة المسبقة (اختياري)</label>
                                            <textarea 
                                                value={q.answer || ''} 
                                                onChange={e => updateItem('quiz', q.id, 'answer', e.target.value)} 
                                                className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm focus:border-rose-500 outline-none transition-colors resize-none h-20 text-gray-300" 
                                                placeholder="اتركها فارغة ليقوم الحبيب بالإجابة عليها بنفسه عند فتح الرابط."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400"><Calendar size={20}/></div>
                        <h3 className="font-black text-xl text-white">العدادات الزمنية</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold opacity-70 block mb-2">عنوان القسم</label>
                            <input value={formData.sectionTitles?.countdown || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, countdown: e.target.value}})} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition text-white" placeholder="مثال: باقي على الفرح (اختياري)" />
                        </div>
                        
                        <div className="bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 block">إضافة عداد جديد</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input value={tempTimer.label} onChange={e=>setTempTimer({...tempTimer, label: e.target.value})} className="bg-black/40 border border-white/10 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none transition text-white" placeholder="وصف العداد (باقي على عيد ميلادك)"/>
                                <input type="datetime-local" value={tempTimer.date} onChange={e=>setTempTimer({...tempTimer, date: e.target.value})} className="bg-black/40 border border-white/10 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none transition text-left dir-ltr text-white"/>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); addItem('timers', (tempTimer.label && tempTimer.date) ? tempTimer : null, ()=>setTempTimer({label:'', date:''})); }} disabled={!tempTimer.label || !tempTimer.date} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:bg-white/5 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"><Plus size={16}/> إضافة عداد</button>
                        </div>
                        
                        {formData.timers.length > 0 && (
                            <div className="space-y-3 mt-4">
                                {formData.timers.map((t, idx) => (
                                    <div key={t.id} className="bg-black/30 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center gap-4 relative group hover:border-indigo-500/30 transition-colors">
                                        <div className="flex md:flex-col gap-1 order-last md:order-first">
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('timers', idx, -1); }} disabled={idx === 0} className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white"><ChevronUp size={14}/></button>
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('timers', idx, 1); }} disabled={idx === formData.timers.length - 1} className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white"><ChevronDown size={14}/></button>
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[9px] opacity-40 uppercase block mb-1">الوصف</label>
                                                <input value={t.label || ''} onChange={e=>updateItem('timers', t.id, 'label', e.target.value)} className="w-full bg-transparent border-b border-white/10 px-1 py-1.5 text-sm font-bold outline-none focus:border-indigo-500 text-white transition-colors"/>
                                            </div>
                                            <div>
                                                <label className="text-[9px] opacity-40 uppercase block mb-1">التاريخ</label>
                                                <input type="datetime-local" value={t.date || ''} onChange={e=>updateItem('timers', t.id, 'date', e.target.value)} className="w-full bg-transparent border-b border-white/10 px-1 py-1.5 text-sm font-mono outline-none focus:border-indigo-500 text-indigo-300 dir-ltr text-left transition-colors"/>
                                            </div>
                                        </div>
                                        <button onClick={(e)=>{e.preventDefault(); removeItem('timers', t.id)}} className="absolute top-2 right-2 md:relative md:top-auto md:right-auto text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-green-500/20">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <div className="p-2.5 rounded-xl bg-green-500/20 text-green-400"><Milestone size={20}/></div>
                        <h3 className="font-black text-xl text-white">التواريخ المهمة (Timeline)</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold opacity-70 block mb-2">عنوان القسم</label>
                            <input value={formData.sectionTitles?.timeline || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, timeline: e.target.value}})} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl text-sm font-bold focus:border-green-500 outline-none transition text-white" placeholder="مثال: رحلتنا سوا 🚀" />
                        </div>
                        
                        <div className="bg-green-500/10 p-5 rounded-2xl border border-green-500/20">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-3 block">إضافة تاريخ جديد</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input type="date" value={tempTimeline.date} onChange={e=>setTempTimeline({...tempTimeline, date: e.target.value})} className="bg-black/40 border border-white/10 p-3 rounded-xl text-sm focus:border-green-500 outline-none transition text-left dir-ltr text-white"/>
                                <input value={tempTimeline.title} onChange={e=>setTempTimeline({...tempTimeline, title: e.target.value})} className="bg-black/40 border border-white/10 p-3 rounded-xl text-sm focus:border-green-500 outline-none transition text-white" placeholder="الذكرى (مثال: أول مرة نتقابل)"/>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); addItem('timeline', (tempTimeline.title && tempTimeline.date) ? tempTimeline : null, ()=>setTempTimeline({date:'', title:''})); }} disabled={!tempTimeline.title || !tempTimeline.date} className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:bg-white/5 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"><Plus size={16}/> إضافة للرحلة</button>
                        </div>
                        
                        {formData.timeline.length > 0 && (
                            <div className="space-y-3 mt-4 relative border-r-2 border-white/10 pr-4 mr-2">
                                {formData.timeline.map((t, idx) => (
                                    <div key={t.id} className="bg-black/30 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center gap-4 relative group hover:border-green-500/30 transition-colors ml-4 before:absolute before:w-4 before:h-px before:bg-white/20 before:right-[-20px] before:top-1/2">
                                        <div className="flex md:flex-col gap-1 order-last md:order-first">
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('timeline', idx, -1); }} disabled={idx === 0} className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white"><ChevronUp size={14}/></button>
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('timeline', idx, 1); }} disabled={idx === formData.timeline.length - 1} className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white"><ChevronDown size={14}/></button>
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[9px] opacity-40 uppercase block mb-1">الحدث / الذكرى</label>
                                                <input value={t.title || ''} onChange={e=>updateItem('timeline', t.id, 'title', e.target.value)} className="w-full bg-transparent border-b border-white/10 px-1 py-1.5 text-sm font-bold outline-none focus:border-green-500 text-white transition-colors"/>
                                            </div>
                                            <div>
                                                <label className="text-[9px] opacity-40 uppercase block mb-1">التاريخ</label>
                                                <input type="date" value={t.date || ''} onChange={e=>updateItem('timeline', t.id, 'date', e.target.value)} className="w-full bg-transparent border-b border-white/10 px-1 py-1.5 text-sm font-mono outline-none focus:border-green-500 text-green-300 dir-ltr text-left transition-colors"/>
                                            </div>
                                        </div>
                                        <button onClick={(e)=>{e.preventDefault(); removeItem('timeline', t.id)}} className="absolute top-2 left-2 md:relative md:top-auto md:left-auto text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-pink-500/20">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400"><Infinity size={18}/></div>
                            <h3 className="font-black text-lg text-white">الشريط المتحرك</h3>
                        </div>
                        <input value={formData.sectionTitles?.marquees || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, marquees: e.target.value}})} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl mb-4 text-sm font-bold text-pink-300 outline-none focus:border-pink-500" placeholder="عنوان القسم" />
                        
                        <div className="bg-pink-500/5 p-4 rounded-2xl border border-pink-500/10 mb-4">
                            <input value={tempMarquee.text} onChange={e=>setTempMarquee({...tempMarquee, text: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm mb-3 outline-none focus:border-pink-500 text-white" placeholder="اكتب جملة لتتحرك..."/>
                            <IconGrid selected={tempMarquee.icon} onSelect={icon => setTempMarquee({...tempMarquee, icon})} />
                            <button onClick={(e) => { e.preventDefault(); addItem('marquees', tempMarquee.text?tempMarquee:null, ()=>setTempMarquee({...tempMarquee, text:''})); }} disabled={!tempMarquee.text} className="w-full py-2.5 mt-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-30 disabled:bg-white/5 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all active:scale-95"><Plus size={16}/> إضافة</button>
                        </div>
                        
                        <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {formData.marquees.map((m, idx) => {
                                const DynamicIcon = ICON_LIBRARY[m.icon] || Heart;
                                return (
                                <div key={m.id} className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex items-center gap-3 relative group focus-within:border-pink-500/50 transition-colors">
                                    <div className="flex flex-col gap-0.5 shrink-0">
                                       <button onClick={(e) => { e.preventDefault(); moveItemIndex('marquees', idx, -1); }} disabled={idx === 0} className="p-1 bg-black/40 text-white rounded hover:bg-pink-500 disabled:opacity-30 transition"><ChevronUp size={12}/></button>
                                       <button onClick={(e) => { e.preventDefault(); moveItemIndex('marquees', idx, 1); }} disabled={idx === formData.marquees.length - 1} className="p-1 bg-black/40 text-white rounded hover:bg-pink-500 disabled:opacity-30 transition"><ChevronDown size={12}/></button>
                                    </div>
                                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 shrink-0"><DynamicIcon size={14}/></div>
                                    <input value={m.text || ''} onChange={e=>updateItem('marquees', m.id, 'text', e.target.value)} className="w-full bg-transparent border-none p-1 text-sm outline-none text-white font-medium placeholder-gray-600" placeholder="الجملة..."/>
                                    <button onClick={(e)=>{e.preventDefault(); removeItem('marquees', m.id)}} className="text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg shrink-0 transition-colors"><Trash2 size={14}/></button>
                                </div>
                            )})}
                        </div>
                    </div>

                    <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-yellow-500/20">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                            <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400"><Smile size={18}/></div>
                            <h3 className="font-black text-lg text-white">الكروت القلابة</h3>
                        </div>
                        <input value={formData.sectionTitles?.cards || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, cards: e.target.value}})} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl mb-4 text-sm font-bold text-yellow-300 outline-none focus:border-yellow-500" placeholder="عنوان القسم" />
                        
                        <div className="bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10 mb-4">
                            <IconGrid selected={tempFlip.icon} onSelect={icon => setTempFlip({...tempFlip, icon})} />
                            <input value={tempFlip.hint} onChange={e=>setTempFlip({...tempFlip, hint: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm mt-4 mb-3 outline-none focus:border-yellow-500 text-white" placeholder="النص الظاهر من الخارج..."/>
                            <textarea value={tempFlip.message} onChange={e=>setTempFlip({...tempFlip, message: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm h-16 resize-none outline-none focus:border-yellow-500 text-white" placeholder="الرسالة المخفية بالداخل..."/>
                            <button onClick={(e) => { e.preventDefault(); addItem('flipCards', tempFlip.message?tempFlip:null, ()=>setTempFlip({...tempFlip, message:'', hint:''})); }} disabled={!tempFlip.message} className="w-full py-2.5 mt-3 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-30 disabled:bg-white/5 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"><Plus size={16}/> إضافة كارت</button>
                        </div>
                    </div>
                </div>
                
                {formData.flipCards.length > 0 && (
                    <div className="glass-panel p-6 rounded-[2rem] border border-white/5 mt-[-1.5rem]">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4 block">الكروت المضافة ({formData.flipCards.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {formData.flipCards.map((c, idx) => {
                                const DynIcon = ICON_LIBRARY[c.icon] || Star;
                                return (
                                <div key={c.id} className="bg-black/30 p-4 rounded-2xl border border-white/10 flex flex-col gap-3 relative group hover:border-yellow-500/30 transition-colors">
                                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                                        <div className="flex bg-black/60 rounded-lg overflow-hidden border border-white/10">
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('flipCards', idx, -1); }} disabled={idx === 0} className="p-1.5 text-white hover:bg-yellow-500 disabled:opacity-30 transition-colors"><ChevronRight size={12}/></button>
                                            <button onClick={(e) => { e.preventDefault(); moveItemIndex('flipCards', idx, 1); }} disabled={idx === formData.flipCards.length - 1} className="p-1.5 text-white hover:bg-yellow-500 disabled:opacity-30 border-r border-white/10 transition-colors"><ChevronLeft size={12}/></button>
                                        </div>
                                        <button onClick={(e)=>{e.preventDefault(); removeItem('flipCards', c.id)}} className="text-red-400 hover:bg-red-500 hover:text-white p-1.5 bg-black/60 border border-white/10 rounded-lg transition-colors"><Trash2 size={12}/></button>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-yellow-400 mb-1"><DynIcon size={16}/> <span className="text-[9px] uppercase tracking-widest font-black opacity-50 text-white">تعديل الكارت</span></div>
                                    
                                    <div>
                                        <label className="text-[9px] opacity-40 block mb-1">النص الظاهر</label>
                                        <input value={c.hint || ''} onChange={e=>updateItem('flipCards', c.id, 'hint', e.target.value)} className="w-full bg-transparent border-b border-white/10 px-1 py-1.5 text-sm font-bold outline-none focus:border-yellow-500 text-white transition-colors" placeholder="النص الظاهر..."/>
                                    </div>
                                    <div>
                                        <label className="text-[9px] opacity-40 block mb-1 mt-1">الرسالة المخفية</label>
                                        <textarea value={c.message || ''} onChange={e=>updateItem('flipCards', c.id, 'message', e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded-xl text-sm outline-none focus:border-yellow-500 h-20 resize-none text-gray-300 transition-colors custom-scrollbar" placeholder="الرسالة..."/>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                )}
             </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in space-y-8 max-w-2xl mx-auto text-center">
                
               <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] text-right mb-6">
                    <label className="text-lg font-black mb-6 flex items-center gap-3 text-white"><ListOrdered size={20} className="text-indigo-400"/> ترتيب أقسام الصفحة</label>
                    <p className="text-xs opacity-60 mb-6 font-medium leading-relaxed">حدد الترتيب الذي سيظهر به المحتوى للعميل (الأعلى يظهر أولاً).</p>
                    <div className="space-y-3">
                        {formData.sectionOrder.map((sec, idx) => (
                            <div key={sec} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 transition-all hover:bg-black/60 hover:border-white/20 group">
                                <span className="text-sm font-bold text-white flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-gray-400 font-mono">{idx + 1}</div> {SECTION_NAMES[sec]}</span>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.preventDefault(); moveSection(idx, -1); }} disabled={idx === 0} className="p-2 disabled:opacity-20 hover:bg-white/10 rounded-lg text-white transition bg-white/5"><ChevronUp size={16}/></button>
                                    <button onClick={(e) => { e.preventDefault(); moveSection(idx, 1); }} disabled={idx === formData.sectionOrder.length - 1} className="p-2 disabled:opacity-20 hover:bg-white/10 rounded-lg text-white transition bg-white/5"><ChevronDown size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
               </div>

               <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] text-right space-y-6">
                   <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                       <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400"><Lock size={20}/></div>
                       <h3 className="font-black text-xl text-white">الرسالة السرية النهائية</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div>
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-2 text-purple-300">النص على الزر أسفل الصفحة</label>
                            <input value={formData.secretButtonLabel} onChange={e=>setFormData({...formData, secretButtonLabel: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-purple-500 transition text-white" placeholder="مثال: لدي رسالة سرية لك 🔒" />
                       </div>
                       <div>
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-2 text-purple-300">عنوان نافذة الرسالة</label>
                            <input value={formData.secretModalTitle} onChange={e=>setFormData({...formData, secretModalTitle: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-purple-500 transition text-white" placeholder="مثال: رسالة خاصة 💌" />
                       </div>
                   </div>

                   <div>
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-2 text-purple-300">محتوى الرسالة (يدعم الأسطر المتعددة والإيموجي)</label>
                       <textarea value={formData.secretMessage} onChange={e=>setFormData({...formData, secretMessage: e.target.value})} className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-purple-500 transition h-32 resize-none custom-scrollbar leading-relaxed text-white" placeholder="اكتب الرسالة السرية هنا..." />
                   </div>
                   
                   {!isClientMode && (
                       <div className="mt-8 pt-6 border-t border-white/10">
                            <label className="flex items-center justify-between cursor-pointer group bg-black/20 p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                                <div>
                                    <div className="text-sm font-bold flex items-center gap-2 text-white group-hover:text-yellow-400 transition-colors"><Globe size={16}/> نشر في معرض الأعمال</div>
                                    <p className="text-[10px] opacity-50 mt-1">عرض كنموذج في صفحة الموقع الرئيسية لجذب عملاء.</p>
                                </div>
                                <input type="checkbox" checked={formData.showInPortfolio} onChange={e=>setFormData({...formData, showInPortfolio: e.target.checked})} className="w-5 h-5 accent-yellow-500"/>
                            </label>
                            
                            {formData.showInPortfolio && (
                                <div className="mt-4 animate-fade-in pl-4 border-r-2 border-yellow-500/50">
                                    <label className="text-[10px] font-black uppercase tracking-widest block mb-2 text-yellow-400">الاسم الظاهر في المعرض (للحفاظ على الخصوصية)</label>
                                    <input value={formData.portfolioTitle} onChange={e=>setFormData({...formData, portfolioTitle: e.target.value})} className="w-full bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-yellow-500 text-yellow-100 placeholder-yellow-700/50 transition" placeholder="مثال: هدية عيد ميلاد (يظهر بدون أسماء حقيقية)" />
                                </div>
                            )}
                       </div>
                   )}
               </div>
               
               <div className="pt-4">
                   <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce-slow"><CheckCircle size={40}/></div>
                   <h3 className="text-3xl font-black font-alexandria mb-8 text-white drop-shadow-md">كل حاجة جاهزة! ✨</h3>
                   <button onClick={handleSave} disabled={saving} className="w-full max-w-sm mx-auto py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-[1.5rem] font-bold text-white shadow-[0_10px_40px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all active:scale-95 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                       {saving ? <><Loader2 size={24} className="animate-spin" /> جاري الحفظ والتأمين...</> : (isClientMode ? 'حفظ التعديلات بأمان' : 'حفظ وتأكيد البيانات 🔗')}
                   </button>
                   {!isClientMode && <p className="text-xs opacity-40 mt-4 font-bold text-green-400">ملاحظة: سيتم الحفاظ على الرابط الأصلي والـ QR Code الخاص بالعميل كما هو.</p>}
               </div>
            </div>
          )}

        </div>
        
        {step < 4 && (
            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
                <button onClick={(e) => { e.preventDefault(); setStep(s=>Math.max(1, s-1)); }} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/5 text-white hover:bg-white/10'}`}><ChevronRight size={18}/> السابق</button>
                
                <div className="flex gap-1.5 md:hidden">
                    {[1,2,3,4].map(s => <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${step===s ? 'bg-indigo-500 scale-150' : 'bg-white/20'}`}></div>)}
                </div>

                <button onClick={(e) => { e.preventDefault(); setStep(s=>Math.min(4, s+1)); }} className="px-8 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-transform active:scale-95 shadow-lg">التالي <ChevronLeft size={18}/></button>
            </div>
        )}
      </div>
    </div>
  );
};

// --- GAME, CHAT & POPUPS ---
// --- Custom Audio Player Component for Chat ---
const ChatAudioPlayer = ({ src, isMe, accentColor }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    // ✅ إنشاء معرّف فريد لكل مشغل صوت حتى لا تتداخل الأحداث
    const sourceId = useMemo(() => 'voice-note-' + Math.random().toString(36).substr(2, 9), []);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            // 🎵 إرسال أمر لإعادة تشغيل الموسيقى
            window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: false, source: sourceId } }));
        } else {
            // 🎵 إرسال أمر لإيقاف الموسيقى
            window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: true, source: sourceId } }));
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const dur = audioRef.current.duration || 0;
            setProgress((current / dur) * 100 || 0);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        // 🎵 إرسال أمر لإعادة تشغيل الموسيقى بعد انتهاء الرسالة الصوتية
        window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: false, source: sourceId } }));
    };

    // التأكد من تحرير التحكم في الموسيقى عند حذف المكون وهو يعمل
    useEffect(() => {
        return () => {
            if (isPlaying) {
                window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: false, source: sourceId } }));
            }
        };
    }, [isPlaying, sourceId]);

    const formatTime = (secs) => {
        if (!secs || isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="flex items-center gap-3 w-full min-w-[180px] md:min-w-[220px]">
            <button 
                onClick={togglePlay} 
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-md ${isMe ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                style={!isMe ? { backgroundColor: accentColor } : {}}
            >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
            </button>
            
            <div className="flex-1 flex flex-col justify-center gap-1.5">
                {/* Waveform visualizer simulation */}
                <div className="flex items-end gap-0.5 h-6 w-full opacity-80 overflow-hidden">
                    {[...Array(20)].map((_, i) => {
                        const h = isPlaying ? Math.max(20, Math.random() * 100) : 20 + Math.sin(i) * 20;
                        return (
                            <div 
                                key={i} 
                                className={`w-1 rounded-full transition-all duration-150 ${isMe ? 'bg-white/60' : 'bg-gray-400'}`} 
                                style={{ height: `${h}%`, backgroundColor: (!isMe && i < (progress/5)) ? accentColor : undefined }}
                            />
                        );
                    })}
                </div>
                
                {/* Progress bar and time */}
                <div className="flex items-center gap-2">
                    <div className={`h-1 flex-1 rounded-full overflow-hidden ${isMe ? 'bg-white/20' : 'bg-gray-300'}`}>
                        <div className={`h-full transition-all duration-200 ${isMe ? 'bg-white' : ''}`} style={{ width: `${progress}%`, backgroundColor: !isMe ? accentColor : undefined }} />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${isMe ? 'text-white/80' : 'text-gray-500'}`}>
                        {formatTime(audioRef.current?.currentTime || 0)}
                    </span>
                </div>
            </div>
            
            <audio 
                ref={audioRef} 
                src={src} 
                onTimeUpdate={handleTimeUpdate} 
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                className="hidden" 
            />
        </div>
    );
};

const ChatWidget = ({ memoryData, memoryId, isDarkMode, themeColors }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatNotification, setChatNotification] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    // --- متغيرات التسجيل الصوتي ---
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    
    // --- متغيرات الإعدادات الجديدة ---
    const [showSettings, setShowSettings] = useState(false);
    const [chatBg, setChatBg] = useState(memoryData?.chatBg || '');
    const [bgOpacity, setBgOpacity] = useState(memoryData?.chatBgOpacity !== undefined ? memoryData?.chatBgOpacity : 0.2);
    const [bgPosition, setBgPosition] = useState(memoryData?.chatBgPosition || {x: 50, y: 50});
    const [isUploadingBg, setIsUploadingBg] = useState(false);

    // --- متغيرات حالة الاتصال الجديدة ---
    const [presenceData, setPresenceData] = useState({});
    const [currentTime, setCurrentTime] = useState(Date.now());

    // --- متغيرات المكالمات الصوتية الحقيقية (WebRTC) ---
    const [callState, setCallState] = useState({ status: 'idle' }); // idle, ringing, incoming, connected
    const callStateRef = useRef(callState);
    useEffect(() => { callStateRef.current = callState; }, [callState]);
    
    const [remoteStream, setRemoteStream] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const processedCandidatesRef = useRef(new Set());
    const callTimerRef = useRef(null);

    const rtcConfig = useMemo(() => ({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    }), []);

    const cleanupCallLocal = () => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        setRemoteStream(null);
        setCallState({ status: 'idle' });
        processedCandidatesRef.current.clear();
        clearInterval(callTimerRef.current);
        setCallDuration(0);
    };

    const startCall = async () => {
        try {
            cleanupCallLocal(); 
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            pcRef.current = new RTCPeerConnection(rtcConfig);
            stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));

            pcRef.current.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            pcRef.current.onicecandidate = event => {
                if (event.candidate) {
                    updateDoc(doc(db, 'memories', memoryId), {
                        'rtcCall.callerCandidates': arrayUnion(event.candidate.toJSON())
                    }).catch(e => {});
                }
            };

            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);

            await updateDoc(doc(db, 'memories', memoryId), {
                rtcCall: {
                    status: 'ringing',
                    callerId: deviceId,
                    callerName: userName,
                    offer: { type: offer.type, sdp: offer.sdp },
                    callerCandidates: [],
                    calleeCandidates: [],
                    timestamp: Date.now()
                }
            });

            setCallState({ status: 'ringing' });
        } catch (e) {
            console.error("Error starting call:", e);
            alert("يرجى السماح للمتصفح باستخدام الميكروفون لبدء المكالمة.");
            cleanupCallLocal();
        }
    };

    const answerCall = async () => {
        try {
            const incomingOffer = callState.offer;
            if (!incomingOffer) return;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            pcRef.current = new RTCPeerConnection(rtcConfig);
            stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));

            pcRef.current.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            pcRef.current.onicecandidate = event => {
                if (event.candidate) {
                    updateDoc(doc(db, 'memories', memoryId), {
                        'rtcCall.calleeCandidates': arrayUnion(event.candidate.toJSON())
                    }).catch(e => {});
                }
            };

            await pcRef.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);

            await updateDoc(doc(db, 'memories', memoryId), {
                'rtcCall.status': 'connected',
                'rtcCall.answer': { type: answer.type, sdp: answer.sdp }
            });

            setCallState({ status: 'connected' });
        } catch (e) {
            console.error("Error answering:", e);
            alert("حدث خطأ أثناء الرد على المكالمة. يرجى التأكد من صلاحيات الميكروفون.");
            endCall();
        }
    };

    const endCall = async () => {
        cleanupCallLocal();
        try {
            await updateDoc(doc(db, 'memories', memoryId), {
                'rtcCall.status': 'ended'
            });
        } catch(e) {}
    };

    useEffect(() => {
        if (callState.status === 'connected') {
            // 🎵 إيقاف الموسيقى لأن المكالمة بدأت
            window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: true, source: 'call' } }));
            
            callTimerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            // 🎵 إعادة تشغيل الموسيقى في حال كانت شغالة قبل المكالمة وتم إنهاؤها
            window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: false, source: 'call' } }));
            
            clearInterval(callTimerRef.current);
            if (callState.status !== 'ringing') setCallDuration(0);
        }
        return () => {
            clearInterval(callTimerRef.current);
            window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: false, source: 'call' } }));
        };
    }, [callState.status]);

    const formatCallTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const scrollContainerRef = useRef(null);
    const inputRef = useRef(null);
    const initialLoadRef = useRef(true);
    const lastMessageCount = useRef(0);

    const EMOJIS = ['❤️', '😂', '😍', '😭', '🥺', '✨', '🔥', '🎉', '👍', '🙏'];

    const [deviceId] = useState(() => {
        try {
            let id = localStorage.getItem('secret_chat_device_id');
            if (!id) {
                id = 'dev_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
                localStorage.setItem('secret_chat_device_id', id);
            }
            return id;
        } catch(e) {
            return 'dev_' + Date.now().toString(36);
        }
    });

    const [userName, setUserName] = useState(() => {
        try { return localStorage.getItem(`secret_chat_name_${memoryId}`) || ''; } 
        catch(e) { return ''; }
    });
    const [isNameSet, setIsNameSet] = useState(() => {
        try { return !!localStorage.getItem(`secret_chat_name_${memoryId}`); } 
        catch(e) { return false; }
    });

    const accentColor = themeColors?.accent || '#f472b6';
    const isOpenRef = useRef(isOpen);
    const [viewportHeight, setViewportHeight] = useState('100dvh');

    // ✅ تحديث الوقت كل دقيقة لتحديث عبارة "منذ X دقيقة"
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    // ✅ إرسال حالة الاتصال الخاصة بالمستخدم إلى قاعدة البيانات بشكل أسرع
    useEffect(() => {
        if (!isOpen || !memoryId || !db || !deviceId) return;

        const updatePresence = async () => {
            try {
                await updateDoc(doc(db, 'memories', memoryId), {
                    [`chatPresence.${deviceId}`]: Date.now()
                });
            } catch(e) { console.error("Error updating presence:", e); }
        };

        updatePresence(); // تحديث فوري عند الفتح
        // ✅ زيادة الوقت لـ 60 ثانية لتخفيف الضغط الرهيب على الشات ومنع التقطيع
        const interval = setInterval(updatePresence, 60000); 
        
        return () => clearInterval(interval);
    }, [isOpen, memoryId, deviceId]);

    // ✅ تتبع ارتفاع الشاشة الحقيقي (Visual Viewport) لمنع اختفاء الهيدر مع الكيبورد
    useEffect(() => {
        if (!isOpen || typeof window === 'undefined' || !window.visualViewport) return;
        
        const handleResize = () => {
            setViewportHeight(`${window.visualViewport.height}px`);
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
                }
            }, 50);
        };

        window.visualViewport.addEventListener('resize', handleResize);
        handleResize(); // تعيين الارتفاع المبدئي

        return () => window.visualViewport.removeEventListener('resize', handleResize);
    }, [isOpen]);

    // ✅ تثبيت الشاشة بشكل آمن لمنع المتصفح من رفع المحادثة والإخفاء
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; 
            setUnreadCount(0);
            setChatNotification(null);
            setTimeout(() => {
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }, 100);
            
            // منع المتصفح من رفع الجسم (body) خارج النطاق المرئي
            const preventScroll = () => {
                if (window.scrollY > 0) window.scrollTo(0, 0);
            };
            window.addEventListener('scroll', preventScroll);

            // منع السحب المطاطي (Rubber-banding) وتحرك الشاشة عند السحب خارج منطقة الرسائل
            const preventTouchMove = (e) => {
                // السماح بالسحب فقط داخل منطقة الرسائل والإعدادات أو حقول الإدخال
                if (e.target.closest('.chat-scrollbar') || e.target.closest('input') || e.target.closest('textarea')) {
                    return;
                }
                if (e.cancelable) {
                    e.preventDefault();
                }
            };
            document.addEventListener('touchmove', preventTouchMove, { passive: false });

            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('scroll', preventScroll);
                document.removeEventListener('touchmove', preventTouchMove);
            };
        }
    }, [isOpen]);

    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    // تحديث حالة قراءة الرسائل عند فتح الشات
    useEffect(() => {
        if (!isOpen || messages.length === 0 || !memoryId || !db) return;

        const unreadMsgs = messages.filter(m => m.deviceId !== deviceId && m.senderName !== userName && !m.read);
        if (unreadMsgs.length > 0) {
            const markMessagesAsRead = async () => {
                try {
                    const docRef = doc(db, 'memories', memoryId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const dbMsgs = docSnap.data().chatMessages || [];
                        let changed = false;
                        const updatedMsgs = dbMsgs.map(m => {
                            if (m.deviceId !== deviceId && m.senderName !== userName && !m.read) {
                                changed = true;
                                return { ...m, read: true };
                            }
                            return m;
                        });
                        if (changed) {
                            await updateDoc(docRef, { chatMessages: updatedMsgs });
                        }
                    }
                } catch (e) {
                    console.error("Error marking messages as read:", e);
                }
            };
            markMessagesAsRead();
        }
    }, [isOpen, messages, deviceId, userName, memoryId]);

    useEffect(() => {
        if (!memoryId || !db) return;
        
        const unsubscribe = onSnapshot(doc(db, 'memories', memoryId), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                const msgs = data.chatMessages || [];
                
                // تزامن الإعدادات الجديدة (الخلفية وشفافيتها)
                if (data.chatBg !== undefined) setChatBg(data.chatBg);
                if (data.chatBgOpacity !== undefined) setBgOpacity(data.chatBgOpacity);
                if (data.chatBgPosition !== undefined) setBgPosition(data.chatBgPosition);
                
                // تحديث حالة الاتصال
                if (data.chatPresence) setPresenceData(data.chatPresence);
                
                // --- نظام المكالمات الصوتية الحية ---
                if (data.rtcCall) {
                    const call = data.rtcCall;
                    const currentCallState = callStateRef.current;
                    
                    if (call.status === 'ringing' && call.callerId !== deviceId && currentCallState.status === 'idle') {
                        if (Date.now() - call.timestamp < 60000) { 
                            setCallState({ status: 'incoming', callerName: call.callerName, offer: call.offer });
                            setIsOpen(true); // فتح الشات إجبارياً للرد
                            playChatNotificationSound();
                        }
                    }

                    if (call.status === 'connected' && call.callerId === deviceId && currentCallState.status === 'ringing') {
                        if (call.answer && pcRef.current && !pcRef.current.currentRemoteDescription) {
                            pcRef.current.setRemoteDescription(new RTCSessionDescription(call.answer)).catch(e => console.error(e));
                        }
                        setCallState({ status: 'connected' });
                    }

                    if (call.status === 'ended' && currentCallState.status !== 'idle') {
                        cleanupCallLocal();
                    }

                    if (pcRef.current && pcRef.current.remoteDescription && call.status !== 'ended') {
                        const isCaller = call.callerId === deviceId;
                        const candidates = isCaller ? call.calleeCandidates : call.callerCandidates;
                        candidates?.forEach(c => {
                            const candStr = JSON.stringify(c);
                            if (!processedCandidatesRef.current.has(candStr)) {
                                processedCandidatesRef.current.add(candStr);
                                pcRef.current.addIceCandidate(new RTCIceCandidate(c)).catch(e => {});
                            }
                        });
                    }
                }

                // دمج الرسائل السريعة
                setMessages(prev => {
                    if (msgs.length === 0 && prev.filter(p => p.isTemp).length === 0) return []; 
                    
                    const merged = [...msgs];
                    const now = Date.now();
                    prev.forEach(p => {
                        // الاحتفاظ بالرسائل المؤقتة (التي يتم رفعها) والرسائل الحديثة
                        if (p.isTemp) {
                            if(!merged.find(m => m.id === p.id)) merged.push(p);
                        } else if(!merged.find(m => m.id === p.id) && (now - p.timestamp < 10000)) {
                            merged.push(p);
                        }
                    });
                    merged.sort((a, b) => a.timestamp - b.timestamp);
                    return merged;
                });

                if (!initialLoadRef.current) {
                    if (msgs.length > lastMessageCount.current) {
                        const newMsgs = msgs.slice(lastMessageCount.current);
                        newMsgs.forEach(newMsg => {
                            if (newMsg.deviceId !== deviceId && newMsg.senderName !== userName) {
                                if (!isOpenRef.current) {
                                    playChatNotificationSound();
                                    setUnreadCount(prev => prev + 1);
                                    setChatNotification({ sender: `${newMsg.senderName || 'رسالة جديدة'} 💬`, text: newMsg.type === 'audio' ? 'رسالة صوتية 🎙️' : newMsg.text });
                                    setTimeout(() => setChatNotification(null), 8000); 
                                } else {
                                    playSoftNotificationChime();
                                }
                            }
                        });
                    }
                } else {
                    initialLoadRef.current = false;
                }
                
                lastMessageCount.current = msgs.length;

                if (isOpenRef.current) {
                    setTimeout(() => {
                        if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
                        }
                    }, 50); // Faster scroll on new message
                }
            }
        }, (err) => console.error("Chat sync error", err));
        
        return () => unsubscribe();
    }, [memoryId, deviceId, userName]);

    const handleStartChat = (e) => {
        e.preventDefault();
        if(userName.trim()) {
            try { localStorage.setItem(`secret_chat_name_${memoryId}`, userName.trim()); } catch(e){}
            setIsNameSet(true);
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !isNameSet) return;
        
        const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const text = newMessage.trim();
        
        const newMsgObj = {
            id: newId,
            text,
            senderName: userName,
            deviceId: deviceId,
            timestamp: Date.now(),
            read: false
        };

        // Optimistic UI update for immediate feedback
        setMessages(prev => {
            if (prev.some(m => m.id === newId)) return prev;
            return [...prev, newMsgObj];
        });
        
        setNewMessage('');
        
        // ✅ الحفاظ على التركيز لمنع الكيبورد من الاختفاء وتجنب رفع الصفحة الإجباري
        if (inputRef.current) {
            inputRef.current.focus({ preventScroll: true });
        }

        setTimeout(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 10); // Ultra fast scroll
        
        try {
            await updateDoc(doc(db, 'memories', memoryId), {
                chatMessages: arrayUnion(newMsgObj)
            });
        } catch (err) {
            console.error(err);
            // Optionally remove message if it failed, but let's keep it simple
        }
    };

    const handleDeleteChat = async () => {
        if (!window.confirm('هل أنت متأكد من مسح المحادثة بالكامل؟ سيتم مسحها من عند الطرفين.')) return;
        
        setMessages([]); 
        
        try {
            await updateDoc(doc(db, 'memories', memoryId), { chatMessages: [] });
        } catch (err) {
            console.error("Error deleting chat:", err);
            alert("حدث خطأ أثناء حذف المحادثة.");
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 🎵 إيقاف الموسيقى تلقائياً عند بدء التسجيل
            window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: true, source: 'recording' } }));

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                // 🎵 إعادة تشغيل الموسيقى بعد إيقاف التسجيل
                window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: false, source: 'recording' } }));

                if (audioChunksRef.current.length === 0) return;
                
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                // إنشاء مسار محلي وعرض الرسالة فوراً للمستخدم لسرعة الاستجابة
                const localUrl = URL.createObjectURL(audioBlob);
                const tempId = 'temp_' + Date.now();
                const tempMsg = {
                    id: tempId, type: 'audio', audioUrl: localUrl, senderName: userName,
                    deviceId: deviceId, timestamp: Date.now(), read: false, isTemp: true
                };
                
                setMessages(prev => [...prev, tempMsg]);
                setTimeout(() => {
                    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
                }, 50);

                const fd = new FormData();
                fd.append('file', audioBlob);
                fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                fd.append('resource_type', 'auto');

                try {
                    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
                        method: 'POST', body: fd
                    });
                    const data = await res.json();
                    if (data.secure_url) {
                        await sendAudioMessage(data.secure_url, tempId);
                    }
                } catch (err) {
                    console.error("Audio upload error", err);
                    alert("فشل إرسال المقطع الصوتي");
                    setMessages(prev => prev.filter(m => m.id !== tempId)); // إزالة الرسالة المؤقتة عند الفشل
                }
                
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied", err);
            alert("يرجى السماح بالوصول للميكروفون لتسجيل الصوت.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
            // 🎵 إعادة تشغيل الموسيقى (كإجراء احترازي إضافي)
            window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: false, source: 'recording' } }));
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = null; // Prevent upload
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
            // 🎵 إعادة تشغيل الموسيقى عند الإلغاء
            window.dispatchEvent(new CustomEvent('control-bg-music', { detail: { pause: false, source: 'recording' } }));
        }
    };

    const sendAudioMessage = async (audioUrl, tempId) => {
        const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const newMsgObj = {
            id: newId, type: 'audio', audioUrl, senderName: userName,
            deviceId: deviceId, timestamp: Date.now(), read: false
        };

        // استبدال الرسالة المؤقتة بالرسالة الحقيقية
        setMessages(prev => prev.map(m => m.id === tempId ? newMsgObj : m));

        try {
            await updateDoc(doc(db, 'memories', memoryId), { chatMessages: arrayUnion(newMsgObj) });
        } catch (err) { console.error(err); }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
        setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 10);
    };

    const addEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 10);
    };

    // --- دالة رفع خلفية المحادثة ---
    const handleBgUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) return alert("حجم الصورة كبير جداً");
        
        setIsUploadingBg(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); 
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            if (data.secure_url) {
                setChatBg(data.secure_url);
            }
        } catch (err) {
            console.error(err);
            alert('فشل رفع الصورة، تأكد من الاتصال بالإنترنت.');
        }
        setIsUploadingBg(false);
    };

    // --- حساب حالة ظهور الطرف الآخر ---
    const getOtherUserPresence = () => {
        if (!presenceData) return null;
        let latestSeen = 0;
        for (const [id, time] of Object.entries(presenceData)) {
            if (id !== deviceId && time > latestSeen) {
                latestSeen = time;
            }
        }
        return latestSeen || null;
    };

    const otherLastSeen = getOtherUserPresence();
    let isOnline = false;
    let statusText = 'غير متصل';

    if (otherLastSeen) {
        const diffMin = Math.floor((currentTime - otherLastSeen) / 60000);
        if (diffMin < 2) { 
            isOnline = true;
            statusText = 'متصل الآن';
        } else if (diffMin < 60) {
            statusText = `آخر ظهور منذ ${diffMin} دقيقة`;
        } else if (diffMin < 1440) {
            statusText = `آخر ظهور منذ ${Math.floor(diffMin / 60)} ساعة`;
        } else {
            statusText = `آخر ظهور منذ ${Math.floor(diffMin / 1440)} يوم`;
        }
    }
    
    // دالة آمنة لاستخراج اسم الطرف الآخر
    const getOtherUserName = () => {
        if (!messages || messages.length === 0) return 'محادثة سرية';
        // البحث من الخلف للأمام لإيجاد أحدث اسم
        for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            if (m && m.deviceId !== deviceId && m.senderName !== userName && m.senderName) {
                return m.senderName;
            }
        }
        return 'محادثة سرية';
    };

    return (
        <>
            <style>{`
                .chat-scrollbar::-webkit-scrollbar { width: 5px; }
                .chat-scrollbar::-webkit-scrollbar-track { background: transparent; margin-block: 10px; }
                .chat-scrollbar::-webkit-scrollbar-thumb { background-color: ${accentColor}80; border-radius: 10px; }
                .chat-scrollbar::-webkit-scrollbar-thumb:hover { background-color: ${accentColor}; }
            `}</style>
            
            {/* إشعار الرسائل المطور للموبايل */}
            {chatNotification && !isOpen && (
                <div 
                    onClick={() => setIsOpen(true)}
                    className="fixed top-20 left-4 right-4 md:left-auto md:right-8 md:w-80 z-[9999] p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] cursor-pointer animate-modal-spring border backdrop-blur-2xl transition-all hover:scale-[1.02] flex flex-col gap-2"
                    style={{ 
                        backgroundColor: isDarkMode ? 'rgba(18, 18, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                        borderBottom: `3px solid ${accentColor}`,
                        boxSizing: 'border-box' 
                    }}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <div className="p-2 rounded-full shrink-0" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                                <MessageSquare size={18} className="animate-bounce" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-bold font-alexandria truncate block" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                                    {chatNotification.sender}
                                </span>
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                            الآن
                        </span>
                    </div>
                    
                    <p className="text-xs font-medium line-clamp-2 leading-relaxed px-1 break-words" style={{ color: isDarkMode ? '#ccc' : '#555' }}>
                        {chatNotification.text}
                    </p>
                    
                    <div className="text-[10px] text-center mt-1 opacity-80 font-bold py-1 rounded-xl bg-black/5" style={{ color: accentColor }}>
                        اضغط للرد 💬
                    </div>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 md:bottom-10 right-6 z-[150] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform"
                style={{ backgroundColor: accentColor, color: '#fff' }}
                title="محادثتنا 💬"
            >
                <MessageSquare size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-red-50 text-white text-[10px] font-bold items-center justify-center border-2 border-white shadow-sm">
                        {unreadCount}
                      </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div 
                    dir="rtl" 
                    className="fixed z-[200] flex flex-col items-center justify-end md:justify-center p-0 md:p-4 bg-black/40 backdrop-blur-md overscroll-none" 
                    style={{ top: 0, left: 0, right: 0, height: viewportHeight }}
                >
                    <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
                    <div 
                        className={`relative z-10 w-full md:max-w-md flex flex-col md:rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.5)] overflow-hidden border animate-slide-up backdrop-blur-3xl ${isDarkMode ? 'bg-black/50 border-white/10' : 'bg-white/50 border-white/40'}`}
                        style={{ height: '100%', maxHeight: typeof window !== 'undefined' && window.innerWidth >= 768 ? '600px' : '100%' }}
                    >
                        
                        <div className="p-4 flex justify-between items-center shrink-0 border-b relative" style={{ borderColor: `${accentColor}30`, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)' }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2 rounded-full text-white" style={{ backgroundColor: accentColor }}>
                                    <Lock size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-sm font-alexandria flex items-center gap-1.5" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                                        {getOtherUserName()}
                                    </h3>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                        <p className="text-[9px] opacity-60" style={{ color: isDarkMode ? '#fff' : '#000' }}>{statusText}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 md:gap-2 relative z-10">
                                {memoryData?.allowVoiceCall && (
                                    <button onClick={startCall} disabled={!isOnline || callState.status !== 'idle'} className={`p-2 transition rounded-full hover:bg-white/10 ${(!isOnline || callState.status !== 'idle') ? 'opacity-30' : 'opacity-60 hover:opacity-100 hover:text-green-400'}`} style={{ color: isDarkMode ? '#fff' : '#000' }} title={isOnline ? "مكالمة صوتية" : "الطرف الآخر غير متصل"}>
                                        <Phone size={18} />
                                    </button>
                                )}
                                <button onClick={() => setShowSettings(!showSettings)} className={`p-2 transition rounded-full hover:bg-white/10 ${showSettings ? 'opacity-100 text-blue-400' : 'opacity-60 hover:opacity-100 hover:text-blue-500'}`} style={{ color: (!showSettings && isDarkMode) ? '#fff' : (!showSettings && !isDarkMode) ? '#000' : undefined }} title="إعدادات المحادثة">
                                    <Settings size={18} className={showSettings ? 'animate-spin-slow' : ''} />
                                </button>
                                <button onClick={handleDeleteChat} className="p-2 opacity-60 hover:opacity-100 hover:text-red-500 transition rounded-full hover:bg-white/10" style={{ color: isDarkMode ? '#fff' : '#000' }} title="مسح المحادثة بالكامل">
                                    <Trash2 size={18} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 opacity-60 hover:opacity-100 transition rounded-full hover:bg-white/10" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* 📞 واجهة المكالمة الصوتية */}
                        {callState.status !== 'idle' && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-2xl animate-fade-in" style={{ backgroundColor: isDarkMode ? 'rgba(5, 5, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
                                <div className="w-28 h-28 rounded-full flex items-center justify-center mb-8 relative shadow-2xl" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                                    <div className={`absolute inset-0 rounded-full border-2 ${callState.status === 'connected' ? 'border-green-500 animate-pulse' : 'border-current animate-ping'}`}></div>
                                    {callState.status === 'connected' ? <PhoneCall size={48} className="animate-bounce-slow" /> : <Phone size={48} className="animate-pulse" />}
                                </div>
                                
                                <h3 className="text-2xl font-bold font-alexandria mb-3 text-center drop-shadow-md" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                                    {callState.status === 'ringing' && 'جاري الاتصال...'}
                                    {callState.status === 'incoming' && `${callState.callerName || 'مجهول'} يتصل بك...`}
                                    {callState.status === 'connected' && 'المكالمة متصلة'}
                                </h3>
                                
                                <p className="text-sm opacity-60 font-mono mb-16 tracking-widest font-bold">
                                    {callState.status === 'connected' ? formatCallTime(callDuration) : 'عبر اتصال مشفر وآمن 🔒'}
                                </p>

                                <div className="flex gap-8 mt-4">
                                    {callState.status === 'incoming' && (
                                        <button onClick={answerCall} className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-transform hover:scale-110 active:scale-95">
                                            <Phone size={24} />
                                        </button>
                                    )}
                                    <button onClick={endCall} className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-transform hover:scale-110 active:scale-95">
                                        <div className="rotate-[135deg]"><Phone size={24} /></div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isNameSet ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-transparent">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce-slow backdrop-blur-md" style={{ backgroundColor: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}>
                                    <Smile size={40} />
                                </div>
                                <h3 className="text-2xl font-black font-alexandria mb-3" style={{ color: isDarkMode ? '#fff' : '#000' }}>مين معانا؟</h3>
                                <p className="text-sm opacity-60 text-center mb-8" style={{ color: isDarkMode ? '#fff' : '#000' }}>اكتب اسمك عشان الطرف التاني يعرف بيكلم مين 💬</p>
                                
                                <form onSubmit={handleStartChat} className="w-full max-w-xs space-y-4">
                                    <input 
                                        type="text" 
                                        required 
                                        value={userName} 
                                        onChange={(e) => setUserName(e.target.value)} 
                                        className={`w-full p-4 text-center text-[16px] font-bold rounded-2xl outline-none transition-colors shadow-inner backdrop-blur-md ${isDarkMode ? 'bg-black/40 border border-white/10 focus:border-white/50 text-white' : 'bg-white/60 border border-white/40 focus:border-gray-400 text-black'}`}
                                        placeholder="اكتب اسمك هنا..." 
                                        autoFocus
                                    />
                                    <button type="submit" disabled={!userName.trim()} className="w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 text-lg disabled:opacity-50" style={{ backgroundColor: accentColor }}>
                                        ابدأ المحادثة
                                    </button>
                                </form>
                            </div>
                        ) : showSettings ? (
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative z-10 chat-scrollbar animate-fade-in" style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)' }}>
                                <h3 className="font-bold text-xl mb-2 font-alexandria" style={{ color: isDarkMode ? '#fff' : '#000' }}>إعدادات المحادثة ⚙️</h3>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold opacity-70" style={{ color: isDarkMode ? '#fff' : '#000' }}>تغيير اسمك (يظهر للطرف الآخر)</label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className={`w-full p-4 text-[16px] font-bold rounded-2xl outline-none transition-colors shadow-inner ${isDarkMode ? 'bg-black/40 border border-white/10 text-white' : 'bg-white border border-gray-300 text-black'}`}
                                        placeholder="اكتب اسمك الجديد..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold opacity-70" style={{ color: isDarkMode ? '#fff' : '#000' }}>خلفية المحادثة (صورة مشتركة بينكم)</label>
                                    <label className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isUploadingBg ? 'opacity-50' : 'hover:bg-white/5'} ${isDarkMode ? 'border-white/20 text-white' : 'border-gray-300 text-gray-800'}`}>
                                        {isUploadingBg ? <Loader2 size={24} className="animate-spin mb-2" /> : <ImageIcon size={24} className="mb-2 opacity-60" />}
                                        <span className="text-xs font-bold">{isUploadingBg ? 'جاري الرفع والأمان...' : 'اضغط لاختيار صورة من جهازك'}</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} disabled={isUploadingBg} />
                                    </label>
                                    {chatBg && (
                                        <div className="relative mt-4 p-4 bg-black/10 rounded-2xl border border-white/5 shadow-inner flex flex-col items-center">
                                            <div className="w-full relative rounded-2xl overflow-hidden transition-opacity bg-black/50" style={{ opacity: bgOpacity }}>
                                                <ImagePositioner src={chatBg} pos={bgPosition} setPos={setBgPosition} type="image" />
                                            </div>
                                            <button onClick={() => {setChatBg(''); setBgPosition({x:50, y:50});}} className="mt-4 px-4 py-3 bg-red-500/20 text-red-400 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-bold w-full" title="إزالة الخلفية"><Trash2 size={16}/> إزالة الخلفية</button>
                                        </div>
                                    )}
                                </div>

                                {chatBg && (
                                    <div className="space-y-3 pb-4">
                                        <label className="text-xs font-bold opacity-70 flex justify-between" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                                            <span>وضوح الخلفية (الشفافية)</span>
                                            <span>{Math.round(bgOpacity * 100)}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0.05"
                                            max="1"
                                            step="0.05"
                                            value={bgOpacity}
                                            onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                                            className="w-full accent-indigo-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={async () => {
                                        if (userName.trim()) {
                                            localStorage.setItem(`secret_chat_name_${memoryId}`, userName.trim());
                                            setUserName(userName.trim());
                                        }
                                        try { 
                                            await updateDoc(doc(db, 'memories', memoryId), { chatBg, chatBgOpacity: bgOpacity, chatBgPosition: bgPosition }); 
                                        } catch(e) {
                                            console.error("Error saving settings", e);
                                        }
                                        setShowSettings(false);
                                    }}
                                    className="w-full py-4 mt-auto rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-transform text-lg flex items-center justify-center gap-2"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    <CheckCircle size={20}/> حفظ ورجوع للمحادثة
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
                                {/* ✅ استخدام fixed للخلفية لجعلها ثابتة بحجم نافذة المتصفح ولا تتأثر بحركة العناصر الداخلية */}
                                {chatBg && !showSettings && (
                                    <div 
                                        className="fixed inset-0 pointer-events-none z-[-1] transition-opacity duration-300" 
                                        style={{ 
                                            backgroundImage: `url(${chatBg})`, 
                                            backgroundSize: 'cover', 
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: `${bgPosition.x}% ${bgPosition.y}%`, 
                                            opacity: bgOpacity 
                                        }}
                                    ></div>
                                )}
                                
                                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 chat-scrollbar flex flex-col relative z-10 bg-transparent scroll-smooth">
                                    <div className="relative z-10 flex flex-col gap-3 mt-auto w-full shrink-0 pt-4">
                                    {messages.length === 0 ? (
                                        <div className={`flex flex-col items-center justify-center py-10 opacity-60 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                            <MessageSquare size={40} className="mb-3"/>
                                            <p className="text-sm font-bold">مفيش رسائل لسه..</p>
                                            <p className="text-[10px]">ابدأ وابعث رسالة من القلب ❤️</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.deviceId === deviceId || (userName && msg.senderName === userName);
                                            return (
                                                <div key={msg.id} className={`flex flex-col max-w-[85%] md:max-w-[80%] animate-fade-in ${isMe ? 'self-end' : 'self-start'}`}>
                                                    <span className={`text-[9px] opacity-50 mb-1 font-bold ${isMe ? 'text-left ml-2' : 'text-right mr-2'} ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                                                        {isMe ? 'أنت' : (msg.senderName || 'مجهول')}
                                                    </span>
                                                    {/* ✅ إزالة التأثير الزجاجي (backdrop-blur) من الرسائل لتسريع الأداء ومنع التقطيع */}
                                                    <div 
                                                        className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${isMe ? 'rounded-tl-none text-white border-white/5' : `rounded-tr-none ${isDarkMode ? 'bg-[#1a1a2f] border-white/5 text-white' : 'bg-white border-gray-200 text-gray-900'}`}`}
                                                        style={isMe && msg.type !== 'audio' ? { backgroundColor: accentColor } : isMe ? { backgroundColor: `${accentColor}cc` } : {}}
                                                    >
                                                        {msg.type === 'audio' ? (
                                                            <ChatAudioPlayer src={msg.audioUrl} isMe={isMe} accentColor={accentColor} />
                                                        ) : (
                                                            msg.text
                                                        )}
                                                    </div>
                                                    <span className={`text-[8px] opacity-60 mt-1 font-bold flex items-center justify-end gap-1 ${isMe ? 'flex-row-reverse text-left ml-2' : 'text-right mr-2'} ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                                                        <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : 'الآن'}</span>
                                                        {msg.isTemp && <Loader2 size={10} className="animate-spin opacity-70" title="جاري الرفع..." />}
                                                        {isMe && !msg.isTemp && (
                                                            msg.read ? <CheckCheck size={14} className="text-blue-300 drop-shadow-md" /> : <Check size={12} className="opacity-50" />
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        })
                                    )}
                                    </div>
                                </div>

                                <div className="relative z-50 shrink-0 border-t backdrop-blur-xl p-3 bg-black/20" style={{ borderColor: `${accentColor}30` }}>
                                    {showEmojiPicker && (
                                        <div className={`absolute bottom-full mb-2 right-2 z-[9999] p-3 rounded-2xl border shadow-xl flex gap-2 flex-wrap max-w-[250px] animate-modal-spring backdrop-blur-3xl ${isDarkMode ? 'bg-[#1a1a2e]/90 border-white/10' : 'bg-white/90 border-white/40'}`}>
                                            {EMOJIS.map(emoji => (
                                                <button 
                                                    key={emoji} 
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()} // مهم لمنع إغلاق الكيبورد
                                                    onClick={(e) => { 
                                                        e.preventDefault(); 
                                                        addEmoji(emoji); 
                                                    }}
                                                    className="text-2xl hover:scale-125 transition-transform p-1"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2 items-center w-full">
                                        {!isRecording && (
                                            <button 
                                                type="button" 
                                                onMouseDown={(e) => e.preventDefault()} // يمنع فقدان التركيز
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    toggleEmojiPicker(); 
                                                }}
                                                className={`p-2.5 rounded-xl transition-colors backdrop-blur-md border border-transparent hover:border-white/10 ${isDarkMode ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-white/50 hover:text-black'}`}
                                            >
                                                <Smile size={20} />
                                            </button>
                                        )}
                                        
                                        {isRecording ? (
                                            <div className={`flex-1 flex items-center justify-between p-3.5 rounded-xl backdrop-blur-md shadow-inner ${isDarkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                                    <span className="font-mono font-bold text-red-500">{formatTime(recordingTime)}</span>
                                                </div>
                                                <button type="button" onClick={cancelRecording} className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors px-2">إلغاء</button>
                                            </div>
                                        ) : (
                                            <input 
                                                ref={inputRef}
                                                type="text" 
                                                value={newMessage} 
                                                onChange={(e) => setNewMessage(e.target.value)} 
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSend();
                                                        setShowEmojiPicker(false);
                                                    }
                                                }}
                                                className={`flex-1 p-3.5 rounded-xl text-[16px] outline-none transition-colors backdrop-blur-md shadow-inner ${isDarkMode ? 'bg-black/40 border border-white/10 focus:border-white/40 text-white placeholder-gray-400' : 'bg-white/50 border border-white/40 focus:border-gray-400 text-black placeholder-gray-600'}`}
                                                placeholder="اكتب رسالتك..." 
                                                onFocus={() => {
                                                    setShowEmojiPicker(false);
                                                    setTimeout(() => {
                                                        if (scrollContainerRef.current) {
                                                            scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
                                                        }
                                                    }, 100);
                                                }}
                                            />
                                        )}

                                        {/* ✅ زر الإرسال / التسجيل الصوتي */}
                                        {isRecording ? (
                                            <button 
                                                type="button" 
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    stopRecording(); 
                                                }}
                                                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white transition-all shadow-lg bg-red-500 hover:bg-red-600 active:scale-95 animate-pulse`} 
                                            >
                                                <Square size={18} fill="currentColor" />
                                            </button>
                                        ) : newMessage.trim() ? (
                                            <button 
                                                type="button" 
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    handleSend(); 
                                                    setShowEmojiPicker(false); 
                                                }}
                                                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white transition-all shadow-lg border border-white/10 backdrop-blur-md active:scale-95`} 
                                                style={{ backgroundColor: accentColor }}
                                            >
                                                <Send size={18} className={isDarkMode ? "mr-1" : ""} />
                                            </button>
                                        ) : (
                                            <button 
                                                type="button" 
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    startRecording(); 
                                                    setShowEmojiPicker(false); 
                                                }}
                                                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white transition-all shadow-lg border border-white/10 backdrop-blur-md active:scale-95 hover:opacity-90`} 
                                                style={{ backgroundColor: accentColor }}
                                            >
                                                <Mic size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* عنصر تشغيل الصوت للمكالمة متاح دائمًا بالخلفية ليعمل حتى لو الشات مغلق */}
            {remoteStream && (
                <audio autoPlay ref={(audio) => { if (audio && audio.srcObject !== remoteStream) audio.srcObject = remoteStream; }} />
            )}
        </>
    );
};

const QuizGame = ({ quiz, fullQuiz, memoryId, introMessage, animationType, onComplete, onClose, isDarkMode, themeColors }) => {
    const [gamePhase, setGamePhase] = useState(introMessage ? 'intro' : 'playing');
    const [introExiting, setIntroExiting] = useState(false);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [answers, setAnswers] = useState({});
    const [status, setStatus] = useState('idle');

    const currentQ = quiz[currentIndex];
    const accent = themeColors?.accent || '#f472b6';

    const handleStartQuiz = () => {
        setIntroExiting(true);
        setTimeout(() => setGamePhase('playing'), 800);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!inputValue.trim()) return;

        const newAnswers = { ...answers, [currentQ.id]: inputValue.trim() };
        setAnswers(newAnswers);
        setStatus('success'); 
        
        setTimeout(() => {
            if (currentIndex < quiz.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setInputValue('');
                setStatus('idle');
            } else {
                const updatedFullQuiz = fullQuiz.map(q => {
                    if (newAnswers[q.id]) {
                        return { ...q, answer: newAnswers[q.id] };
                    }
                    return q;
                });
                onComplete(updatedFullQuiz); 
            }
        }, 1200); 
    };

    return (
        <div dir="rtl" className={`fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden ${isDarkMode ? 'bg-[#050511]' : 'bg-[#fff0f5]'}`}>
            <DynamicBackground isDarkMode={isDarkMode} type={animationType} customColors={themeColors} />
            
            {onClose && (
                <button onClick={onClose} className="absolute top-6 right-6 z-[210] p-3 bg-white/10 hover:bg-red-500/20 text-white rounded-full transition backdrop-blur-md">
                    <X size={24}/>
                </button>
            )}

            {gamePhase === 'intro' && (
                <div className={`relative z-10 text-center px-4 max-w-2xl transform transition-all duration-700 ease-in-out ${introExiting ? 'opacity-0 scale-110 blur-lg translate-y-10' : 'opacity-100 scale-100 translate-y-0 animate-fade-in'}`}>
                    <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-full shadow-2xl animate-bounce-slow" style={{ backgroundColor: `${accent}20`, color: accent, boxShadow: `0 0 40px ${accent}40` }}>
                        <MessageCircle size={48} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold font-alexandria mb-10 leading-relaxed drop-shadow-2xl" style={{ color: isDarkMode ? '#fff' : '#000' }}>
                        {introMessage}
                    </h2>
                    <button 
                        onClick={handleStartQuiz} 
                        className="px-10 py-4 rounded-full font-bold text-lg text-white shadow-2xl transition-all active:scale-95 flex items-center gap-3 mx-auto hover:-translate-y-1"
                        style={{ backgroundColor: accent, boxShadow: `0 10px 30px -10px ${accent}` }}
                    >
                        يلا نبدأ <ChevronLeft size={24} />
                    </button>
                </div>
            )}

            {gamePhase === 'playing' && (
                <div className={`relative w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl transition-all duration-300 border animate-modal-spring ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/60 border-gray-200'} ${status === 'success' ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : ''}`}>
                    
                    <div className="flex justify-center gap-2 mb-8">
                        {quiz.map((_, idx) => (
                            <div key={idx} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'scale-150' : idx < currentIndex ? 'bg-green-500' : 'bg-black/20'}`} style={idx === currentIndex ? { backgroundColor: accent } : {}}></div>
                        ))}
                    </div>

                    {status === 'idle' && (
                        <div className="animate-fade-in text-center">
                            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl" style={{ backgroundColor: `${accent}20`, color: accent }}>
                                <MessageCircle size={32} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold font-alexandria mb-8 leading-relaxed drop-shadow-md" style={{ color: isDarkMode ? '#fff' : '#000' }}>{currentQ.question}</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <textarea 
                                    value={inputValue} 
                                    onChange={(e) => setInputValue(e.target.value)} 
                                    className={`w-full p-5 text-center text-xl font-bold rounded-2xl border outline-none transition-all resize-none h-32 ${isDarkMode ? 'bg-black/50 border-white/10 focus:border-white/50 text-white' : 'bg-white/80 border-gray-200 text-black'} custom-scrollbar`} 
                                    style={{ borderColor: inputValue ? accent : '' }}
                                    placeholder="اكتب إجابتك هنا من قلبك..." 
                                    autoFocus 
                                />
                                <button type="submit" className="w-full py-4 rounded-2xl font-bold text-white transition shadow-lg active:scale-95 text-lg flex items-center justify-center gap-2 hover:opacity-90" style={{ backgroundColor: accent }}>
                                    <CheckCircle size={20}/> تأكيد 
                                </button>
                            </form>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="animate-fade-in text-center py-6">
                            <div className="w-24 h-24 mx-auto bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-bounce-slow">
                                <CheckCircle size={48} className="text-green-400 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold font-alexandria text-green-400 drop-shadow-lg mb-2">تم الحفظ! ✨</h2>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SecretModal = ({ isOpen, onClose, message, title, isDarkMode, accentColor }) => {
    const [displayedMessage, setDisplayedMessage] = useState('');

    useEffect(() => {
        if (isOpen && message) {
            setDisplayedMessage(''); 
            let currentIndex = 0;
            const intervalId = setInterval(() => {
                if (currentIndex <= message.length) {
                    setDisplayedMessage(message.slice(0, currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(intervalId); 
                }
            }, 35); 

            return () => clearInterval(intervalId);
        } else {
            setDisplayedMessage(''); 
        }
    }, [isOpen, message]);

    if (!isOpen) return null;

    return (
        <div dir="rtl" className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-28 md:pb-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300" onClick={onClose}></div>
            <div className={`relative z-10 w-full max-w-lg p-1 rounded-[2.5rem] shadow-2xl transform transition-all animate-modal-spring flex flex-col max-h-full`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-[2.5rem] pointer-events-none"></div>
                <div className={`relative bg-[#0F0F1A] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col max-h-full w-full`}>
                    <div className="h-32 shrink-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 flex items-center justify-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                         <div className="w-20 h-20 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] z-10">
                            <MailOpen size={36} style={{ color: accentColor }} className="drop-shadow-lg" />
                         </div>
                         <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-white/10 text-white rounded-full transition z-20"><X size={20}/></button>
                    </div>
                    <div className="p-6 md:p-8 text-center flex flex-col flex-1 overflow-hidden min-h-[200px]">
                        <h3 className="text-2xl font-bold font-alexandria mb-6 text-white drop-shadow-md shrink-0">{title || "رسالة خاصة 💌"}</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 flex items-start justify-center text-right">
                             <p 
                                className="text-lg leading-loose font-medium whitespace-pre-line dir-rtl transition-all duration-300 w-full" 
                                style={{ 
                                    color: '#fff', 
                                    textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}80, 0 0 30px ${accentColor}40` 
                                }}
                             >
                                {displayedMessage}
                                {displayedMessage.length < (message?.length || 0) && (
                                    <span className="animate-pulse opacity-70 ml-1">|</span>
                                )}
                             </p>
                        </div>
                    </div>
                    <div className="p-6 border-t border-white/5 bg-black/20 flex justify-center shrink-0">
                        <button onClick={onClose} className="px-8 py-3 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition">إغلاق</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 🔔 مكون إشعار الحب السري الذكي
const SecretNotificationPopup = ({ notification, isVisible, accentColor, isDarkMode }) => {
    return (
        <div dir="rtl" className={`fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-[500] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-16 opacity-0 scale-90 pointer-events-none'}`}>
            <div className={`flex items-center gap-4 p-4 pr-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-2xl ${isDarkMode ? 'bg-[#12121f]/90 border-white/10 text-white' : 'bg-white/90 border-gray-200 text-gray-900'}`} style={{ borderBottom: `2px solid ${accentColor}` }}>
                 <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    <BellRing size={18} className="relative z-10" />
                 </div>
                 <div className="flex flex-col max-w-[250px] md:max-w-[350px]">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-1 mb-0.5"><Sparkles size={10} className="text-indigo-400"/> Secret Page</span>
                    <p className="text-sm font-bold leading-relaxed">{notification}</p>
                 </div>
            </div>
        </div>
    );
};

const FlipCard = ({ iconName, message, hint, accentColor }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = ICON_LIBRARY[iconName] || Star;
  return (
    <div className="group/card w-full h-64 cursor-pointer [perspective:1000px]" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        <div 
            className="absolute w-full h-full [backface-visibility:hidden] rounded-[2rem] flex flex-col items-center justify-center text-center px-4 shadow-xl border border-white/10 backdrop-blur-md bg-gradient-to-br from-white/5 to-transparent text-white"
        >
          <div className="p-5 bg-white/5 rounded-full mb-4 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10">
              <Icon size={36} style={{ color: accentColor }} className="animate-pulse drop-shadow-lg" />
          </div>
          <span className="text-sm font-bold opacity-80 tracking-wide drop-shadow-md">{hint || "اضغط لفتح الرسالة"}</span>
        </div>

        <div 
            className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] flex flex-col items-center justify-center text-center p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-3xl bg-black/10 overflow-hidden"
            style={{ '--accent-color': accentColor, '--accent-color-10': `${accentColor}15`, '--accent-color-30': `${accentColor}30`, '--accent-color-50': `${accentColor}60` }}
        >
          <div className="absolute inset-0 rounded-[2rem] animate-edge-glow pointer-events-none" style={{border: `1px solid ${accentColor}80`}}></div>

          <div 
            className={`relative z-10 w-full flex flex-col items-center justify-center h-full overflow-y-auto no-scrollbar transition-all duration-700 delay-100 ease-out transform ${isFlipped ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
          > 
             <Icon size={28} style={{ color: accentColor }} className="mb-4 drop-shadow-[0_0_8px_currentColor] animate-bounce-slow" />
             <p className="font-bold text-lg leading-relaxed text-white drop-shadow-md px-2 custom-scrollbar whitespace-pre-line">
                 {message}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CountdownTimer = ({ targetDate, isDarkMode, label, accentColor }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [isPast, setIsPast] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate);
      const now = new Date();
      const diff = target - now;
      const isPastDate = diff < 0;
      setIsPast(isPastDate);
      const absDiff = Math.abs(diff);
      setTimeLeft({
        years: Math.floor(absDiff / (1000 * 60 * 60 * 24 * 365)),
        months: Math.floor((absDiff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)),
        days: Math.floor((absDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)),
        hours: Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((absDiff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBox = ({ val, label }) => (
    <div className={`flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl backdrop-blur-md border shadow-lg transition-transform hover:scale-105 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-gray-800'}`}>
      <span className="text-xl md:text-2xl font-black font-alexandria">{val || 0}</span>
      <span className="text-[9px] md:text-xs font-bold mt-1 opacity-90">{label}</span>
    </div>
  );

  return (
    <div className="relative group">
        <div className={`absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent`}></div>
        <div className={`relative bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[2rem] text-center shadow-2xl`}>
            {label && <h3 className="text-lg font-bold opacity-80 mb-6 font-alexandria flex items-center justify-center gap-2"><Clock size={18} style={{color: accentColor}}/> {label}</h3>}
            {!label && <h3 className="text-lg font-bold opacity-80 mb-6 font-alexandria flex items-center justify-center gap-2"><Clock size={18} style={{color: accentColor}}/> {isPast ? 'مرّ على ذكرانا' : 'باقي على المناسبة'}</h3>}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 dir-rtl">
                {timeLeft.years > 0 && <TimeBox val={timeLeft.years} label="سنة" />}
                <TimeBox val={timeLeft.months} label="شهر" />
                <TimeBox val={timeLeft.days} label="يوم" />
                <TimeBox val={timeLeft.hours} label="ساعة" />
                <TimeBox val={timeLeft.minutes} label="دقيقة" />
                <TimeBox val={timeLeft.seconds} label="ثانية" />
            </div>
        </div>
    </div>
  );
};

const PasswordWall = ({ memoryData, onUnlock, isDarkMode }) => {
  const [input, setInput] = useState(''); const [error, setError] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); if (input === memoryData.password || input === memoryData.editPassword) onUnlock(); else { setError(true); setTimeout(() => setError(false), 800); } };
  const PageIcon = ICON_LIBRARY[memoryData.loginIcon] || Lock;
  const accent = memoryData.themeColors?.accent || '#f472b6';

  return (
    <div dir="rtl" className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fff0f5] text-gray-900'}`}>
      <DynamicBackground isDarkMode={isDarkMode} type={memoryData.backgroundAnimation || 'classic'} customColors={memoryData.themeColors} />
      <div className="max-w-md w-full p-8 text-center relative z-10 bg-black/30 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl animate-fade-in">
        <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 animate-float bg-white/5 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10 relative overflow-hidden">
            {memoryData.loginImage ? <img src={memoryData.loginImage} className="w-full h-full object-cover" /> : <PageIcon size={40} style={{color: accent}} className="drop-shadow-lg" />}
        </div>
        <h2 className="text-3xl font-bold mb-2 font-alexandria drop-shadow-md">{memoryData.loginTitle || `رسالة خاصة`}</h2>
        <p className="mb-8 text-sm opacity-70 leading-relaxed max-w-[80%] mx-auto">{memoryData.loginDescription || "المحتوى ده سري، اكتب الباسورد عشان تفتح الهدية."}</p>
        <form onSubmit={handleSubmit}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className={`w-full p-5 text-center text-2xl font-bold tracking-[0.5em] border-2 rounded-2xl outline-none transition mb-6 bg-black/40 border-white/10 focus:border-white/50 shadow-inner text-white ${error ? 'border-red-500 animate-shake' : ''}`} placeholder={memoryData.loginPlaceholder || "****"} autoFocus />
          <button type="submit" className="w-full py-4 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition shadow-lg backdrop-blur-md">{memoryData.loginButtonText || "فتح الرسالة ✨"}</button>
        </form>
      </div>
    </div>
  );
};

const MusicPlayer = ({ playlist, isDarkMode }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);
    const ytPlayerRef = useRef(null);
    const [ytLoaded, setYtLoaded] = useState(false);

    // Get current song data safely
    const currentSong = playlist && playlist.length > 0 ? playlist[currentIndex] : null;
    const songUrl = currentSong?.url;
    const title = currentSong?.title;
    const image = currentSong?.image;

    const isYouTube = songUrl && (songUrl.includes('youtube.com') || songUrl.includes('youtu.be'));
    const getYouTubeId = (url) => {
        if(!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
        return match ? match[1] : null;
    };
    const ytId = isYouTube ? getYouTubeId(songUrl) : null;

    const handleNext = () => {
        if (!playlist || playlist.length <= 1) return;
        setCurrentIndex((prev) => (prev + 1) % playlist.length);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        if (!playlist || playlist.length <= 1) return;
        setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
        setIsPlaying(true);
    };

    // ✅ الاستماع لأحداث إيقاف الموسيقى (من المكالمات أو الرسائل الصوتية)
    useEffect(() => {
        const handleControlMusic = (e) => {
            const { pause } = e.detail;
            if (pause) {
                if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
                    ytPlayerRef.current.pauseVideo();
                } else if (audioRef.current) {
                    audioRef.current.pause();
                }
                setIsPlaying(false);
            } else {
                // استئناف تلقائي
                if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
                    ytPlayerRef.current.playVideo();
                } else if (audioRef.current) {
                    audioRef.current.play().catch(err => console.log(err));
                }
                setIsPlaying(true);
            }
        };

        window.addEventListener('control-bg-music', handleControlMusic);
        return () => window.removeEventListener('control-bg-music', handleControlMusic);
    }, [isYouTube]);

    useEffect(() => {
        if (isYouTube && ytId) {
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                window.onYouTubeIframeAPIReady = () => setYtLoaded(true);
            } else {
                setYtLoaded(true);
            }
        }
    }, [isYouTube, ytId]);

    useEffect(() => {
        if (ytLoaded && isYouTube && ytId) {
            if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
                ytPlayerRef.current.loadVideoById(ytId);
                if(isPlaying) ytPlayerRef.current.playVideo();
            } else if (!ytPlayerRef.current) {
                ytPlayerRef.current = new window.YT.Player('yt-player-container', {
                    height: '0',
                    width: '0',
                    videoId: ytId,
                    playerVars: { autoplay: isPlaying ? 1 : 0, controls: 0, playsinline: 1 },
                    events: {
                        onReady: (e) => {
                            if (isPlaying) e.target.playVideo();
                        },
                        onStateChange: (e) => {
                            if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
                            if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
                            if (e.data === window.YT.PlayerState.ENDED) {
                                if (playlist.length > 1) {
                                    handleNext();
                                } else {
                                    e.target.playVideo(); // Loop if only 1 song
                                }
                            }
                        }
                    }
                });
            }
        } else if (!isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
            ytPlayerRef.current.pauseVideo();
        }
    }, [ytLoaded, isYouTube, ytId, currentIndex]); // Update if song changes

    useEffect(() => {
        if (!isYouTube && audioRef.current && songUrl) {
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Play blocked", e));
            }
        }
    }, [songUrl, isYouTube, currentIndex]);

    useEffect(() => {
        const attemptPlay = async () => {
            if (!isYouTube && audioRef.current && songUrl) {
                try { 
                    await audioRef.current.play(); 
                    setIsPlaying(true); 
                } catch (e) { 
                    console.log("Autoplay blocked by browser"); 
                }
            } else if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
                ytPlayerRef.current.playVideo();
                setIsPlaying(true);
            }
        };
        const timer = setTimeout(attemptPlay, 1000); 
        return () => clearTimeout(timer);
    }, []); 

    const togglePlay = () => {
        if (isYouTube && ytPlayerRef.current) {
            if (isPlaying) ytPlayerRef.current.pauseVideo();
            else ytPlayerRef.current.playVideo();
        } else if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play().catch(e=>console.error(e));
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!isYouTube && audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
    };

    useEffect(() => {
        let interval;
        if (isYouTube && isPlaying && ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
            interval = setInterval(() => {
                try {
                    const current = ytPlayerRef.current.getCurrentTime();
                    const duration = ytPlayerRef.current.getDuration();
                    if (duration > 0) setProgress((current / duration) * 100);
                } catch (e) {}
            } , 1000);
        }
        return () => clearInterval(interval);
    }, [isYouTube, isPlaying]);

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

        if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.getDuration === 'function') {
            const duration = ytPlayerRef.current.getDuration();
            ytPlayerRef.current.seekTo((percent / 100) * duration, true);
        } else if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = (percent / 100) * audioRef.current.duration;
        }
        setProgress(percent);
    };

    if (!playlist || playlist.length === 0) return null;

    return (
        <div dir="rtl" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-sm rounded-[2rem] p-3 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 animate-slide-up bg-black/30 overflow-hidden group hover:bg-black/50">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 animate-pulse pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
                <div 
                    className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden relative shrink-0 shadow-lg"
                    style={{ animation: 'spin 8s linear infinite', animationPlayState: isPlaying ? 'running' : 'paused' }}
                >
                    <img src={image || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&q=80"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center"><div className="w-3 h-3 bg-black rounded-full border border-white/30"></div></div>
                </div>
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex flex-col">
                        <div className="relative overflow-hidden h-5 w-full">
                            <span className={`text-sm font-bold text-white whitespace-nowrap absolute ${isPlaying ? 'animate-marquee' : ''}`}>{title || 'موسيقى الذكرى'}</span>
                        </div>
                        <span className="text-[10px] text-gray-300 flex items-center gap-1 mt-0.5">
                            {isPlaying ? <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> : <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>}
                            {isPlaying ? 'تشغيل الآن...' : 'متوقف'}
                        </span>
                    </div>
                    <div 
                        className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden cursor-pointer relative"
                        onClick={handleSeek}
                        title="انقر لتغيير وقت الموسيقى"
                    >
                        <div className="h-full bg-indigo-500 transition-all duration-200 pointer-events-none" style={{width: `${progress}%`}}></div>
                    </div>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0 dir-ltr ml-1">
                    {playlist.length > 1 && (
                        <button onClick={handlePrev} className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors" title="السابق">
                            <SkipBack size={16} fill="currentColor" />
                        </button>
                    )}
                    <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 border border-white/10 backdrop-blur-md">
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    {playlist.length > 1 && (
                        <button onClick={handleNext} className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors" title="التالي">
                            <SkipForward size={16} fill="currentColor" />
                        </button>
                    )}
                </div>
            </div>
            
            {isYouTube ? <div id="yt-player-container" className="hidden"></div> : <audio ref={audioRef} src={songUrl} onEnded={() => { if(playlist.length > 1) handleNext(); else { audioRef.current.currentTime=0; audioRef.current.play();} }} onTimeUpdate={handleTimeUpdate}/>}
            <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 10s linear infinite; }`}</style>
        </div>
    );
};

const PWAInstallerModal = ({ isOpen, onClose, isDarkMode, accentColor, memoryData, installPromptEvent }) => {
    const [appName, setAppName] = useState(memoryData?.recipientName || 'SecretPage');
    const [tempIconUrl, setTempIconUrl] = useState(null);
    const [iconPos, setIconPos] = useState({ x: 50, y: 50 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [installStep, setInstallStep] = useState(1);

    // متغيرات التحكم في اقتصاص الصورة (Drag)
    const [dragging, setDragging] = useState(false);
    const [last, setLast] = useState({x:0, y:0});

    if (!isOpen) return null;

    const startDrag = (clientX, clientY) => { setDragging(true); setLast({x: clientX, y: clientY}); };
    const moveDrag = (clientX, clientY) => {
        if(!dragging) return;
        const dx = clientX - last.x;
        const dy = clientY - last.y;
        setIconPos({
            x: Math.max(0, Math.min(100, iconPos.x - dx * 0.6)),
            y: Math.max(0, Math.min(100, iconPos.y - dy * 0.6))
        });
        setLast({x: clientX, y: clientY});
    };
    const stopDrag = () => setDragging(false);

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return alert("حجم الصورة كبير جداً (الحد الأقصى 5 ميجا)");
        setTempIconUrl(URL.createObjectURL(file));
        setIconPos({ x: 50, y: 50 });
    };

    const uploadCanvasToCloudinary = async (canvas) => {
        return new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
                const fd = new FormData();
                fd.append('file', blob);
                fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); 
                try {
                    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
                        method: 'POST',
                        body: fd
                    });
                    const data = await res.json();
                    resolve(data.secure_url);
                } catch (e) {
                    reject(e);
                }
            }, 'image/jpeg', 0.9);
        });
    };

    const handleGenerateApp = async () => {
        if (!appName) return alert("اكتب اسم التطبيق أولاً");
        
        setIsGenerating(true);
        let finalIconUrl = (memoryData?.coverImage && memoryData?.coverType !== 'video') 
            ? getOptimizedUrl(memoryData.coverImage) 
            : 'https://cdn-icons-png.flaticon.com/512/833/833472.png';

        // إذا رفع المستخدم صورة جديدة، نطبق الاقتصاص ونرفعها
        if (tempIconUrl) {
            try {
                const img = new Image();
                img.src = tempIconUrl;
                await new Promise(res => { img.onload = res; });

                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');

                // حساب أبعاد الاقتصاص بناءً على إحداثيات السحب
                const s = Math.max(512 / img.width, 512 / img.height);
                const sWidth = 512 / s;
                const sHeight = 512 / s;
                const sx = (iconPos.x / 100) * (img.width - sWidth);
                const sy = (iconPos.y / 100) * (img.height - sHeight);

                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 512, 512);

                finalIconUrl = await uploadCanvasToCloudinary(canvas);
            } catch (e) {
                console.error("Icon processing error:", e);
                alert("تعذر معالجة الأيقونة، سيتم استخدام صورة الغلاف.");
            }
        }

        // ✅ إضافة timestamp ليكون ID ورابط مختلف عشان ينزل أكتر من مرة
        const uniqueId = `secretpage-${Date.now()}`;
        const startUrl = `${window.location.origin}${window.location.pathname}?id=${memoryData?.id || ''}&installId=${uniqueId}`;

        // ✅ إضافة Scope وفصل المقاسات عشان الكمبيوتر يقرأه صح
        const manifest = {
            id: uniqueId,
            name: appName,
            short_name: appName,
            start_url: startUrl,
            scope: window.location.pathname,
            display: "standalone",
            background_color: isDarkMode ? "#050511" : "#fff0f5",
            theme_color: accentColor,
            icons: [
                { src: finalIconUrl, sizes: "192x192", type: "image/png", purpose: "any maskable" },
                { src: finalIconUrl, sizes: "512x512", type: "image/png", purpose: "any maskable" }
            ]
        };

        const stringManifest = JSON.stringify(manifest);
        const blob = new Blob([stringManifest], {type: 'application/manifest+json'});
        const manifestURL = URL.createObjectURL(blob);

        let oldLink = document.querySelector('link[rel="manifest"]');
        if (oldLink) oldLink.parentNode.removeChild(oldLink);

        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = manifestURL;
        document.head.appendChild(link);

        let oldAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
        if (oldAppleIcon) oldAppleIcon.parentNode.removeChild(oldAppleIcon);
        const appleIconLink = document.createElement('link');
        appleIconLink.rel = 'apple-touch-icon';
        appleIconLink.href = finalIconUrl;
        document.head.appendChild(appleIconLink);

        // Service Worker وهمي لمتصفح الكمبيوتر
        if ('serviceWorker' in navigator) {
            try {
                const swCode = `self.addEventListener('fetch', function(e) {});`;
                const swBlob = new Blob([swCode], { type: 'application/javascript' });
                const swUrl = URL.createObjectURL(swBlob);
                navigator.serviceWorker.register(swUrl).catch(() => {});
            } catch (e) {}
        }

        setIsGenerating(false);
        setInstallStep(2);

        setTimeout(async () => {
            if (installPromptEvent) {
                try {
                    await installPromptEvent.prompt();
                    const { outcome } = await installPromptEvent.userChoice;
                    if (outcome === 'accepted') {
                        onClose(); 
                        return;
                    }
                } catch (err) {}
            }
        }, 500); 
    };

    const detectOS = () => {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        if (/android/i.test(ua)) return 'android';
        if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
        return 'pc';
    };

    const os = detectOS();

    return (
        <div dir="rtl" className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"></div>
            <div className={`relative z-10 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-modal-spring border ${isDarkMode ? 'bg-[#12121f] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                
                {installStep === 1 ? (
                    <>
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center border shrink-0" style={{ backgroundColor: `${accentColor}20`, color: accentColor, borderColor: `${accentColor}40` }}>
                                <Download size={28} className="animate-bounce"/>
                            </div>
                            <div>
                                <h3 className="text-xl font-black font-alexandria text-red-400 animate-pulse">تثبيت إجباري للتطبيق 📱</h3>
                                <p className="text-[10px] opacity-80 mt-1 leading-relaxed">لضمان عمل المحادثة والموسيقى بدون تقطيع من المتصفح، يرجى تثبيت الصفحة كتطبيق أولاً.</p>
                            </div>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2 block">اسم التطبيق (يمكنك تعديله)</label>
                                <input 
                                    type="text" value={appName} onChange={e=>setAppName(e.target.value)} 
                                    className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-sm font-bold outline-none focus:border-fuchsia-500 transition" 
                                    disabled={isGenerating}
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2 block">أيقونة التطبيق (مربعة بحواف دائرية)</label>
                                
                                {tempIconUrl ? (
                                    <div className="flex flex-col items-center p-4 border border-white/10 rounded-2xl bg-black/20">
                                        <p className="text-[10px] text-fuchsia-300 mb-3 font-bold flex items-center gap-1"><Move size={12}/> اسحب الصورة لضبط الأيقونة</p>
                                        <div 
                                            className="relative w-28 h-28 rounded-[1.2rem] overflow-hidden bg-black shadow-lg cursor-move touch-none border-2 border-fuchsia-500/50"
                                            onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
                                            onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
                                            onMouseUp={stopDrag}
                                            onMouseLeave={stopDrag}
                                            onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
                                            onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
                                            onTouchEnd={stopDrag}
                                        >
                                            <img src={tempIconUrl} className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-75" style={{ objectPosition: `${iconPos.x}% ${iconPos.y}%` }} draggable={false} />
                                            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none rounded-[1.2rem] border border-white/20"></div>
                                        </div>
                                        <label className="mt-4 text-[10px] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg cursor-pointer font-bold transition">
                                            تغيير الصورة
                                            <input type="file" className="hidden" accept="image/*" onChange={handleIconChange} disabled={isGenerating} />
                                        </label>
                                    </div>
                                ) : (
                                    <label className={`flex items-center justify-center w-full p-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer transition-colors group ${isGenerating ? 'opacity-50' : 'hover:bg-white/5'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-[1rem] bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-fuchsia-400 shadow-inner border border-white/5"><ImageIcon size={20}/></div>
                                            <span className="text-sm font-bold opacity-80 group-hover:text-white">اختر صورة من جهازك</span>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleIconChange} disabled={isGenerating} />
                                    </label>
                                )}
                            </div>
                            
                            <button onClick={handleGenerateApp} disabled={isGenerating} className="w-full py-4 mt-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-white disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: accentColor }}>
                                {isGenerating ? <><Loader2 size={20} className="animate-spin"/> جاري تجهيز التطبيق...</> : <><CheckCircle size={20}/> تأكيد وإنشاء التطبيق</>}
                            </button>
                            
                            <button onClick={onClose} disabled={isGenerating} className="w-full text-center text-[10px] font-bold opacity-40 hover:opacity-100 transition-opacity mt-4 block text-gray-400 disabled:opacity-20">
                                تخطي والدخول من المتصفح (قد تواجه بطء)
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center animate-fade-in">
                        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 animate-bounce-slow" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                            <Download size={40}/>
                        </div>
                        <h3 className="text-2xl font-black font-alexandria mb-4">التطبيق جاهز للتحميل! 🎉</h3>
                        
                        <div className="bg-black/20 p-5 rounded-2xl border border-white/5 text-sm leading-relaxed mb-6 text-right">
                            {os === 'ios' ? (
                                <>
                                    <p className="font-bold mb-2 text-fuchsia-400">لمستخدمي الآيفون (iOS):</p>
                                    <ol className="list-decimal list-inside space-y-2 opacity-90">
                                        <li>اضغط على زر المشاركة (Share) <span className="inline-block p-1 bg-white/10 rounded"><UploadCloud size={14}/></span> في متصفح سفاري أسفل الشاشة.</li>
                                        <li>انزل لتحت واختار <b>"Add to Home Screen"</b> أو <b>"إضافة للشاشة الرئيسية"</b>.</li>
                                        <li>اضغط <b>Add (إضافة)</b> فوق على اليمين.</li>
                                    </ol>
                                </>
                            ) : os === 'android' ? (
                                <>
                                    <p className="font-bold mb-2 text-fuchsia-400">لمستخدمي أندرويد (Android):</p>
                                    <ol className="list-decimal list-inside space-y-2 opacity-90">
                                        <li>اضغط على <b>الثلاث نقط</b> (القائمة) في المتصفح فوق على اليمين/الشمال.</li>
                                        <li>اختار <b>"Add to Home screen"</b> أو <b>"Install app"</b>.</li>
                                        <li>اضغط <b>تثبيت (Install)</b>.</li>
                                    </ol>
                                </>
                            ) : (
                                <>
                                    <p className="font-bold mb-2 text-fuchsia-400">لمستخدمي الكمبيوتر (PC):</p>
                                    <ol className="list-decimal list-inside space-y-2 opacity-90">
                                        <li>بص فوق في شريط العنوان (URL bar) على اليمين.</li>
                                        <li>هتلاقي أيقونة تحميل <span className="inline-block p-1 bg-white/10 rounded"><Download size={14}/></span> اضغط عليها.</li>
                                        <li>اختار <b>تثبيت (Install)</b>.</li>
                                    </ol>
                                </>
                            )}
                        </div>
                        <button onClick={onClose} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition">تم التثبيت بنجاح، إغلاق النافذة 👍</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const MemoryView = ({ data, isDarkMode, onEditClick, onQuizComplete }) => {
  const [showSecret, setShowSecret] = useState(false);
  const [showEditAuth, setShowEditAuth] = useState(false);
  const [editPassInput, setEditPassInput] = useState('');
  const [editPassError, setEditPassError] = useState(false);
  const [showInsideQuiz, setShowInsideQuiz] = useState(false); 
  const [showPWA, setShowPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // 🔔 متغيرات حالة الإشعارات
  const [activeNotification, setActiveNotification] = useState(null);
  const notificationIndexRef = useRef(0);

  // --- إضافة معرّف الجهاز للتبع (لإشعارات الدخول) ---
  const [deviceId] = useState(() => {
      try {
          let id = localStorage.getItem('secret_chat_device_id');
          if (!id) {
              id = 'dev_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
              localStorage.setItem('secret_chat_device_id', id);
          }
          return id;
      } catch(e) {
          return 'dev_' + Date.now().toString(36);
      }
  });

  // ✅ التحقق إذا كان الموقع يعمل كتطبيق مثبت 
  // ❌ وتم إزالة كود توليد المانيفست من هنا لمنع ظهور الأيقونة مبكراً
  useEffect(() => {
      const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsStandalone(isApp);
      
      // كإجراء احترازي، إزالة أي مانيفست موجود مسبقاً في الصفحة عند تحميلها
      if (!isApp) {
          let oldLink = document.querySelector('link[rel="manifest"]');
          if (oldLink) oldLink.parentNode.removeChild(oldLink);
      }
  }, [data.allowAppInstall]);

  // ✅ التقاط حدث التثبيت الأصلي من المتصفح والاحتفاظ به
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  useEffect(() => {
      const handler = (e) => {
          e.preventDefault(); 
          setInstallPromptEvent(e); 
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  const accentColor = data.themeColors?.accent || '#f472b6'; 
  
  const defaultOrder = ['countdown', 'timeline', 'marquees', 'cards', 'gallery', 'quiz'];
  const renderOrder = data.sectionOrder?.length ? data.sectionOrder : defaultOrder;
  
  const finalOrder = [...renderOrder];
  if (data.quiz?.length > 0 && !finalOrder.includes('quiz')) {
      finalOrder.push('quiz');
  }

  const handleEditAuthSubmit = (e) => {
      e.preventDefault();
      if (editPassInput === data.editPassword) {
          setShowEditAuth(false);
          setEditPassInput('');
          onEditClick(); 
      } else {
          setEditPassError(true);
          setTimeout(() => setEditPassError(false), 800);
      }
  };

  // 🔔 محرك الإشعارات التلقائية
  useEffect(() => {
      const notifs = data.notifications || [];
      if (notifs.length === 0) return;

      const startTimer = setTimeout(() => {
          const interval = setInterval(() => {
              if (notificationIndexRef.current < notifs.length) {
                  const msgObj = notifs[notificationIndexRef.current];
                  
                  playSoftNotificationChime();
                  
                  setActiveNotification(msgObj.text);
                  
                  setTimeout(() => {
                      setActiveNotification(null);
                  }, 5000);
                  
                  notificationIndexRef.current += 1;
              } else {
                  clearInterval(interval);
              }
          }, 20000); 

          return () => clearInterval(interval);
      }, 5000);

      return () => clearTimeout(startTimer);
  }, [data.notifications]);

  // --- 🚀 نظام إشعارات الموبايل/المتصفح (عند دخول الطرف الآخر) ---
  const knownActiveUsers = useRef({});

  useEffect(() => {
      if (!data.id || !db) return;

      // 1. طلب تصريح الإشعارات من المتصفح عند فتح الصفحة (لإرسال إشعار للنظام)
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
          Notification.requestPermission().catch(e => console.error(e));
      }

      // 2. تحديث التواجد بشكل دوري
      const updatePagePresence = async () => {
          try {
              const currentName = localStorage.getItem(`secret_chat_name_${data.id}`) || '';
              await updateDoc(doc(db, 'memories', data.id), {
                  [`pagePresence.${deviceId}`]: {
                      time: Date.now(),
                      name: currentName
                  }
              });
          } catch(e) { console.error("Presence update error", e); }
      };

      updatePagePresence(); // تحديث فوري
      const presenceInterval = setInterval(updatePagePresence, 15000);

      // 3. مراقبة دخول الطرف الآخر لإرسال الإشعار
      const unsubscribe = onSnapshot(doc(db, 'memories', data.id), (snap) => {
          if (snap.exists()) {
              const memoryData = snap.data();
              const presence = memoryData.pagePresence || {};
              
              const now = Date.now();
              const currentActive = {};
              
              for (const [id, info] of Object.entries(presence)) {
                  // إذا كان متصلاً خلال آخر 30 ثانية
                  if (now - info.time < 30000) { 
                      currentActive[id] = true;

                      // إذا كان شخص آخر، واسمه مسجل، ولم يكن متصلاً من قبل (دخول جديد للصفحة)
                      if (id !== deviceId && info.name && !knownActiveUsers.current[id]) {
                          // إرسال الإشعار لمتصفح الهاتف/الكمبيوتر
                          if ("Notification" in window && Notification.permission === "granted") {
                              new Notification("Secret Page ✨", {
                                  body: `${info.name} داخل عالمكم الخاص الآن ❤️`,
                                  icon: "https://cdn-icons-png.flaticon.com/512/833/833472.png" 
                              });
                          }
                      }
                  }
              }
              
              knownActiveUsers.current = currentActive;
          }
      });

      return () => {
          clearInterval(presenceInterval);
          unsubscribe();
      };
  }, [data.id, deviceId]);

  const renderSection = (sectionName) => {
      switch (sectionName) {
          case 'countdown':
              if (!(data.timers?.length > 0 || data.targetDate)) return null;
              return (
                  <section key="countdown" className="space-y-8">
                      {data.sectionTitles?.countdown && (
                          <ScrollReveal>
                              <h2 className={`text-center text-3xl font-bold font-alexandria mb-6 mx-auto max-w-[90%] break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {data.sectionTitles.countdown}
                              </h2>
                          </ScrollReveal>
                      )}
                      
                      {data.timers?.length > 0 ? (
                          data.timers.map((timer, i) => (
                              <ScrollReveal key={timer.id || i} delay={i * 100}>
                                  <CountdownTimer targetDate={timer.date} isDarkMode={isDarkMode} label={timer.label} accentColor={accentColor} />
                              </ScrollReveal>
                          ))
                      ) : (
                          data.targetDate && (
                              <ScrollReveal>
                                  <CountdownTimer targetDate={data.targetDate} isDarkMode={isDarkMode} label={data.timerLabel} accentColor={accentColor} />
                              </ScrollReveal>
                          )
                      )}
                  </section>
              );
              
          case 'timeline':
              if (!(data.timeline?.length > 0)) return null;
              return (
                  <section key="timeline" className="space-y-12 relative">
                      {data.sectionTitles?.timeline && (
                          <ScrollReveal>
                              <h2 className={`text-center text-3xl font-bold font-alexandria mb-12 mx-auto max-w-[90%] break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {data.sectionTitles.timeline}
                              </h2>
                          </ScrollReveal>
                      )}
                      
                      <div className="relative flex flex-col items-center">
                          <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                          
                          {data.timeline.map((item, i) => (
                              <ScrollReveal key={item.id || i} delay={i * 150} className="w-full">
                                  <div className="relative flex flex-col items-center mb-12 w-full group">
                                      <div className={`w-full max-w-sm border p-6 rounded-[2rem] backdrop-blur-xl shadow-lg text-center transform group-hover:-translate-y-2 transition-all duration-500 z-10 mb-5 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/80 border-white/40 hover:bg-white'}`} style={{boxShadow: `inset 0 0 20px rgba(255,255,255,0.02)`}}>
                                          <h4 className={`font-bold text-xl md:text-2xl leading-relaxed drop-shadow-md ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.title}</h4>
                                      </div>

                                      <div className="z-10 relative">
                                          <div className="absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500" style={{backgroundColor: accentColor}}></div>
                                          <div className="relative bg-[#0F0F1A] border border-white/10 px-6 py-2 rounded-full flex items-center gap-2 shadow-xl transform group-hover:scale-110 transition-all duration-500" style={{boxShadow: `0 0 20px ${accentColor}40`}}>
                                              <Calendar size={16} style={{ color: accentColor }} className="animate-pulse" /> 
                                              <span className="text-sm font-bold text-white tracking-wide">{item.date}</span>
                                          </div>
                                      </div>
                                  </div>
                              </ScrollReveal>
                          ))}
                      </div>
                  </section>
              );

          case 'marquees':
              if (!(data.marquees?.length > 0)) return null;
              return (
                  <ScrollReveal key="marquees">
                      <section className="relative -mx-4 space-y-4 px-4">
                          {data.sectionTitles?.marquees && <h3 className={`text-center text-xl font-bold font-alexandria mb-6 opacity-80 mx-auto max-w-[90%] break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.sectionTitles.marquees}</h3>}
                          {data.marquees.map((m, i) => {
                              const Icon = ICON_LIBRARY[m.icon] || Heart;
                              return (
                                  <div key={i} className={`py-5 rounded-2xl backdrop-blur-md border shadow-lg flex justify-center items-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'}`}>
                                      <div className={`animate-soft-pulse flex items-center gap-3 font-bold text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                          <Icon size={28} style={{color: accentColor}} className="drop-shadow-lg" /><span className="tracking-wide text-center">{m.text}</span><Icon size={28} style={{color: accentColor}} className="drop-shadow-lg" />
                                      </div>
                                  </div>
                              );
                          })}
                      </section>
                  </ScrollReveal>
              );

          case 'cards':
              if (!(data.flipCards?.length > 0)) return null;
              return (
                  <section key="cards">
                      <ScrollReveal><h2 className={`text-center text-3xl font-bold font-alexandria mb-10 mx-auto max-w-[90%] break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.sectionTitles?.cards || 'رسائل ليكِ ❤️'}</h2></ScrollReveal>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {data.flipCards.map((card, i) => (
                              <ScrollReveal key={i} delay={i * 100}>
                                  <FlipCard iconName={card.icon} message={card.message} hint={card.hint} accentColor={accentColor} />
                              </ScrollReveal>
                          ))}
                      </div>
                  </section>
              );

          case 'gallery':
              if (!(data.photos?.length > 0)) return null;
              return (
                  <section key="gallery">
                      <ScrollReveal><h2 className={`text-center text-3xl font-bold font-alexandria mb-10 mx-auto max-w-[90%] break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.sectionTitles?.gallery || 'أجمل الذكريات 📸'}</h2></ScrollReveal>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {data.photos.map((photo, i) => (
                              <ScrollReveal key={i} delay={i * 150}>
                                  <div className={`border p-4 rounded-3xl group hover:-translate-y-2 transition duration-500 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'}`}>
                                      <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 relative">
                                          {photo.type === 'video' ? <AutoPlayVideo src={photo.img} className="w-full h-full object-cover" /> : <img src={getOptimizedUrl(photo.img)} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" style={{ objectPosition: photo.pos ? `${photo.pos.x}% ${photo.pos.y}%` : 'center' }} loading="lazy" />}
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                                              <p className="text-white text-sm">{photo.title}</p>
                                          </div>
                                      </div>
                                      <div className="text-center">
                                          <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{photo.title}</h3>
                                          <p className={`text-sm opacity-60 leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{photo.desc}</p>
                                      </div>
                                  </div>
                              </ScrollReveal>
                          ))}
                      </div>
                  </section>
              );
              
          case 'quiz':
              if (!(data.quiz?.length > 0)) return null;
              
              const hasAnswers = data.quiz.some(q => q.answer && q.answer.trim() !== '');
              const isInsidePageMode = data.quizMode === 'inside_page';
              
              return (
                  <section key="quiz" id="quiz-section" className="space-y-8 relative z-20">
                      <ScrollReveal>
                          <h2 className={`text-center text-3xl font-bold font-alexandria mb-4 mx-auto max-w-[90%] break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {data.sectionTitles?.quiz || 'من القلب للقلب 💬'}
                          </h2>
                          {isInsidePageMode && (
                              <p className={`text-center text-sm opacity-80 max-w-lg mx-auto mb-8 leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                                  {data.quizSectionText || 'عندنا شوية أسئلة محتاجين إجابتها من قلبك.. جاهز؟'}
                              </p>
                          )}
                      </ScrollReveal>
                      
                      {(isInsidePageMode || hasAnswers) && (
                          <div className="text-center mb-10">
                              <button onClick={() => setShowInsideQuiz(true)} className="px-8 py-4 rounded-full font-bold text-white shadow-xl transition-all active:scale-95 flex items-center gap-3 mx-auto hover:-translate-y-1 animate-bounce-slow" style={{ backgroundColor: accentColor, boxShadow: `0 10px 30px -10px ${accentColor}` }}>
                                  <Gamepad2 size={24} /> {hasAnswers ? 'إعادة الإجابة على الأسئلة ✏️' : (data.quizButtonText || 'ابدأ اللعبة 🎮')}
                              </button>
                          </div>
                      )}

                      {hasAnswers && (
                          <div className="max-w-2xl mx-auto space-y-5">
                              {data.quiz.filter(q => q.answer && q.answer.trim() !== '').map((q, i) => (
                                  <div key={q.id || i} className={`animate-fade-in p-6 rounded-[2rem] border backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02] ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-200'}`} style={{animationDelay: `${i * 100}ms`}}>
                                      <h4 className="text-lg font-bold mb-4 flex items-start gap-3" style={{ color: accentColor }}>
                                          <MessageCircle className="shrink-0 mt-1" size={22} />
                                          {q.question}
                                      </h4>
                                      <div className={`p-4 rounded-xl text-sm font-medium leading-relaxed whitespace-pre-line ${isDarkMode ? 'bg-black/30 text-gray-200 border border-white/5' : 'bg-gray-100 text-gray-800'}`}>
                                          {q.answer}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </section>
              );

          default:
              return null;
      }
  };

  return (
    <div dir="rtl" className={`min-h-screen relative overflow-x-hidden pb-10 transition-colors duration-500 font-[Cairo] ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fff5f7] text-gray-800'}`}>
      <DynamicBackground isDarkMode={isDarkMode} type={data.backgroundAnimation || 'classic'} customColors={data.themeColors} />
      
      {/* 🔔 استدعاء الإشعار السري */}
      <SecretNotificationPopup 
          notification={activeNotification} 
          isVisible={!!activeNotification} 
          accentColor={accentColor} 
          isDarkMode={isDarkMode} 
      />

      {/* 💬 استدعاء الشات السري (إذا كان مفعلاً من الإدمن) */}
      {data.allowChat && (
          <ChatWidget 
              memoryData={data} 
              memoryId={data.id} 
              isDarkMode={isDarkMode} 
              themeColors={data.themeColors} 
          />
      )}

      {/* Music Playlist Player added here */}
      <MusicPlayer playlist={data.playlist} isDarkMode={isDarkMode} />

      {/* 🎮 زر الدخول لصالة الألعاب (يظهر فقط إذا كانت الميزة مفعلة للعميل) */}
      {data.allowGames && (
          <button 
              onClick={() => window.open(`games.html?id=${data.id}`, '_blank')}
              className="fixed top-24 left-6 z-[90] w-12 h-12 bg-black/40 hover:bg-yellow-500 text-yellow-400 hover:text-white backdrop-blur-md border border-white/10 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:scale-105 transition-all flex items-center justify-center group animate-bounce-slow"
              title="صالة الألعاب التفاعلية 🎮"
          >
              <Dices size={22} className="group-hover:animate-spin" />
              <span className="absolute top-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
          </button>
      )}

      {/* ✅ زر التثبيت كأيقونة عائمة شيك (يختفي لو التطبيق متثبت بالفعل) */}
      {data.allowAppInstall && !isStandalone && (
          <button 
              onClick={() => setShowPWA(true)}
              className="fixed bottom-24 md:bottom-10 left-6 z-[90] w-14 h-14 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:scale-105 transition-all flex items-center justify-center group"
              title="تثبيت التطبيق 📱"
          >
              <Download size={22} style={{ color: accentColor }} className="group-hover:-translate-y-1 transition-transform" />
              <span className="absolute top-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: accentColor }}></span>
              </span>
          </button>
      )}
      
      {data.editPassword && (
          <button 
              onClick={() => setShowEditAuth(true)}
              className="fixed top-6 left-6 z-[90] w-12 h-12 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:scale-105 transition-all flex items-center justify-center"
              title="تعديل صفحتي"
          >
              <Edit3 size={20} className="text-indigo-400" />
          </button>
      )}

      {showEditAuth && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowEditAuth(false)}></div>
              <div className={`relative z-10 w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl animate-modal-spring border border-white/10 bg-[#0F0F1A] text-center`}>
                  <button onClick={() => setShowEditAuth(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition"><X size={20}/></button>
                  
                  <div className="w-16 h-16 mx-auto bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                      <Lock size={28} />
                  </div>
                  <h3 className="text-xl font-bold font-alexandria mb-2 text-white">صلاحية التعديل</h3>
                  <p className="text-xs opacity-60 mb-6 text-gray-300">أدخل الرمز السري الخاص بك لتتمكن من تعديل محتوى الصفحة.</p>
                  
                  <form onSubmit={handleEditAuthSubmit}>
                      <input 
                          type="password" 
                          value={editPassInput} 
                          onChange={(e) => setEditPassInput(e.target.value)} 
                          className={`w-full p-4 text-center text-xl font-bold tracking-[0.5em] rounded-xl border outline-none transition-all mb-4 bg-black/40 text-white ${editPassError ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-indigo-500'}`} 
                          placeholder="****" 
                          autoFocus
                      />
                      <button type="submit" className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all active:scale-95">
                          تأكيد الدخول
                      </button>
                  </form>
              </div>
          </div>
      )}

      <header className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {data.coverImage ? (data.coverType === 'video' ? <><div className={`absolute inset-0 bg-gradient-to-b z-10 ${isDarkMode ? 'from-black/30 via-[#050511]/60 to-[#050511]' : 'from-white/10 via-[#fff5f7]/60 to-[#fff5f7]'}`}></div><video src={data.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-80" autoPlay muted loop playsInline /></> : <><div className={`absolute inset-0 bg-gradient-to-b z-10 ${isDarkMode ? 'from-black/30 via-[#050511]/60 to-[#050511]' : 'from-white/10 via-[#fff5f7]/60 to-[#fff5f7]'}`}></div><img src={data.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Cover" /></>) : <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? 'from-indigo-900 to-purple-900' : 'from-indigo-200 to-purple-300'}`}></div>}
        <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent z-10 ${isDarkMode ? 'from-[#050511]' : 'from-[#fff5f7]'}`}></div>
        <div className="relative z-20 text-center px-4 max-w-2xl mt-20">
           {data.eventTitle && <div className={`inline-block px-4 py-2 rounded-full backdrop-blur-md mb-6 border font-bold animate-fade-in shadow-lg ${isDarkMode ? 'text-white/90 border-white/20' : 'text-gray-900 bg-white/50 border-white/40'}`}>✨ {data.eventTitle}</div>}
           <h1 className={`text-5xl md:text-7xl font-black mb-6 font-alexandria drop-shadow-lg animate-slide-up tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.recipientName}</h1>
           <p className={`text-xl md:text-2xl font-medium mb-8 animate-slide-up drop-shadow-md leading-relaxed ${isDarkMode ? 'text-white/90' : 'text-gray-800'}`} style={{animationDelay: '100ms'}}>{data.mainMessage}</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 relative z-20 space-y-24 -mt-10">
        
        {finalOrder.map(section => renderSection(section))}

        <footer className="pt-20 pb-32 text-center relative">
            {/* ✅ إخفاء زر التحميل اللي في الفوتر لو إحنا جوا التطبيق المثبت */}
            {data.allowAppInstall && !isStandalone && (
                <ScrollReveal>
                    <div className="mb-6 text-center relative z-20">
                        <button 
                            onClick={() => setShowPWA(true)}
                            className={`group relative inline-flex items-center gap-3 px-8 py-3 rounded-full border shadow-lg hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-fuchsia-600/20 border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-600 hover:text-white' : 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-600 hover:bg-fuchsia-500 hover:text-white'}`}
                        >
                            <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
                                <MonitorPlay size={20} className="transition-colors" /> 
                                تحميل كتطبيق للموبايل 📱
                            </span>
                            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none"></div>
                        </button>
                    </div>
                </ScrollReveal>
            )}

            {data.secretMessage && (
                <>
                    <ScrollReveal>
                        <div className="mb-10 text-center relative z-20">
                             <button 
                                onClick={() => setShowSecret(true)}
                                className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-full border backdrop-blur-xl shadow-lg hover:scale-105 transition-all duration-300 animate-bounce-slow ${isDarkMode ? 'bg-white/5 border-white/20 text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-white/60 border-white/40 text-gray-900 hover:shadow-[0_0_30px_rgba(0,0,0,0.1)]'}`}
                            >
                                <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
                                    <Lock size={20} style={{ color: accentColor }} className="transition-colors" /> 
                                    {data.secretButtonLabel || "رسالة سرية 🔒"}
                                </span>
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                             </button>
                        </div>
                    </ScrollReveal>
                    <SecretModal isOpen={showSecret} onClose={() => setShowSecret(false)} message={data.secretMessage} title={data.secretModalTitle} isDarkMode={isDarkMode} accentColor={accentColor} />
                </>
            )}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black opacity-40 uppercase tracking-widest font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><Heart size={12} className="text-red-500 fill-current" /> Designed with love by {data.senderName}</div>
        </footer>
      </main>

      {/* ✅ إظهار لعبة الأسئلة كنافذة منبثقة من داخل الصفحة */}
      {showInsideQuiz && (
          <QuizGame 
              quiz={data.quiz} 
              fullQuiz={data.quiz}
              memoryId={data.id}
              introMessage={data.quizIntroMessage}
              animationType={data.backgroundAnimation}
              onComplete={async (updatedFullQuiz) => {
                  // تحديث الحالة محلياً فوراً لعدم إظهار شاشة تحميل وتجربة سلسة
                  setShowInsideQuiz(false);
                  if(onQuizComplete) onQuizComplete(updatedFullQuiz);
                  setTimeout(() => document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
              }} 
              onClose={() => setShowInsideQuiz(false)}
              isDarkMode={isDarkMode} 
              themeColors={data.themeColors} 
          />
      )}

      {showPWA && (
          <PWAInstallerModal isOpen={showPWA} onClose={()=>setShowPWA(false)} isDarkMode={isDarkMode} accentColor={accentColor} memoryData={data} installPromptEvent={installPromptEvent} />
      )}
    </div>
  );
};

const App = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialId = urlParams.get('id');

  const [route, setRoute] = useState(initialId ? 'loading' : 'portfolio'); 
  const [memoryId, setMemoryId] = useState(initialId);
  const [memoryData, setMemoryData] = useState(null);
  const [editingMemory, setEditingMemory] = useState(null); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false); 
  const [clientEditing, setClientEditing] = useState(false); 
  
  const [isLoading, setIsLoading] = useState(!!initialId);

  useEffect(() => {
    const initializeAppAuth = async () => {
        if (typeof auth !== 'undefined' && auth) {
            try {
                await setPersistence(auth, inMemoryPersistence);
                await signInAnonymously(auth);
            } catch (err) {
                console.error("Auth Initialization Error:", err);
            }
        }
        
        if (initialId) { 
            fetchMemory(initialId); 
        } else {
            setIsLoading(false);
        }
    };

    initializeAppAuth();
  }, [initialId]);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : 'light'; 
  }, [isDarkMode]);

  const fetchMemory = async (id) => { 
    try { 
        const docSnap = await getDoc(doc(db, "memories", id)); 
        if (docSnap.exists() && !docSnap.data().isArchived) { 
            setMemoryData({ id: docSnap.id, ...docSnap.data() }); 
            setTimeout(() => {
                setIsLoading(false);
                setRoute('viewer'); 
            }, 2500); 
        } else { 
            setIsLoading(false);
            setRoute('portfolio'); 
        } 
    } catch (err) { 
        console.error(err);
        setIsLoading(false);
        setRoute('portfolio'); 
    } 
  };
  
  const AdminLogin = ({ onCancel, onLogin }) => { 
      const [email, setEmail] = useState('admin@secretpage.com');
      const [pass, setPass] = useState(''); 
      const [loading, setLoading] = useState(false);

      const handleLogin = async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
              await signInWithEmailAndPassword(auth, email, pass);
              onLogin();
          } catch (error) {
              console.error(error);
              alert('بيانات الدخول غير صحيحة، أو لم تقم بإنشاء الحساب في فايربيز بعد.');
          }
          setLoading(false);
      };

      return ( 
          <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl ${isDarkMode ? 'bg-black/90' : 'bg-white/90'}`}> 
              <form onSubmit={handleLogin} className={`glass-panel p-10 rounded-[2.5rem] w-full max-w-sm text-center relative shadow-2xl animate-modal-spring border-t border-indigo-500/30 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}> 
                  <button type="button" onClick={onCancel} className={`absolute top-6 right-6 p-2 rounded-full transition ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}><X size={20}/></button> 
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                      <Shield size={32} />
                  </div>
                  <h2 className="text-2xl font-black mb-2 font-alexandria">لوحة التحكم 🛡️</h2> 
                  <p className="text-sm opacity-60 mb-8">تسجيل الدخول للإدارة.</p>
                  
                  <input type="email" required className={`w-full p-4 rounded-xl mb-4 outline-none focus:border-indigo-500 transition-colors ${isDarkMode ? 'bg-black/40 border border-white/10 text-white placeholder-gray-500' : 'bg-white border border-gray-300 text-gray-900 shadow-sm placeholder-gray-400'}`} value={email} onChange={e=>setEmail(e.target.value)} placeholder="البريد الإلكتروني"/> 
                  <input type="password" required className={`w-full p-4 rounded-xl mb-8 outline-none focus:border-indigo-500 transition-colors text-center tracking-widest text-lg font-mono ${isDarkMode ? 'bg-black/40 border border-white/10 text-white placeholder-gray-500' : 'bg-white border border-gray-300 text-gray-900 shadow-sm placeholder-gray-400'}`} value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"/> 
                  
                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg disabled:opacity-50 transition-all active:scale-95 text-lg">
                      {loading ? <Loader2 size={24} className="animate-spin" /> : 'دخول آمن'}
                  </button> 
              </form> 
          </div> 
      ); 
  };

  if (isLoading && initialId) {
      return <LoadingScreen 
          text={memoryData?.loadingText || "جاري التحميل"} 
          animationType={memoryData?.backgroundAnimation || "classic"} 
          themeColors={memoryData?.themeColors}
          isDarkMode={isDarkMode}
      />;
  }

  if (route === 'viewer') {
      if (!isUnlocked) {
          return <PasswordWall memoryData={memoryData} onUnlock={()=>setIsUnlocked(true)} isDarkMode={isDarkMode} />;
      }
      
      const unansweredQuiz = memoryData?.quiz?.filter(q => !q.answer || q.answer.trim() === '') || [];
      const isQuizBeforePage = !memoryData.quizMode || memoryData.quizMode === 'before_page';
      
      if (isQuizBeforePage && unansweredQuiz.length > 0 && !isQuizCompleted && !clientEditing) {
          return <QuizGame 
              quiz={unansweredQuiz} 
              fullQuiz={memoryData.quiz}
              memoryId={memoryId}
              introMessage={memoryData.quizIntroMessage}
              animationType={memoryData.backgroundAnimation}
              onComplete={async (updatedFullQuiz) => {
                  // تحديث الحالة محلياً فوراً لعدم إظهار شاشة تحميل وتجربة سلسة
                  setMemoryData(prev => ({ ...prev, quiz: updatedFullQuiz }));
                  setIsQuizCompleted(true);
                  setTimeout(() => document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
                  try {
                      await updateDoc(doc(db, "memories", memoryId), { quiz: updatedFullQuiz });
                  } catch (e) {
                      console.error("Error saving answers:", e);
                  }
              }} 
              isDarkMode={isDarkMode} 
              themeColors={memoryData.themeColors} 
          />;
      }

      if (clientEditing) {
          return <MemoryEditor 
              isDarkMode={isDarkMode} 
              initialData={memoryData} 
              isClientMode={true} 
              existingMemoryId={memoryId} 
              onCancel={() => setClientEditing(false)} 
              onSave={() => { 
                  setClientEditing(false); 
                  setIsLoading(true); 
                  fetchMemory(memoryId); 
              }} 
          />;
      }
      return <MemoryView 
          data={memoryData} 
          isDarkMode={isDarkMode} 
          onEditClick={() => setClientEditing(true)} 
          onQuizComplete={async (updatedFullQuiz) => {
              // تحديث الواجهة فوراً لعرض الإجابات بدون شاشة تحميل
              setMemoryData(prev => ({ ...prev, quiz: updatedFullQuiz }));
              try {
                  await updateDoc(doc(db, "memories", memoryId), { quiz: updatedFullQuiz });
              } catch (e) {
                  console.error("Error saving answers:", e);
              }
          }}
      />;
  }

  return ( 
      <> 
          <style>{`
              /* تصميم السكرول بار للموقع بالكامل */
              ::-webkit-scrollbar { width: 8px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background-color: ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}; border-radius: 10px; border: 2px solid ${isDarkMode ? '#050511' : '#fff0f5'}; }
              ::-webkit-scrollbar-thumb:hover { background-color: ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}; }
              
              /* تصميم السكرول بار للقوائم الداخلية */
              .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin-block: 5px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.4); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(156, 163, 175, 0.8); }
          `}</style>
          {route === 'admin_dashboard' && <AdminDashboard isDarkMode={isDarkMode} onLogOut={()=>setRoute('portfolio')} onCreateNew={()=>{setEditingMemory(null); setRoute('admin_editor');}} onEdit={(mem) => { setEditingMemory(mem); setRoute('admin_editor'); }} />} 
          {route === 'admin_editor' && <MemoryEditor isDarkMode={isDarkMode} initialData={editingMemory} existingMemoryId={editingMemory?.id} onCancel={()=>setRoute('admin_dashboard')} onSave={()=>setRoute('admin_dashboard')} />} 
          {(route === 'portfolio' || route === 'admin_login') && ( 
              <> 
                  <PortfolioLanding isDarkMode={isDarkMode} toggleTheme={()=>setIsDarkMode(!isDarkMode)} onLoginClick={()=>setRoute('admin_login')} /> 
                  {route === 'admin_login' && <AdminLogin isDarkMode={isDarkMode} onCancel={()=>setRoute('portfolio')} onLogin={()=>setRoute('admin_dashboard')} />} 
              </> 
          )} 
      </> 
  );
};

export default App;