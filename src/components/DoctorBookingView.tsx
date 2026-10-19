import React, { useState } from 'react';
import {
  CalendarCheck2,
  Search,
  MapPin,
  Star,
  Clock,
  Phone,
  User,
  CheckCircle2,
  Ticket,
  Calendar,
  X,
  Building2,
  Award,
  Filter,
  Check,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Doctor, Appointment, UserHealthProfile } from '../types';
import { DOCTORS_DATA } from '../data/mockDoctors';

interface DoctorBookingViewProps {
  userProfile: UserHealthProfile;
  appointments: Appointment[];
  onBookAppointment: (appointment: Appointment) => void;
  onCancelAppointment: (id: string) => void;
}

const SPECIALTIES = [
  'Barchasi',
  'Kardiolog',
  'Pulmonolog',
  'Nevropatolog',
  'Terapevt',
  'Allergolog',
  'Revmatolog',
  'Endokrinolog',
];

export const DoctorBookingView: React.FC<DoctorBookingViewProps> = ({
  userProfile,
  appointments,
  onBookAppointment,
  onCancelAppointment,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Form states for booking
  const [patientName, setPatientName] = useState(userProfile.fullName || '');
  const [patientPhone, setPatientPhone] = useState(userProfile.phone || '+998 90 123-45-67');
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [complaint, setComplaint] = useState(
    userProfile.chronicConditions.length > 0
      ? `${userProfile.chronicConditions.join(', ')} bo'yicha ko'rik va dori dozasini tekshirish`
      : 'Ob-havo o\'zgarishida qon bosimi oshishi'
  );

  // Active tickets tab vs Doctor list tab
  const [viewTab, setViewTab] = useState<'doctors' | 'my-tickets'>('doctors');

  // Filtered doctors
  const filteredDoctors = DOCTORS_DATA.filter((doc) => {
    const matchesSpec =
      selectedSpecialty === 'Barchasi' ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesSearch =
      doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  const handleOpenBooking = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSelectedTimeSlot(doc.availableSlots[0] || '10:00');
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedTimeSlot) return;

    const randomTicketNum = Math.floor(100 + Math.random() * 900);
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      ticketNumber: `SH-${randomTicketNum}`,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.fullName,
      doctorSpecialty: selectedDoctor.specialty,
      clinic: selectedDoctor.clinic,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      patientName: patientName.trim() || userProfile.fullName || 'Bemor',
      patientPhone: patientPhone.trim(),
      complaint: complaint.trim(),
      status: 'Tasdiqlangan',
      createdAt: new Date().toISOString(),
    };

    onBookAppointment(newAppointment);
    setIsBookingModalOpen(false);
    setViewTab('my-tickets');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Shifokor Qabuliga Onlayn Navbat Olish
              </h1>
              <p className="text-xs text-slate-500">
                Kasalxonaga borishdan oldin o'z shifokoringizni toping, qabul vaqtini tanlang va elektron navbat chiptasini oling!
              </p>
            </div>
          </div>

          {/* Toggle buttons between Doctors and My Tickets */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewTab('doctors')}
              className={`px-4 py-2 rounded-xl transition-all ${
                viewTab === 'doctors'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shifokorlar ro'yxati
            </button>
            <button
              onClick={() => setViewTab('my-tickets')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                viewTab === 'my-tickets'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Mening navbatlarim</span>
              {appointments.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center">
                  {appointments.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters when on Doctors tab */}
        {viewTab === 'doctors' && (
          <div className="mt-6 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Shifokor ismi, kasalxona yoki mutaxassislik bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Specialty Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {SPECIALTIES.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    selectedSpecialty === spec
                      ? 'bg-teal-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab 1: Doctors Directory */}
      {viewTab === 'doctors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Doctor Avatar & Basic info */}
                <div className="flex items-start space-x-3">
                  <img
                    src={doc.avatar}
                    alt={doc.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-100 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {doc.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                      {doc.fullName}
                    </h3>
                    <p className="text-xs text-teal-800 font-medium">{doc.specialty}</p>
                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                        {doc.rating}
                      </span>
                      <span>• {doc.experienceYears} yil tajriba</span>
                      <span>({doc.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Clinic & Address */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800">{doc.clinic}</span>
                  </div>
                  <div className="flex items-start space-x-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{doc.address}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {doc.workDays}: {doc.workHours}
                    </span>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="mt-3 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {doc.bio}
                </p>

                {/* Available slots */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Yaqin bo'sh vaqtlar:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {doc.availableSlots.slice(0, 4).map((slot) => (
                      <span
                        key={slot}
                        className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-700"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Book Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Qabul narxi:</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {doc.consultationFee.toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <CalendarCheck2 className="w-3.5 h-3.5" />
                  <span>Onlayn navbat olish</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: My Active Tickets */}
      {viewTab === 'my-tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Sizning Elektron Navbat Chiptalaringiz ({appointments.length})
              </h2>
              <p className="text-xs text-slate-500">
                Kasalxonaga borganda ushbu chipta raqamini ko'rsatishingiz kifoya
              </p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">
                Hozircha olingan navbat chiptalari yo'q
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Shifokorlar ro'yxatidan o'zingizga ma'qul mutaxassisni tanlang va qabulga navbat oling.
              </p>
              <button
                onClick={() => setViewTab('doctors')}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Shifokorlarni ko'rish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-3xl border-2 border-teal-200 shadow-md overflow-hidden flex flex-col justify-between"
                >
                  {/* Ticket Header styled like an official boarding/clinic pass */}
                  <div className="bg-gradient-to-r from-teal-700 to-cyan-700 p-5 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-teal-200 font-bold block">
                        Elektron Navbat Chiptasi
                      </span>
                      <h3 className="text-xl font-black tracking-tight">{apt.ticketNumber}</h3>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 border border-white/30 text-white">
                        {apt.status}
                      </span>
                      <p className="text-[10px] text-teal-200 mt-1">Sana: {apt.date}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Shifokor va Kasalxona:
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {apt.doctorName}
                      </h4>
                      <p className="text-teal-700 font-semibold">{apt.doctorSpecialty}</p>
                      <p className="text-slate-600 mt-0.5">{apt.clinic}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">
                          QABUL VAQTI:
                        </span>
                        <span className="text-sm font-black text-slate-900">{apt.timeSlot}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">
                          BEMOR:
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate block">
                          {apt.patientName}
                        </span>
                      </div>
                    </div>

                    {apt.complaint && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                        <span className="font-bold">Shikoyat: </span>
                        {apt.complaint}
                      </div>
                    )}

                    {/* Medical memo */}
                    <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200 text-[11px] text-teal-900 flex items-start space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span>
                        Eslatma: Qabulga borishdan oldin ilovaga yuklangan tahlillaringizni shifokorga ko'rsatishingiz mumkin.
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onCancelAppointment(apt.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold"
                    >
                      Navbatni bekor qilish
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Ro'yxatga olindi: {new Date(apt.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 p-5 text-white relative">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                Onlayn qabulga yozilish
              </span>
              <h3 className="text-base font-bold mt-1">{selectedDoctor.fullName}</h3>
              <p className="text-xs text-teal-100">{selectedDoctor.specialty} • {selectedDoctor.clinic}</p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bemorning F.I.Sh:
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Telefon raqam:
                  </label>
                  <input
                    type="text"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Qabul sanasi:
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Bo'sh vaqt oralig'ini tanlang:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedDoctor.availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2 rounded-xl border font-bold text-center transition-all ${
                        selectedTimeSlot === slot
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complaint */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Asosiy shikoyatingiz va kasallik sababi:
                </label>
                <textarea
                  rows={2}
                  required
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Fee notice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Qabul narxi:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedDoctor.consultationFee.toLocaleString('uz-UZ')} so'm
                </span>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Navbat chiptasini olish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
