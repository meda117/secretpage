import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, getDoc, doc, 
  getDocs, deleteDoc, serverTimestamp, query, orderBy, updateDoc, where 
} from 'firebase/firestore';
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from 'firebase/auth';
import { 
  Heart, Music, Image as ImageIcon, Calendar, Lock, X, Play, Pause, 
  Sparkles, Link as LinkIcon, Trash2, Plus, Users, Eye, Copy, LayoutDashboard, LogOut,
  Globe, Star, Gift, Sun, Moon, Rocket, LayoutList, Gem, Home, MessageCircle, Send,
  Cake, HeartHandshake, Zap, Award, Lightbulb, Smile, Camera, Infinity, Flame, Bird, 
  Anchor, Coffee, Crown, Key, MapPin, Shield, CheckCircle, RefreshCw, ChevronRight, Edit3, Type, UploadCloud, MonitorPlay, Video as VideoIcon, AlertCircle, Loader2, FileAudio, Wifi, WifiOff, Info, Clock, Palette, Quote, Disc, Film
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

// --- ☁️ إعدادات Cloudinary (مجاني 100%) ---
const CLOUDINARY_CLOUD_NAME = "de6fxtgrc"; 
const CLOUDINARY_UPLOAD_PRESET = "ncnopwyi"; 

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

// --- Icon Library ---
const ICON_LIBRARY = {
  Heart, Star, Gift, Sparkles, Flame, Infinity, 
  Smile, Camera, Music, Bird, Anchor, Coffee, 
  Crown, Key, MapPin, Gem, Sun, Moon, Rocket, Zap, Lock, Shield
};

// --- Animation Library ---
const ANIMATION_TYPES = [
  { id: 'classic', name: 'كلاسيكي (فقاعات)', icon: '🫧' },
  { id: 'love', name: 'قلوب طايرة', icon: '❤️' },
  { id: 'stars', name: 'سماء ونجوم', icon: '✨' },
  { id: 'fireflies', name: 'يراعات مضيئة', icon: '🧚' },
  { id: 'snow', name: 'تساقط ثلج', icon: '❄️' },
  { id: 'confetti', name: 'احتفال', icon: '🎉' },
  { id: 'matrix', name: 'ماتريكس', icon: '💻' }
];

// --- Components ---

// ✅ مكون الفيديو الذكي (يعمل عند الظهور)
const AutoPlayVideo = ({ src, className }) => {
    const videoRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                videoRef.current.play().catch(() => {});
            } else {
                videoRef.current.pause();
            }
        }, { threshold: 0.5 }); // يعمل لما 50% من الفيديو يظهر
        
        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <video 
            ref={videoRef} 
            src={src} 
            className={className} 
            loop 
            muted // صامت افتراضياً للسماح بالتشغيل التلقائي
            playsInline 
            controls // السماح للمستخدم بفتح الصوت
        />
    );
};

// ✅ مكون جديد لعمل انيميشن عند السكرول
const ScrollReveal = ({ children, delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(ref.current); // تشغيل مرة واحدة فقط
          }
        },
        { threshold: 0.15 } // يبدأ الانيميشن لما 15% من العنصر يظهر
      );
      if (ref.current) {
        observer.observe(ref.current);
      }
      return () => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      };
    }, []);
  
    return (
      <div
        ref={ref}
        className={`transition-all duration-1000 ease-out transform ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-95"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
};

// ✅ تحديث الانيميشن: كثافة أعلى وتوهج
const DynamicBackground = ({ isDarkMode, type = 'classic', customColors }) => {
    const particles = useMemo(() => {
        const count = type === 'stars' || type === 'snow' ? 100 : 40; 
        return [...Array(count)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: type === 'snow' ? `-${Math.random() * 20}%` : `${Math.random() * 100}%`,
            size: Math.random() * (type === 'stars' ? 3 : 15) + 5 + 'px', 
            duration: Math.random() * 10 + 5 + 's',
            delay: `-${Math.random() * 10}s`
        }));
    }, [type]);

    const bgStyle = customColors?.start && customColors?.end 
        ? { background: `linear-gradient(180deg, ${customColors.start} 0%, ${customColors.end} 100%)` } 
        : {};

    const baseGradient = customColors?.start ? '' : (isDarkMode ? 'bg-[#050511]' : 'bg-[#fff0f5]');

    return (
        <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden h-full w-full ${baseGradient}`} style={bgStyle}>
            {(type === 'classic' || type === 'love' || type === 'fireflies') && (
                <>
                    <div className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 animate-float ${isDarkMode ? 'bg-indigo-600' : 'bg-rose-400'}`}></div>
                    <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 animate-float ${isDarkMode ? 'bg-purple-600' : 'bg-purple-400'}`} style={{animationDelay: '2s'}}></div>
                </>
            )}
            {particles.map((p) => {
                const glowStyle = { 
                    left: p.left, top: p.top, width: p.size, height: p.size, 
                    animationDuration: p.duration, animationDelay: p.delay,
                    boxShadow: `0 0 10px 2px rgba(255, 255, 255, 0.3)` 
                };

                if (type === 'classic') return <div key={p.id} className={`absolute rounded-full animate-rise ${isDarkMode ? 'bg-white/10' : 'bg-indigo-400/20'}`} style={{ ...glowStyle, top: 'auto', bottom: '-20px' }}></div>;
                if (type === 'love') return <div key={p.id} className={`absolute animate-rise text-red-500/40 drop-shadow-md`} style={{ ...glowStyle, top: 'auto', bottom: '-20px', fontSize: parseInt(p.size)*2 + 'px', boxShadow: 'none' }}>❤️</div>;
                if (type === 'stars') return <div key={p.id} className={`absolute rounded-full animate-twinkle bg-white shadow-[0_0_5px_white]`} style={{...glowStyle, boxShadow: '0 0 8px 2px white'}}></div>;
                if (type === 'snow') return <div key={p.id} className={`absolute rounded-full animate-fall bg-white/70`} style={{...glowStyle, boxShadow: '0 0 5px white'}}></div>;
                if (type === 'fireflies') return <div key={p.id} className={`absolute rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-float`} style={{ left: p.left, top: p.top, width: '6px', height: '6px', animationDuration: p.duration, animationDelay: p.delay }}></div>;
                return null;
            })}
            <style>{`
                @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
                @keyframes rise { 0% { transform: translateY(0) scale(1); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: translateY(-100vh) scale(1.5); opacity: 0; } }
                @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
                @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-float { animation: float 10s ease-in-out infinite; }
                .animate-rise { animation: rise linear infinite; }
                .animate-fall { animation: fall linear infinite; }
                .animate-twinkle { animation: twinkle linear infinite; }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            `}</style>
        </div>
    );
};

// UI Components
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
            <p className="mb-1 text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                {label}
            </p>
            <p className="text-xs text-gray-500">
                اضغط للاختيار (صورة أو فيديو)
            </p>
        </>
      )}
    </div>
    <input 
      type="file" 
      className="hidden" 
      accept={accept} 
      onChange={onChange}
      disabled={uploading}
    />
  </label>
);

