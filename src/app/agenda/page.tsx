"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation"; 
import {
  Calendar,
  Clock,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
} from "lucide-react";
import { format, addDays, subDays, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import ProtectedRoute from "@/lib/ProtectedRoute";

type Reservation = {
  id: string;
  title: string;
  date: string; // ISO
  startTime: string;
  endTime: string;
  location?: string;
  relatedAnnonce?: string;
  status: "confirmée" | "en attente" | "annulée" | "indisponible";
};

type ViewType = "mois" | "semaine" | "année";

const mockReservations: Reservation[] = [
  { id: "1", title: "Shooting photo à Bonapriso", date: "2025-10-23", startTime: "10:00", endTime: "12:00", location: "Douala, Bonapriso", relatedAnnonce: "Séance photo professionnelle", status: "confirmée" },
  { id: "2", title: "Visite appartement T2", date: "2025-10-24", startTime: "15:00", endTime: "16:00", location: "Yaoundé, Bastos", relatedAnnonce: "Appartement T2 meublé", status: "en attente" },
  { id: "3", title: "Indisponible - week-end", date: "2025-10-26", startTime: "00:00", endTime: "23:59", status: "indisponible" },
];

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("mois");
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const router = useRouter();

  const dayString = format(selectedDate, "EEEE d MMMM yyyy", { locale: fr });
  const dayReservations = reservations.filter(r => r.date === format(selectedDate, "yyyy-MM-dd"));

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handleSaveReservation = (res: Reservation) => {
    setReservations(prev => {
      const exists = prev.find(r => r.id === res.id);
      if (exists) return prev.map(r => (r.id === res.id ? res : r));
      return [...prev, res];
    });
    setDialogOpen(false);
    setEditingReservation(null);
  };

  const handleDeleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* HEADER */}
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition">
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="text-indigo-600" /> Mon Agenda
              </h1>
            </div>

            <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Trigger asChild>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:scale-[1.03] transition">
                  <PlusCircle size={16} /> Nouvelle réservation
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-2xl p-6 w-full max-w-md shadow-lg">
                  <Dialog.Title className="text-lg font-semibold mb-4 text-gray-800">
                    {editingReservation ? "Modifier la réservation" : "Nouvelle réservation"}
                  </Dialog.Title>
                  <ReservationForm reservation={editingReservation} onSave={handleSaveReservation} onCancel={() => { setDialogOpen(false); setEditingReservation(null); }} />
                  <Dialog.Close className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={20} />
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </header>

          {/* Tabs Radix */}
          <Tabs.Root value={view} onValueChange={(val) => setView(val as ViewType)}>
            <Tabs.List className="flex gap-3 mb-6 border-b border-gray-200">
              {["mois", "semaine", "année"].map((tab) => (
                <Tabs.Trigger
                  key={tab}
                  value={tab}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                    view === tab ? "bg-white text-indigo-700 border border-b-0 border-gray-200" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "mois" ? "Vue mensuelle" : tab === "semaine" ? "Vue hebdomadaire" : "Vue annuelle"}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* --- Vue JOUR --- */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeft size={18} />
                </button>
                <h2 className="text-lg font-medium text-gray-700 capitalize">{dayString}</h2>
                <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRight size={18} />
                </button>
              </div>

              {dayReservations.length === 0 ? (
                <div className="text-center text-gray-500 bg-white/70 backdrop-blur-md rounded-2xl p-10 border border-gray-100">
                  Aucune réservation pour cette date.
                </div>
              ) : (
                <div className="space-y-4">
                  {dayReservations.map((r) => (
                    <div key={r.id} className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">{r.title}</h3>
                        {r.relatedAnnonce && <p className="text-sm text-indigo-600 font-medium">{r.relatedAnnonce}</p>}
                        <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                          <Clock size={14} />
                          <span>{r.startTime} – {r.endTime}</span>
                          {r.location && (<><MapPin size={14} /><span>{r.location}</span></>)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          r.status === "confirmée" ? "bg-green-100 text-green-700" :
                          r.status === "en attente" ? "bg-yellow-100 text-yellow-700" :
                          r.status === "annulée" ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-700"
                        }`}>{r.status}</span>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingReservation(r); setDialogOpen(true); }} className="text-indigo-600 text-xs hover:underline">Modifier</button>
                          <button onClick={() => handleDeleteReservation(r.id)} className="text-red-600 text-xs hover:underline">Supprimer</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* --- Vue MENSUELLE --- */}
            <Tabs.Content value="mois">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Aperçu du mois</h3>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const day = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
                    const res = reservations.find(r => r.date === format(day, "yyyy-MM-dd"));
                    return (
                      <button key={i} onClick={() => setSelectedDate(day)} className={`aspect-square rounded-lg flex items-center justify-center ${
                        format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                          ? "bg-indigo-600 text-white font-semibold"
                          : res?.status === "indisponible"
                          ? "bg-gray-400 text-white"
                          : res
                          ? "bg-indigo-100 text-indigo-700 font-medium"
                          : "bg-white/70 text-gray-600"
                      } hover:scale-[1.05] transition`}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Tabs.Content>

            {/* --- Vue HEBDOMADAIRE --- */}
            <Tabs.Content value="semaine">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Vue de la semaine</h3>
              <div className="grid grid-cols-7 gap-3">
                {weekDays.map((day, idx) => {
                  const dayRes = reservations.filter(r => r.date === format(day, "yyyy-MM-dd"));
                  return (
                    <div key={idx} className={`p-3 rounded-xl border border-gray-100 flex flex-col items-center ${
                      dayRes.some(r => r.status === "indisponible") ? "bg-gray-200" : "bg-white/80"
                    }`}>
                      <span className="text-sm font-semibold text-indigo-600">{format(day, "EEE d", { locale: fr })}</span>
                      {dayRes.length > 0 ? dayRes.map(r => (
                        <div key={r.id} className={`text-xs mt-2 px-2 py-1 rounded-full ${
                          r.status === "confirmée" ? "bg-green-50 text-green-700" :
                          r.status === "en attente" ? "bg-yellow-50 text-yellow-700" :
                          r.status === "annulée" ? "bg-red-50 text-red-700" : "bg-gray-400 text-white"
                        }`}>{r.title}</div>
                      )) : <span className="text-xs text-gray-400 mt-2">Libre</span>}
                    </div>
                  );
                })}
              </div>
            </Tabs.Content>

            {/* --- Vue ANNUELLE --- */}
            <Tabs.Content value="année">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Vue annuelle</h3>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white/80 rounded-xl border border-gray-100 p-4 flex flex-col items-center">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-2">{format(new Date(2025, i), "MMMM", { locale: fr })}</h4>
                    <span className="text-xs text-gray-500">
                      {reservations.filter(r => new Date(r.date).getMonth() === i).length} réservation(s)
                    </span>
                  </div>
                ))}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// --- Formulaire réservation
function ReservationForm({ reservation, onSave, onCancel }: { reservation: Reservation | null; onSave: (res: Reservation) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(reservation?.title || "");
  const [date, setDate] = useState(reservation?.date || format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(reservation?.startTime || "09:00");
  const [endTime, setEndTime] = useState(reservation?.endTime || "10:00");
  const [status, setStatus] = useState<Reservation["status"]>(reservation?.status || "confirmée");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: reservation?.id || Date.now().toString(), title, date, startTime, endTime, status });
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Titre</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1" required />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Début</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fin</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Statut</label>
        <select value={status} onChange={e => setStatus(e.target.value as Reservation["status"])} className="w-full border border-gray-300 rounded-md px-2 py-1">
          <option value="confirmée">Confirmée</option>
          <option value="en attente">En attente</option>
          <option value="annulée">Annulée</option>
          <option value="indisponible">Indisponible</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100">Annuler</button>
        <button type="submit" className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Enregistrer</button>
      </div>
    </form>
  );
}
