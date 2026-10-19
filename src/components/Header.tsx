import React from 'react';
import {
  CloudLightning,
  HeartPulse,
  FileText,
  ScanLine,
  UserCheck,
  CalendarCheck2,
  MapPin,
  BellRing,
  Layers,
} from 'lucide-react';
import { UserHealthProfile, WeatherData } from '../types';
import { CITIES_UZB } from '../services/api';

interface HeaderProps {
  activeTab: 'weather' | 'records' | 'scanner' | 'optimizer' | 'doctors' | 'profile';
  setActiveTab: (tab: 'weather' | 'records' | 'scanner' | 'optimizer' | 'doctors' | 'profile') => void;
  userProfile: UserHealthProfile;
  weatherData: WeatherData | null;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onOpenProfileModal: () => void;
  hasSevereAlert?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  weatherData,
  selectedCity,
  setSelectedCity,
  onOpenProfileModal,
  hasSevereAlert = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('weather')}>
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                <CloudLightning className="w-2.5 h-2.5 text-amber-900" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-700 via-cyan-800 to-slate-900 bg-clip-text text-transparent">
                  ShifoHavo
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Meteo-Tibbiyot
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Ob-havo ogohlantirishlari va shaxsiy salomatlik qalqoni
              </p>
            </div>
          </div>

          {/* Quick Weather & City Picker */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                {Object.keys(CITIES_UZB).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {weatherData && (
                <span className="font-bold text-slate-900 border-l border-slate-300 pl-2">
                  {weatherData.temperature > 0 ? `+${weatherData.temperature}` : weatherData.temperature}°C
                </span>
              )}
            </div>

            {/* Profile Status Badge */}
            <button
              onClick={onOpenProfileModal}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                userProfile.chronicConditions.length > 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {userProfile.chronicConditions.length > 0
                  ? `${userProfile.chronicConditions.length} ta tashxis kiritilgan`
                  : 'Kasalliklarni kiritish'}
              </span>
              <span className="md:hidden">Profil</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'weather'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CloudLightning className="w-4 h-4" />
            <span>Ob-havo & Ogohlantirish</span>
            {hasSevereAlert && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'records'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tahlillar & Retseptlar</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'scanner'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>1 ta dori skaneri</span>
          </button>

          <button
            onClick={() => setActiveTab('optimizer')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'optimizer'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>5 dori → 2 dori (Smart Konsilium)</span>
            <span className="text-[10px] bg-amber-400 text-amber-950 font-bold px-1.5 py-0.2 rounded-full ml-1">
              Yangi
            </span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'doctors'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Shifokorga Navbat</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Salomatlik Pasporti</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