// --- PORTFOLIO ---
const PortfolioLanding = ({ onLoginClick, isDarkMode, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('home'); 
  const [showcase, setShowcase] = useState([]);
  const [secretClickCount, setSecretClickCount] = useState(0);

  useEffect(() => {
    let unsubscribe;
    const fetchPortfolio = async () => {
      if (!db) return;
      try {
          const q = query(collection(db, "memories"), where("showInPortfolio", "==", true));
          const querySnapshot = await getDocs(q);
          setShowcase(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("Error fetching portfolio:", error); }
    };

    if (auth) {
        unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchPortfolio();
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
        <div className={`p-2.5 rounded-2xl transition-all ${highlight ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : (active ? (isDarkMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-rose-500 text-white') : 'bg-transparent text-gray-400')}`}>
            <Icon size={20} strokeWidth={2} />
        </div>
        <span className={`text-[10px] font-bold ${active ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-500'}`}>{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fff0f5] text-gray-900'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;700&family=Cairo:wght@300;400;600;800&display=swap');
        body { font-family: 'Cairo', sans-serif; }
        .font-alexandria { font-family: 'Alexandria', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); }
        .light .glass-card { background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.05); }
      `}</style>

      <DynamicBackground isDarkMode={isDarkMode} type="classic" />
       
      <div className={`flex justify-between items-center p-6 z-10 sticky top-0 ${isDarkMode ? 'bg-[#050511]/80' : 'bg-[#fff0f5]/80'} backdrop-blur-md`}>
        <div className="flex items-center gap-2 font-bold text-lg font-alexandria tracking-wide"><Sparkles size={20} className={isDarkMode ? "text-indigo-500" : "text-rose-500"} /> SecretPage</div>
        <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>{isDarkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-slate-600"/>}</button>
      </div>

      <main className="flex-1 z-10 overflow-y-auto no-scrollbar pb-32">
         {activeTab === 'home' && (
            <div className="animate-slide-up space-y-8 pt-4 px-4 text-center max-w-lg mx-auto">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest mb-2 border ${isDarkMode ? 'bg-[#1a1a2e] border-indigo-500/30 text-indigo-300' : 'bg-rose-50 border-rose-200 text-rose-600'}`}><Star size={10} className="fill-current" /> اختار مناسبتك</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight font-alexandria">صمم هديتك <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 pb-2">بشكل مختلف</span></h1>
                <div className="grid grid-cols-2 gap-3 mt-10">
                    {[{ title: "مرتبطين", icon: Heart, color: "text-red-500" }, { title: "مخطوبين", icon: Gem, color: "text-blue-400" }, { title: "عيد جوازكم", icon: Calendar, color: "text-purple-500" }, { title: "عيد ميلاد", icon: Cake, color: "text-pink-500" }, { title: "سنة جديدة", icon: Sparkles, color: "text-yellow-400" }, { title: "تصالح حبيبك", icon: HeartHandshake, color: "text-green-500" }, { title: "هدية رمضان", icon: Moon, color: "text-amber-500" }, { title: "طلب خاص", icon: Star, color: "text-indigo-400" }].map((cat, i) => (
                        <button key={i} onClick={() => setActiveTab('order')} className={`group relative p-5 h-24 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${isDarkMode ? 'bg-[#12121f] border border-white/5 hover:bg-[#1a1a2e] hover:border-white/10 hover:shadow-lg hover:shadow-indigo-500/5' : 'bg-white border border-gray-100 shadow-sm hover:border-rose-200 hover:shadow-md'}`}>
                            <div className={`transition-transform duration-300 group-hover:-translate-y-1 ${cat.color}`}><cat.icon size={22} strokeWidth={2} /></div>
                            <span className={`font-bold text-xs ${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>{cat.title}</span>
                        </button>
                    ))}
                </div>
            </div>
         )}

         {/* ... (rest of PortfolioLanding code remains same) ... */}
         {activeTab === 'work' && (
            <div className="animate-slide-up pt-6 px-4 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-6 font-alexandria">أحدث الأعمال 🎨</h2>
                <div className="grid grid-cols-1 gap-4">
                    {showcase.map(item => (
                        <div key={item.id} onClick={() => window.open(`?id=${item.id}`, '_blank')} className={`glass-card rounded-3xl overflow-hidden cursor-pointer h-48 relative group transition-all duration-300 hover:scale-[1.02]`}>
                            {item.coverImage ? (
                                item.coverType === 'video' ? 
                                <video src={item.coverImage} className="w-full h-full object-cover opacity-60" muted loop autoPlay playsInline /> :
                                <img src={item.coverImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition duration-500" />
                            ) : <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 opacity-50"></div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-5 right-5 text-right"><h3 className="font-bold text-white text-lg drop-shadow-md mb-1">{item.recipientName}</h3><p className="text-xs text-gray-300">تصميم: {item.senderName}</p></div>
                        </div>
                    ))}
                    {showcase.length === 0 && <div className="text-center opacity-40 py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">لا توجد أعمال معروضة حالياً</div>}
                </div>
            </div>
         )}

         {activeTab === 'features' && (
            <div className="animate-slide-up pt-6 px-4 space-y-12 max-w-lg mx-auto">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-b from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/30"><Shield size={32} /></div>
                    <h2 className="text-3xl font-bold mb-3 font-alexandria">ليه Secret Page؟</h2>
                    <p className="text-sm opacity-60 mb-10 leading-relaxed max-w-xs mx-auto">لأننا بنقدملك هدية مش مجرد شكل، دي تجربة كاملة بتعيش العمر.</p>
                    <div className="space-y-4">
                        {[{t:"صفحة ويب كاملة خاصة بيك وبحبيبك بس", i:Globe, c: "bg-indigo-500/20 text-indigo-300"}, {t:"أمان وخصوصية 100% بباسورد خاص", i:Lock, c: "bg-purple-500/20 text-purple-300"}, {t:"موسيقى بتشتغل تلقائياً مع الذكريات", i:Music, c: "bg-blue-500/20 text-blue-300"}, {t:"تصميم متجاوب وشيك على كل الموبايلات", i:Rocket, c: "bg-pink-500/20 text-pink-300"}].map((x,i)=>(
                           <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#151525] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                               <div className={`p-3 rounded-full shrink-0 ${x.c}`}><x.i size={20} strokeWidth={2.5}/></div>
                               <span className={`text-sm font-bold text-right ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{x.t}</span>
                           </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-6 font-alexandria flex items-center gap-2">✨ مميزات إضافية</h3>
                    <div className="space-y-5">
                         {[{title: "سرعة وتسليم فوري", desc: "استلم رابط صفحتك في نفس اليوم.", icon: Zap, bg: "bg-yellow-500/20", color: "text-yellow-400"}, {title: "جودة عالية", desc: "الصور بتظهر بأعلى جودة وتصميم راقي.", icon: ImageIcon, bg: "bg-blue-500/20", color: "text-blue-400"}, {title: "ضمان بقاء الصفحة", desc: "الرابط شغال ومتاح 24/7 مدى الحياة.", icon: Award, bg: "bg-green-500/20", color: "text-green-400"}].map((feat, i) => (
                             <div key={i} className="flex items-center gap-5">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${feat.bg} ${feat.color}`}><feat.icon size={26} strokeWidth={2} /></div>
                                 <div className="text-right"><h4 className="text-lg font-bold mb-1">{feat.title}</h4><p className="text-xs opacity-50">{feat.desc}</p></div>
                             </div>
                          ))}
                    </div>
                </div>
            </div>
         )}
         
         {activeTab === 'steps' && (
            <div className="animate-slide-up pb-24 pt-6 px-4">
                <h2 className={`text-2xl font-bold mb-8 font-alexandria text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>خطوات الطلب 📝</h2>
                <div className="space-y-4 relative px-2 max-w-lg mx-auto">
                    {[{ step: "1", title: "اختار فكرتك", desc: "اختار فكرتك او احنا نساعدك في فكر مناسبة ليك ولشريكك.", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-400/10" }, { step: "2", title: "ابعت التفاصيل", desc: "ابعتلنا الفكرة والتفاصيل الي تحبها (صور، اغاني، رسائل).", icon: Send, color: "text-blue-400", bg: "bg-blue-400/10" }, { step: "3", title: "استلم هديتك", desc: "استلم هديتك في اسرع وقت برابط خاص.", icon: Gift, color: "text-purple-400", bg: "bg-purple-400/10" }].map((s, i) => (
                        <div key={i} className={`glass-card p-6 rounded-3xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isDarkMode ? 'border-white/5 hover:border-indigo-500/30' : 'border-white shadow-sm'}`}>
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${s.bg} ${s.color}`}><s.icon size={28} /></div>
                                <div><div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>خطوة {s.step}</div><h3 className={`text-xl font-bold mb-2 font-alexandria ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{s.title}</h3><p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s.desc}</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         )}

         {activeTab === 'order' && (
            <div className="animate-slide-up pt-10 px-4 flex flex-col items-center text-center h-[60vh] justify-center max-w-lg mx-auto">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6 animate-pulse"><MessageCircle size={40} /></div>
                <h2 className="text-3xl font-bold mb-4 font-alexandria">جاهز تفرحهم؟</h2>
                <p className="mb-10 opacity-60 max-w-xs leading-relaxed">الطلب بيتم عن طريق الواتساب مباشرة. اضغط تحت وهنرد عليك بالتفاصيل.</p>
                <button className="w-full max-w-sm py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-green-900/20 transition-transform active:scale-95"><Send size={20} /> تواصل واتساب</button>
            </div>
         )}
         <div className="text-center pt-8"><p onClick={handleSecretClick} className="text-[10px] opacity-20 cursor-default hover:opacity-50 transition">© SecretPage 2026</p></div>
      </main>

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm rounded-[2rem] p-2 backdrop-blur-xl border shadow-2xl ${isDarkMode ? 'bg-[#12121f]/90 border-white/10 shadow-black/50' : 'bg-white/90 border-gray-200 shadow-gray-200/50'}`}>
        <div className="flex justify-between items-center px-2">
            <NavButton active={activeTab==='home'} onClick={()=>setActiveTab('home')} icon={Home} label="الرئيسية" />
            <NavButton active={activeTab==='work'} onClick={()=>setActiveTab('work')} icon={LayoutList} label="أعمالنا" />
            <NavButton active={activeTab==='features'} onClick={()=>setActiveTab('features')} icon={Gem} label="المميزات" />
            <NavButton active={activeTab==='steps'} onClick={()=>setActiveTab('steps')} icon={Rocket} label="الخطوات" />
            <NavButton active={activeTab==='order'} onClick={()=>setActiveTab('order')} icon={Send} label="اطلب" highlight />
        </div>
      </div>
    </div>
  );
};

// --- 1. ADMIN DASHBOARD ---

const AdminDashboard = ({ onLogOut, onCreateNew, onEdit, isDarkMode }) => {
    const [memories, setMemories] = useState([]);
    useEffect(() => {
        let unsubscribe;
        const fetchMemories = async () => {
            if (!db) return;
            const q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            setMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        // ✅ Wait for Auth
        if (auth) {
            unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) fetchMemories();
            });
        }
        return () => unsubscribe && unsubscribe();
    }, []);

    const handleDelete = async (id) => { if(window.confirm("حذف؟")) { await deleteDoc(doc(db, "memories", id)); window.location.reload(); }};
    const togglePortfolio = async (id, status) => { await updateDoc(doc(db, "memories", id), { showInPortfolio: !status }); window.location.reload(); };
    const copyLink = (id) => { navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?id=${id}`); alert("تم نسخ رابط العميل بنجاح!"); };

    return (
        <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fff0f5] text-gray-900'}`}>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-wrap justify-between items-center mb-10 gap-4 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20"><LayoutDashboard size={24} /></div>
                        <div><h1 className="text-2xl font-bold font-alexandria">لوحة التحكم</h1><p className="text-xs opacity-60">إدارة {memories.length} ذكرى نشطة</p></div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onLogOut} className="bg-red-500/10 text-red-400 p-3 rounded-xl hover:bg-red-500/20 transition"><LogOut size={20} /></button>
                        <button onClick={onCreateNew} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition"><Plus size={20} /> ذكرى جديدة</button>
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memories.map((mem) => (
                        <div key={mem.id} className={`group p-6 rounded-[2rem] relative border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${mem.showInPortfolio ? 'border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-transparent' : (isDarkMode ? 'border-white/5 bg-[#12121f]' : 'border-white bg-white')}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${isDarkMode ? 'bg-white/5 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>{mem.recipientName?.[0]}</div>
                                    <div className="overflow-hidden">
                                        {/* ✅ عرض عنوان الذكرى بدلاً من الاسم فقط */}
                                        <h3 className="text-lg font-bold truncate max-w-[150px]">{mem.memoryTitle || mem.recipientName}</h3>
                                        {mem.memoryTitle && <p className="text-[10px] opacity-60 truncate">{mem.recipientName}</p>}
                                        <p className="text-[10px] opacity-50 font-mono mt-1">Pass: {mem.password}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${mem.showInPortfolio ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-500'}`}>{mem.showInPortfolio ? <><Globe size={10} /> Live</> : <Lock size={10} />}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button onClick={()=>copyLink(mem.id)} className="col-span-2 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition"><LinkIcon size={14}/> نسخ رابط العميل</button>
                                <button onClick={()=>togglePortfolio(mem.id, mem.showInPortfolio)} className="py-2 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition">{mem.showInPortfolio ? 'إخفاء' : 'عرض (تجريبي)'}</button>
                                <button onClick={()=>window.open(`?id=${mem.id}`, '_blank')} className="py-2 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition">معاينة</button>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-[10px] opacity-40">{new Date(mem.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit(mem)} className="text-blue-400 hover:bg-blue-500/10 p-2 rounded-lg transition" title="تعديل"><Edit3 size={16}/></button>
                                    <button onClick={()=>handleDelete(mem.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition" title="حذف"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- 2. MEMORY EDITOR (With Cloudinary Support & Editing) ---

const MemoryEditor = ({ onCancel, onSave, isDarkMode, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
      recipientName: '', senderName: '', memoryTitle: '', eventTitle: '', password: '', 
      targetDate: '', timerLabel: '', mainMessage: '',
      sectionTitles: { countdown: '', gallery: '', cards: '', marquees: '' }, 
      themeColors: { start: '', end: '' }, 
      songUrl: '', songTitle: '', songImage: '', songType: 'link', // ✅ Added song details
      coverImage: '', coverType: 'image', // ✅ Added coverType
      backgroundAnimation: 'classic',
      showInPortfolio: false, secretMessage: '', photos: [], marquees: [], flipCards: [],
      loginTitle: '', loginPlaceholder: '', loginButtonText: '',
      loginDescription: '', loginIcon: 'Lock', loginImage: '' 
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadState, setUploadState] = useState({ type: null, progress: 0 }); 
  const [musicSource, setMusicSource] = useState('link');
  const [tempPhoto, setTempPhoto] = useState({ img: '', title: '', desc: '', type: 'image' }); // ✅ Added type to tempPhoto
  const [tempMarquee, setTempMarquee] = useState({ text: '', icon: 'Heart' });
  const [tempFlip, setTempFlip] = useState({ message: '', icon: 'Star', hint: '' }); 
  const [authState, setAuthState] = useState({ connected: false, user: null });

  useEffect(() => {
    if (initialData) {
        setFormData({ 
            ...formData, 
            ...initialData, 
            sectionTitles: initialData.sectionTitles || { countdown: '', gallery: '', cards: '', marquees: '' },
            themeColors: initialData.themeColors || { start: '', end: '' }
        });
        if (initialData.songType) setMusicSource(initialData.songType);
    }
    if(auth) {
        return onAuthStateChanged(auth, (user) => {
            setAuthState({ connected: true, user });
        });
    }
  }, [initialData]);

  // ✅ Cloudinary Upload Function (Replaces Firebase Storage)
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
                      let errorMessage = `فشل الرفع (كود ${xhr.status})`;
                      try {
                          const res = JSON.parse(xhr.responseText);
                          if (res.error && res.error.message) {
                              errorMessage = `خطأ من Cloudinary: ${res.error.message}`;
                              if (res.error.message.includes("preset")) {
                                  errorMessage += "\n\n(تأكد إن الـ Upload Preset مكتوب صح وإنه معمول Unsigned)";
                              }
                          }
                      } catch (e) {
                          errorMessage += `: ${xhr.statusText}`;
                      }
                      reject(new Error(errorMessage));
                  }
              });

              xhr.addEventListener("error", () => reject(new Error("خطأ في الاتصال بالإنترنت (Network Error)")));
              xhr.addEventListener("abort", () => reject(new Error("تم إلغاء الرفع")));
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
        // ✅ تحديد نوع الملف (فيديو أو صورة)
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
        
        const url = await uploadToCloudinary(file, field);
        if (url) {
            if(field === 'cover') setFormData({ ...formData, coverImage: url, coverType: mediaType });
            if(field === 'photo') setTempPhoto({ ...tempPhoto, img: url, type: mediaType }); // ✅ حفظ نوع الميديا في المعرض
            if(field === 'loginImage') setFormData({...formData, loginImage: url}); 
            if(field === 'songImage') setFormData({...formData, songImage: url}); 
        }
    }
  };

  const handleAudioUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
          const url = await uploadToCloudinary(file, 'audio');
          if (url) {
            setFormData({ ...formData, songUrl: url, songType: 'file' });
          }
      }
  };

  const generatePassword = () => {
      const chars = "0123456789";
      let pass = "";
      for(let i=0; i<4; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
      setFormData({...formData, password: pass});
  };

  const addItem = (list, item, reset) => { if(item) { setFormData({...formData, [list]: [...formData[list], {...item, id: Date.now()}]}); reset(); }};
  const removeItem = (list, id) => setFormData({...formData, [list]: formData[list].filter(x=>x.id!==id)});
   
  const handleSave = async () => {
    if (!formData.password || !formData.recipientName) return alert("الاسم والباسورد مطلوبين!");
    if (!db) return alert("Database error");

    setSaving(true);
    try {
        if (initialData && initialData.id) {
            // Update existing memory
            await updateDoc(doc(db, "memories", initialData.id), { ...formData, updatedAt: serverTimestamp() });
            alert("تم التعديل بنجاح!");
        } else {
            // Create new memory
            await addDoc(collection(db, "memories"), { ...formData, createdAt: serverTimestamp() });
            alert("تم الحفظ بنجاح!");
        }
        onSave();
    } catch (e) {
        console.error(e);
        alert("خطأ في الحفظ: " + e.message);
        setSaving(false);
    }
  };

  const IconGrid = ({ onSelect, selected }) => (
      <div className="grid grid-cols-6 gap-2 mt-2 max-h-32 overflow-y-auto no-scrollbar bg-black/10 p-2 rounded-xl border border-white/5">
          {Object.keys(ICON_LIBRARY).map(key => {
              const Icon = ICON_LIBRARY[key];
              return (
                  <button key={key} onClick={() => onSelect(key)} className={`p-2 rounded-lg flex items-center justify-center transition-all ${selected === key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      <Icon size={18} />
                  </button>
              );
          })}
      </div>
  );

  return (
    <div className={`min-h-screen p-4 flex items-center justify-center ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fff0f5] text-gray-900'}`}>
      <div className={`w-full max-w-5xl rounded-[2.5rem] relative h-[90vh] flex flex-col overflow-hidden border shadow-2xl ${isDarkMode ? 'bg-[#12121f] border-white/10' : 'bg-white border-gray-100'}`}>
        
        <div className="flex justify-between items-center p-8 border-b border-white/5">
            <div><h2 className="text-2xl font-bold font-alexandria mb-1">{initialData ? 'تعديل الذكرى' : 'تصميم ذكرى جديدة'}</h2><p className="text-xs opacity-50">خطوة {step} من 4</p></div>
            <div className="flex gap-2 items-center">
                <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full ${authState.user ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {authState.user ? <Wifi size={10}/> : <WifiOff size={10}/>}
                    {authState.user ? 'متصل' : 'غير متصل'}
                </div>

                {[1,2,3,4].map(s => <div key={s} onClick={()=>setStep(s)} className={`w-3 h-3 rounded-full cursor-pointer transition-all ${step===s ? 'bg-indigo-500 scale-125' : 'bg-white/20'}`}></div>)}
                <button onClick={onCancel} className="mr-4 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition"><X size={20}/></button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {step === 1 && (
            <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
                <div className="space-y-2 mb-4">
                    <label className="text-xs font-bold opacity-70 flex items-center gap-2"><LayoutDashboard size={14}/> عنوان الملف (يظهر لك فقط في لوحة التحكم)</label>
                    <input value={formData.memoryTitle} onChange={e=>setFormData({...formData, memoryTitle: e.target.value})} className="input-field bg-indigo-500/10 border-indigo-500/30 border p-4 rounded-xl w-full focus:border-indigo-500 transition" placeholder="مثال: عيد ميلاد سارة 2026" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold opacity-70">اسم العميل (يظهر في الموقع)</label><input value={formData.recipientName} onChange={e=>setFormData({...formData, recipientName: e.target.value})} className="input-field bg-white/5 border-white/10 p-4 rounded-xl w-full focus:border-indigo-500 transition" placeholder="مثال: سارة" /></div>
                    <div className="space-y-2"><label className="text-xs font-bold opacity-70">اسم الراسل</label><input value={formData.senderName} onChange={e=>setFormData({...formData, senderName: e.target.value})} className="input-field bg-white/5 border-white/10 p-4 rounded-xl w-full focus:border-indigo-500 transition" placeholder="مثال: أحمد" /></div>
                </div>
                <div className="space-y-2"><label className="text-xs font-bold opacity-70">عنوان المناسبة (اختياري)</label><input value={formData.eventTitle} onChange={e=>setFormData({...formData, eventTitle: e.target.value})} className="input-field bg-white/5 border-white/10 p-4 rounded-xl w-full" placeholder="مثال: عيد ميلاد سعيد" /></div>
                
                <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                    <label className="text-xs font-bold text-indigo-400 mb-2 block flex items-center gap-2"><Key size={14}/> الرقم السري للعميل</label>
                    <div className="flex gap-2"><input value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="input-field bg-black/20 border-white/10 p-4 rounded-xl w-full text-center text-xl font-mono tracking-widest font-bold" placeholder="****" /><button onClick={generatePassword} className="px-6 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-700 transition flex items-center gap-2"><RefreshCw size={18}/> توليد</button></div>
                </div>

                {/* ✅ تخصيص صفحة الدخول بالكامل */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mt-6">
                    <label className="text-xs font-bold mb-4 block flex items-center gap-2 text-pink-400"><Type size={14}/> تخصيص صفحة الدخول (كاملة)</label>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] opacity-50 mb-1 block">عنوان الصفحة (Headline)</label><input value={formData.loginTitle} onChange={e=>setFormData({...formData, loginTitle: e.target.value})} className="input-field bg-black/20 border-white/10 p-3 rounded-xl w-full text-sm" placeholder="الافتراضي: رسالة خاصة..." /></div>
                            <div><label className="text-[10px] opacity-50 mb-1 block">الوصف (Sub-header)</label><input value={formData.loginDescription} onChange={e=>setFormData({...formData, loginDescription: e.target.value})} className="input-field bg-black/20 border-white/10 p-3 rounded-xl w-full text-sm" placeholder="الافتراضي: المحتوى ده سري..." /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] opacity-50 mb-1 block">نص الزر</label><input value={formData.loginButtonText} onChange={e=>setFormData({...formData, loginButtonText: e.target.value})} className="input-field bg-black/20 border-white/10 p-3 rounded-xl w-full text-sm" placeholder="الافتراضي: فتح الرسالة" /></div>
                            <div><label className="text-[10px] opacity-50 mb-1 block">النص التوضيحي (Placeholder)</label><input value={formData.loginPlaceholder} onChange={e=>setFormData({...formData, loginPlaceholder: e.target.value})} className="input-field bg-black/20 border-white/10 p-3 rounded-xl w-full text-sm" placeholder="الافتراضي: ****" /></div>
                        </div>
                        
                        <div className="pt-4 border-t border-white/5">
                            <label className="text-[10px] opacity-50 mb-2 block">أيقونة القفل (أو اختر صورة):</label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <IconGrid selected={formData.loginIcon || 'Lock'} onSelect={icon => setFormData({...formData, loginIcon: icon})} />
                                </div>
                                <div className="w-1/3">
                                    <CustomFileUpload 
                                        label="صورة فوق الأيقونة"
                                        uploading={uploading && uploadState.type === 'loginImage'}
                                        progress={uploadState.progress}
                                        accept="image/*"
                                        onChange={e => handleImageUpload(e, 'loginImage')}
                                        icon={ImageIcon}
                                    />
                                    {formData.loginImage && <img src={formData.loginImage} className="mt-2 h-16 w-16 object-cover rounded-full mx-auto border border-white/20" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2"><label className="text-xs font-bold opacity-70">رسالة الإهداء</label><textarea value={formData.mainMessage} onChange={e=>setFormData({...formData, mainMessage: e.target.value})} className="input-field bg-white/5 border-white/10 p-4 rounded-xl w-full h-32 resize-none" placeholder="اكتب رسالة حلوة..." /></div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-8 max-w-3xl mx-auto">
                <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2 mb-2"><ImageIcon size={18} /> الغلاف (صورة أو فيديو)</h3>
                    <CustomFileUpload 
                        label={formData.coverImage ? "تغيير الغلاف" : "رفع الغلاف"}
                        uploading={uploading && uploadState.type === 'cover'}
                        progress={uploadState.progress}
                        accept="image/*,video/*"
                        onChange={e => handleImageUpload(e, 'cover')}
                        icon={formData.coverType === 'video' ? VideoIcon : ImageIcon}
                    />
                    {formData.coverImage && (
                        <div className="relative mt-4 group w-fit mx-auto h-40 rounded-xl overflow-hidden shadow-lg border border-white/10">
                            {formData.coverType === 'video' ? (
                                <video src={formData.coverImage} className="h-full w-full object-cover" muted autoPlay loop />
                            ) : (
                                <img src={formData.coverImage} className="h-full w-full object-cover" alt="Cover"/>
                            )}
                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full"><CheckCircle size={14}/></div>
                        </div>
                    )}
                </div>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                    <label className="font-bold flex items-center gap-2"><Music size={18} /> الموسيقى</label>
                    
                    {/* ✅ بيانات الأغنية الجديدة */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-[10px] opacity-50 block mb-1">اسم الأغنية (يظهر في المشغل)</label>
                            <input value={formData.songTitle} onChange={e=>setFormData({...formData, songTitle: e.target.value})} className="input-field bg-black/20 border-white/10 p-3 rounded-xl w-full text-sm" placeholder="مثال: بحبك - عمرو دياب" />
                        </div>
                        <div>
                            <label className="text-[10px] opacity-50 block mb-1">صورة الألبوم (اختياري)</label>
                            <CustomFileUpload 
                                label="صورة الأغنية"
                                uploading={uploading && uploadState.type === 'songImage'}
                                accept="image/*"
                                onChange={e => handleImageUpload(e, 'songImage')}
                                icon={Disc}
                            />
                            {formData.songImage && <p className="text-[10px] text-green-400 mt-1">تم رفع صورة الألبوم ✅</p>}
                        </div>
                    </div>

                    <div className="flex gap-2 mb-2">
                        <button onClick={()=>{setMusicSource('link'); setFormData({...formData, songType:'link', songUrl:''})}} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${musicSource==='link' ? 'bg-white text-black border-white' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}>رابط يوتيوب</button>
                        <button onClick={()=>{setMusicSource('file'); setFormData({...formData, songType:'file', songUrl:''})}} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${musicSource==='file' ? 'bg-white text-black border-white' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}>رفع ملف (MP3)</button>
                    </div>
                    
                    {musicSource === 'link' ? (
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 transition focus-within:border-indigo-500"><LinkIcon size={18} className="opacity-50"/><input value={formData.songUrl} onChange={e=>setFormData({...formData, songUrl: e.target.value})} className="bg-transparent border-none p-4 w-full outline-none" placeholder="https://youtube.com/..." /></div>
                    ) : (
                        <div>
                            <CustomFileUpload 
                                label={formData.songUrl ? "تغيير الملف الصوتي" : "رفع ملف MP3"}
                                uploading={uploading && uploadState.type === 'audio'}
                                progress={uploadState.progress}
                                accept="audio/*"
                                onChange={handleAudioUpload}
                                icon={FileAudio}
                            />
                             {formData.songUrl && <p className="text-green-400 text-xs mt-3 flex items-center justify-center gap-1"><CheckCircle size={12}/> تم رفع الملف الصوتي بنجاح</p>}
                        </div>
                    )}
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative mt-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Camera size={18}/> معرض الذكريات</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-start">
                         <div className="h-full">
                            <CustomFileUpload 
                                label="إضافة (صورة/فيديو)"
                                uploading={uploading && uploadState.type === 'photo'}
                                progress={uploadState.progress}
                                accept="image/*,video/*"
                                onChange={e => handleImageUpload(e, 'photo')}
                                icon={Plus}
                            />
                         </div>
                         <div className="space-y-3">
                            <input value={tempPhoto.title} onChange={e=>setTempPhoto({...tempPhoto, title: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none transition" placeholder="عنوان (اختياري)"/>
                            <textarea value={tempPhoto.desc} onChange={e=>setTempPhoto({...tempPhoto, desc: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-sm h-24 resize-none focus:border-indigo-500 outline-none transition" placeholder="وصف قصير..."/>
                            <button onClick={()=>addItem('photos', tempPhoto.img?tempPhoto:null, ()=>setTempPhoto({img:'',title:'',desc:'', type:'image'}))} disabled={!tempPhoto.img} className="w-full py-3 bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"><Plus size={16}/> حفظ</button>
                         </div>
                    </div>
                    
                    {tempPhoto.img && (
                        <div className="mb-4 p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center gap-3">
                            {tempPhoto.type === 'video' ? <Film size={20} className="text-white"/> : <img src={tempPhoto.img} className="w-10 h-10 rounded-lg object-cover" />}
                            <span className="text-xs text-indigo-300">تم الرفع! اضغط "حفظ" للإضافة.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-4 gap-3 mt-6">
                        {formData.photos.map(p=><div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden border border-white/5">
                            {p.type === 'video' ? (
                                <video src={p.img} className="w-full h-full object-cover" muted />
                            ) : (
                                <img src={p.img} className="w-full h-full object-cover"/>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <button onClick={()=>removeItem('photos', p.id)} className="bg-red-500 p-2 rounded-full text-white hover:scale-110 transition"><Trash2 size={16}/></button>
                            </div>
                            {p.type === 'video' && <div className="absolute bottom-1 right-1 bg-black/50 p-1 rounded-full"><Film size={10} className="text-white"/></div>}
                        </div>)}
                    </div>
                </div>
            </div>
          )}

          {step === 3 && (
             <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <h3 className="font-bold mb-4 flex gap-2 text-blue-400"><MonitorPlay size={18}/> التصميم والانيميشن</h3>
                    
                    {/* ✅ تخصيص ألوان الخلفية */}
                    <div className="mb-6 p-4 rounded-2xl bg-black/20 border border-white/5">
                        <label className="text-xs font-bold mb-3 block flex items-center gap-2 text-indigo-300"><Palette size={14}/> ألوان الخلفية (تدرج لوني)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] opacity-50 block mb-1">لون البداية</span>
                                <input type="color" value={formData.themeColors?.start || '#050511'} onChange={e=>setFormData({...formData, themeColors: {...formData.themeColors, start: e.target.value}})} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1" />
                            </div>
                            <div>
                                <span className="text-[10px] opacity-50 block mb-1">لون النهاية</span>
                                <input type="color" value={formData.themeColors?.end || '#1a1a2e'} onChange={e=>setFormData({...formData, themeColors: {...formData.themeColors, end: e.target.value}})} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ANIMATION_TYPES.map(anim => (
                            <button 
                                key={anim.id}
                                onClick={() => setFormData({...formData, backgroundAnimation: anim.id})}
                                className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition border ${formData.backgroundAnimation === anim.id ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-black/20 border-white/10 hover:bg-white/10'}`}
                            >
                                <span className="text-2xl">{anim.icon}</span>
                                <span className="text-xs font-bold">{anim.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <h3 className="font-bold mb-4 flex gap-2 text-indigo-400"><Calendar size={18}/> العداد</h3>
                    {/* ✅ تحديث: تغيير عنوان العداد */}
                    <input value={formData.sectionTitles?.countdown || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, countdown: e.target.value}})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl mb-3 text-sm font-bold text-indigo-300" placeholder="عنوان القسم (افتراضي: باقي على المناسبة)" />
                    
                    <input value={formData.timerLabel} onChange={e=>setFormData({...formData, timerLabel: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl mb-3 text-sm" placeholder="وصف العداد (مثلاً: مر على حبنا..)" />
                    <input type="datetime-local" value={formData.targetDate} onChange={e=>setFormData({...formData, targetDate: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl mb-2 text-sm"/>
                    <p className="text-[10px] opacity-50 mt-1">* العداد يحسب تلقائياً (تصاعدي إذا كان التاريخ في الماضي، وتنازلي إذا كان في المستقبل).</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <h3 className="font-bold mb-4 flex gap-2 text-pink-400"><Infinity size={18}/> الشريط المتحرك</h3>
                    
                    {/* ✅ عنوان لقسم الشرائط */}
                    <input value={formData.sectionTitles?.marquees || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, marquees: e.target.value}})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl mb-4 text-sm font-bold text-pink-300" placeholder="عنوان القسم (اختياري)" />

                    <input value={tempMarquee.text} onChange={e=>setTempMarquee({...tempMarquee, text: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-sm mb-2" placeholder="الجملة..."/>
                    <label className="text-[10px] opacity-50 mb-2 block">اختر أيقونة:</label>
                    <IconGrid selected={tempMarquee.icon} onSelect={icon => setTempMarquee({...tempMarquee, icon})} />
                    <button onClick={()=>addItem('marquees', tempMarquee.text?tempMarquee:null, ()=>setTempMarquee({...tempMarquee, text:''}))} className="w-full py-2 mt-4 bg-pink-500/20 text-pink-400 rounded-xl text-sm font-bold hover:bg-pink-500/30">+ إضافة</button>
                    <div className="mt-3 flex flex-wrap gap-2">{formData.marquees.map(m=><span key={m.id} className="text-xs bg-black/30 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">{m.text} <X size={10} onClick={()=>removeItem('marquees',m.id)} className="cursor-pointer hover:text-red-400"/></span>)}</div>
                </div>
                <div className="col-span-full p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <h3 className="font-bold mb-4 flex gap-2 text-yellow-400"><Smile size={18}/> الكروت القلابة</h3>
                    {/* ✅ تحديث: تغيير عنوان الكروت */}
                    <input value={formData.sectionTitles?.cards || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, cards: e.target.value}})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl mb-4 text-sm font-bold text-yellow-300" placeholder="عنوان القسم (افتراضي: رسائل ليكِ ❤️)" />
                    
                    <div className="mb-4">
                        <label className="text-[10px] opacity-50 mb-2 block">اختر أيقونة للكارت:</label>
                        <IconGrid selected={tempFlip.icon} onSelect={icon => setTempFlip({...tempFlip, icon})} />
                        {/* ✅ نص مخصص أسفل الإيموجي */}
                        <input value={tempFlip.hint} onChange={e=>setTempFlip({...tempFlip, hint: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-sm mt-4 mb-2" placeholder="النص الظاهر (اضغط للفتح)..."/>
                        <input value={tempFlip.message} onChange={e=>setTempFlip({...tempFlip, message: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-sm" placeholder="الرسالة المخفية..."/>
                    </div>
                    <button onClick={()=>addItem('flipCards', tempFlip.message?tempFlip:null, ()=>setTempFlip({...tempFlip, message:'', hint:''}))} className="w-full py-2 bg-yellow-500/20 text-yellow-400 rounded-xl text-sm font-bold hover:bg-yellow-500/30">+ إضافة كارت</button>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">{formData.flipCards.map(c=><div key={c.id} className="bg-black/30 p-3 rounded-xl border border-white/5 text-center text-xs relative"><div className="font-bold mb-1 opacity-70">{c.icon}</div><div className="truncate text-white">{c.message}</div><X size={12} onClick={()=>removeItem('flipCards',c.id)} className="absolute top-1 right-1 cursor-pointer text-red-400"/></div>)}</div>
                </div>
                
                {/* ✅ حقل جديد: عنوان معرض الصور */}
                <div className="col-span-full p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <h3 className="font-bold mb-4 flex gap-2 text-blue-400"><ImageIcon size={18}/> معرض الصور</h3>
                    <input value={formData.sectionTitles?.gallery || ''} onChange={e=>setFormData({...formData, sectionTitles: {...formData.sectionTitles, gallery: e.target.value}})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-sm font-bold text-blue-300" placeholder="عنوان القسم (افتراضي: أجمل الذكريات 📸)" />
                </div>
             </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in space-y-6 max-w-xl mx-auto text-center">
               <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={40}/></div>
               <h3 className="text-2xl font-bold">كل حاجة جاهزة!</h3>
               <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-right space-y-4">
                   <div><label className="text-xs font-bold opacity-70 block mb-2">رسالة سرية (في الفوتر - اختياري)</label><textarea value={formData.secretMessage} onChange={e=>setFormData({...formData, secretMessage: e.target.value})} className="input-field bg-black/20 border-white/10 p-4 rounded-xl w-full h-24 text-sm" placeholder="رسالة صغيرة جداً..." /></div>
                   <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                       <div className="text-sm font-bold flex items-center gap-2 opacity-70"><Globe size={16}/> نشر في معرض الأعمال (Public Portfolio)</div>
                       <input type="checkbox" checked={formData.showInPortfolio} onChange={e=>setFormData({...formData, showInPortfolio: e.target.checked})} className="w-5 h-5 accent-indigo-500 cursor-pointer"/>
                   </div>
                   <p className="text-[10px] opacity-40 pr-2">لو مفعلتش الخيار ده، الرابط هيكون خاص بالعميل بس.</p>
               </div>
               <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-white shadow-xl hover:scale-[1.02] transition">{saving ? 'جارِ الحفظ...' : 'حفظ وتوليد رابط العميل 🔗'}</button>
            </div>
          )}
        </div>
        {step < 4 && <div className="p-6 border-t border-white/5 flex justify-end"><button onClick={()=>setStep(s=>s+1)} className="px-8 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition">التالي <ChevronRight size={18}/></button></div>}
      </div>
    </div>
  );
};

// ... PasswordWall and MemoryView helpers ...

// ✅ تحديث الكروت القلابة: زجاجية سوداء + أيقونات متوهجة
const FlipCard = ({ iconName, message, hint }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = ICON_LIBRARY[iconName] || Star;

  return (
    <div className="group w-full h-48 cursor-pointer [perspective:1000px]" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front Face - Black Glass */}
        <div 
            className="absolute w-full h-full [backface-visibility:hidden] rounded-[2rem] flex flex-col items-center justify-center shadow-lg border border-white/10 backdrop-blur-md bg-black/40 text-white"
        >
          <div className="p-4 bg-white/5 rounded-full mb-3 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10">
              <Icon size={32} className="animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
          <span className="text-xs font-bold opacity-80 drop-shadow-md">{hint || "اضغط لفتح الرسالة"}</span>
        </div>

        {/* Back Face - Black Glass */}
        <div 
            className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] flex items-center justify-center p-6 text-center shadow-xl border border-white/20 backdrop-blur-xl bg-black/70 text-white"
        >
          <div className="overflow-y-auto max-h-full no-scrollbar w-full">
             <Quote size={20} className="mb-2 opacity-30 mx-auto drop-shadow-md" />
             <p className="font-bold text-sm leading-relaxed drop-shadow-sm">{message}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

// ✅ Improved Professional Countdown (Transparent & Modern)
const CountdownTimer = ({ targetDate, isDarkMode, label }) => {
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
        <div className={`absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500 ${isDarkMode ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300'}`}></div>
        <div className={`relative bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[2rem] text-center shadow-2xl`}>
            {label && <h3 className="text-lg font-bold opacity-80 mb-6 font-alexandria flex items-center justify-center gap-2"><Clock size={18} className="text-indigo-400"/> {label}</h3>}
            {!label && <h3 className="text-lg font-bold opacity-80 mb-6 font-alexandria flex items-center justify-center gap-2"><Clock size={18} className="text-indigo-400"/> {isPast ? 'مرّ على ذكرانا' : 'باقي على المناسبة'}</h3>}
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

// ✅ صفحة الباسورد موحدة التصميم ومخصصة بالكامل
const PasswordWall = ({ memoryData, onUnlock, isDarkMode }) => {
  const [input, setInput] = useState(''); const [error, setError] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); if (input === memoryData.password) onUnlock(); else { setError(true); setTimeout(() => setError(false), 800); } };
  
  const PageIcon = ICON_LIBRARY[memoryData.loginIcon] || Lock;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fff0f5] text-gray-900'}`}>
      <DynamicBackground isDarkMode={isDarkMode} type={memoryData.backgroundAnimation || 'classic'} customColors={memoryData.themeColors} />
      
      <div className="max-w-md w-full p-8 text-center relative z-10 bg-black/30 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl animate-fade-in">
        <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 animate-float bg-white/5 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10 relative overflow-hidden">
            {memoryData.loginImage ? (
                <img src={memoryData.loginImage} className="w-full h-full object-cover" />
            ) : (
                <PageIcon size={40} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            )}
        </div>
        <h2 className="text-3xl font-bold mb-2 font-alexandria drop-shadow-md">{memoryData.loginTitle || `رسالة خاصة`}</h2>
        <p className="mb-8 text-sm opacity-70 leading-relaxed max-w-[80%] mx-auto">{memoryData.loginDescription || "المحتوى ده سري، اكتب الباسورد عشان تفتح الهدية."}</p>
        <form onSubmit={handleSubmit}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className={`w-full p-5 text-center text-2xl font-bold tracking-[0.5em] border-2 rounded-2xl outline-none transition mb-6 bg-black/40 border-white/10 focus:border-white/40 shadow-inner ${error ? 'border-red-500 animate-shake' : ''}`} placeholder={memoryData.loginPlaceholder || "****"} autoFocus />
          <button type="submit" className="w-full py-4 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition shadow-lg backdrop-blur-md">{memoryData.loginButtonText || "فتح الرسالة ✨"}</button>
        </form>
      </div>
    </div>
  );
};

// ✅ Updated Music Player: Transparent & Vinyl Style
const MusicPlayer = ({ songUrl, title, image, isDarkMode }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);
    
    // Auto-play logic
    useEffect(() => {
        const attemptPlay = async () => {
            if (audioRef.current && songUrl) {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (e) {
                    console.log("Autoplay blocked:", e);
                }
            }
        };
        const timer = setTimeout(attemptPlay, 1000);
        return () => clearTimeout(timer);
    }, [songUrl]);

    // Handle Play/Pause
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.play().catch(e=>console.error(e));
            else audioRef.current.pause();
        }
    }, [isPlaying]);

    // Update Progress Bar
    const handleTimeUpdate = () => {
        if(audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            setProgress((current / duration) * 100);
        }
    };

    if (!songUrl) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-sm rounded-[2rem] p-3 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 animate-slide-up bg-black/30 overflow-hidden group hover:bg-black/50">
            {/* Background Blur Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 animate-pulse pointer-events-none"></div>
            
            <div className="flex items-center gap-4 relative z-10">
                {/* Rotating Album Art */}
                <div className={`w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden relative shrink-0 shadow-lg ${isPlaying ? 'animate-spin-slow' : ''}`}>
                    <img src={image || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&q=80"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-black rounded-full border border-white/30"></div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col">
                        {/* Song Title (Marquee if long) */}
                        <div className="relative overflow-hidden h-5 w-full">
                            <span className={`text-sm font-bold text-white whitespace-nowrap absolute ${isPlaying ? 'animate-marquee' : ''}`}>
                                {title || 'موسيقى الذكرى'}
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-300 flex items-center gap-1">
                            {isPlaying ? <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> : <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>}
                            {isPlaying ? 'تشغيل الآن...' : 'متوقف'}
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
                    </div>
                </div>

                <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 border border-white/10 backdrop-blur-md"
                >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
            </div>

            {/* Hidden Audio Element */}
            <audio 
                ref={audioRef} 
                src={songUrl} 
                loop 
                onTimeUpdate={handleTimeUpdate}
            />
            
            <style>{`
                @keyframes marquee { 
                    0% { transform: translateX(100%); } 
                    100% { transform: translateX(-100%); } 
                }
                .animate-marquee { animation: marquee 10s linear infinite; }
            `}</style>
        </div>
    );
};

const MemoryView = ({ data, isDarkMode }) => {
  return (
    <div className={`min-h-screen relative overflow-x-hidden pb-10 transition-colors duration-500 font-[Cairo] ${isDarkMode ? 'bg-[#050511] text-white' : 'bg-[#fff5f7] text-gray-800'}`}>
      <DynamicBackground isDarkMode={isDarkMode} type={data.backgroundAnimation || 'classic'} customColors={data.themeColors} />
      
      {/* ✅ تمرير بيانات الأغنية للمشغل الجديد */}
      <MusicPlayer 
        songUrl={data.songUrl} 
        title={data.songTitle} 
        image={data.songImage} 
        isDarkMode={isDarkMode} 
      />

      <header className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {data.coverImage ? (
             data.coverType === 'video' ? (
                 <>
                    <div className={`absolute inset-0 bg-gradient-to-b z-10 ${isDarkMode ? 'from-black/30 via-[#050511]/60 to-[#050511]' : 'from-white/10 via-[#fff5f7]/60 to-[#fff5f7]'}`}></div>
                    <video src={data.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-80" autoPlay muted loop playsInline />
                 </>
             ) : (
                 <>
                    <div className={`absolute inset-0 bg-gradient-to-b z-10 ${isDarkMode ? 'from-black/30 via-[#050511]/60 to-[#050511]' : 'from-white/10 via-[#fff5f7]/60 to-[#fff5f7]'}`}></div>
                    <img src={data.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Cover" />
                 </>
             )
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900"></div>
        )}
        
        {/* ✅ تدرج إضافي لدمج الغلاف مع الخلفية */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050511] via-transparent to-transparent z-10"></div>

        <div className="relative z-20 text-center px-4 max-w-2xl mt-20">
           {data.eventTitle && <div className="inline-block px-4 py-2 rounded-full backdrop-blur-md mb-6 border font-bold">✨ {data.eventTitle}</div>}
           <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-alexandria drop-shadow-lg">{data.recipientName}</h1>
           <p className="text-xl md:text-2xl font-light mb-8">{data.mainMessage}</p>
        </div>
      </header>
      <main className="container mx-auto px-4 relative z-20 space-y-24 -mt-20">
        {/* ✅ استخدام عنوان القسم المخصص للعداد */}
        {data.targetDate && <ScrollReveal><section><CountdownTimer targetDate={data.targetDate} isDarkMode={isDarkMode} label={data.timerLabel || data.sectionTitles?.countdown} /></section></ScrollReveal>}
        
        {/* ✅ تحسين شكل الشريط المتحرك: بدون تكرار، زجاجي */}
        {data.marquees?.length > 0 && (
            <ScrollReveal>
            <section className="relative -mx-4">
                {data.sectionTitles?.marquees && <h3 className="text-center text-xl font-bold font-alexandria mb-6 opacity-80">{data.sectionTitles.marquees}</h3>}
                {/* الخلفية الزجاجية للشريط */}
                <div className="py-6 backdrop-blur-md border-y border-white/10 bg-white/5 shadow-lg">
                    {data.marquees.map((m, i) => {
                        const Icon = ICON_LIBRARY[m.icon] || Heart;
                        return (
                            <div key={i} className="flex whitespace-nowrap overflow-hidden justify-center"> {/* Center text */}
                                <div className="flex gap-4 min-w-full px-4 items-center justify-center animate-pulse"> {/* Simple animation instead of scroll if single */}
                                    <div className="flex items-center gap-3 font-bold text-xl opacity-90 drop-shadow-md">
                                        <Icon size={24} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                        <span>{m.text}</span>
                                        <Icon size={24} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
            </ScrollReveal>
        )}
        
        {/* ✅ استخدام عنوان القسم المخصص للرسائل + تمرير الألوان للكروت */}
        {data.flipCards?.length > 0 && 
        <ScrollReveal>
        <section>
            <h2 className="text-center text-3xl font-bold font-alexandria mb-10">{data.sectionTitles?.cards || 'رسائل ليكِ ❤️'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{data.flipCards.map((card, i) => (<FlipCard key={i} iconName={card.icon} message={card.message} hint={card.hint} isDarkMode={isDarkMode} />))}</div>
        </section>
        </ScrollReveal>}
        
        {/* ✅ استخدام عنوان القسم المخصص للمعرض (يدعم الفيديو الآن) */}
        {data.photos?.length > 0 && 
        <ScrollReveal>
        <section>
            <h2 className="text-center text-3xl font-bold font-alexandria mb-10">{data.sectionTitles?.gallery || 'أجمل الذكريات 📸'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.photos.map((photo, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-3xl group hover:-translate-y-2 transition duration-300">
                        <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 relative">
                            {photo.type === 'video' ? (
                                <AutoPlayVideo src={photo.img} className="w-full h-full object-cover" />
                            ) : (
                                <img src={photo.img} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                                <p className="text-white text-sm">{photo.title}</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg mb-1">{photo.title}</h3>
                            <p className="text-sm opacity-60 leading-relaxed">{photo.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
        </ScrollReveal>}
        
        <footer className="pt-20 pb-32 text-center relative">{data.secretMessage && <div className="mb-10 animate-pulse"><p className="text-[10px] tracking-[0.5em] opacity-30 hover:opacity-100 transition duration-500 cursor-help" title="Secret Message">{data.secretMessage}</p></div>}<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold opacity-50"><Lock size={12} /> Designed with love by {data.senderName}</div></footer>
      </main>
    </div>
  );
};

const App = () => {
  const [route, setRoute] = useState('loading'); 
  const [memoryId, setMemoryId] = useState(null);
  const [memoryData, setMemoryData] = useState(null);
  const [editingMemory, setEditingMemory] = useState(null); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) { setMemoryId(id); fetchMemory(id); } else { setRoute('portfolio'); }
    document.body.className = isDarkMode ? 'dark' : 'light';

    if (typeof auth !== 'undefined') {
        signInAnonymously(auth).catch(err => console.error("Auth Error:", err));
    }
  }, [isDarkMode]);

  const fetchMemory = async (id) => {
    try {
       const docSnap = await getDoc(doc(db, "memories", id));
       if (docSnap.exists()) { setMemoryData(docSnap.data()); setRoute('viewer'); } 
       else { setRoute('portfolio'); }
    } catch { setRoute('portfolio'); }
  };

  const AdminLogin = ({ onCancel, onLogin }) => {
     const [pass, setPass] = useState('');
     return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md ${isDarkMode ? 'bg-black/80' : 'bg-white/80'}`}>
           <div className="bg-white/10 border border-white/20 p-8 rounded-3xl w-full max-w-sm text-center relative backdrop-blur-xl">
              <button onClick={onCancel} className="absolute top-4 left-4 opacity-50"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-4">لوحة المالك</h2>
              <input type="password" className="input-field mb-4 text-center" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••"/>
              <button onClick={()=>{ if(pass==='admin123') onLogin(); else alert('خطأ'); }} className="btn w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">دخول</button>
           </div>
        </div>
     );
  };

  if (route === 'loading') return <div className="h-screen flex items-center justify-center">جارِ التحميل...</div>;
  if (route === 'viewer') return isUnlocked ? <MemoryView data={memoryData} isDarkMode={isDarkMode} /> : <PasswordWall 
    memoryData={memoryData} // ✅ تمرير البيانات لصفحة الباسورد
    correctPassword={memoryData.password} 
    senderName={memoryData.senderName} 
    onUnlock={()=>setIsUnlocked(true)} 
    isDarkMode={isDarkMode} 
  />;
   
  return (
    <>
      {route === 'admin_dashboard' && <AdminDashboard isDarkMode={isDarkMode} onLogOut={()=>setRoute('portfolio')} onCreateNew={()=>{setEditingMemory(null); setRoute('admin_editor');}} onEdit={(mem) => { setEditingMemory(mem); setRoute('admin_editor'); }} />}
      {route === 'admin_editor' && <MemoryEditor isDarkMode={isDarkMode} initialData={editingMemory} onCancel={()=>setRoute('admin_dashboard')} onSave={()=>setRoute('admin_dashboard')} />}
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