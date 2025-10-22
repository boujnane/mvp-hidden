/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Accordion from "@radix-ui/react-accordion";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Select from "@radix-ui/react-select";
import { Send, AlertTriangle, Trash2, Edit3, Search, Calendar, MapPin, Bell, ChevronDown, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { createChat } from "@/lib/useCreateChat";
import { useAuth } from "@/lib/FirbaseAuthProvider";

type Annonce = {
  id: string;
  organisation: string;
  titre: string;
  description: string;
  profil: string;
  offre: string;
  recherche: string;
  contact: string;
  location?: string;
  urgent?: boolean;
  date: string;
  createdAt: string;
  ownerId: string;
};

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [expandedForm, setExpandedForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [queryStr, setQueryStr] = useState("");
  const [filterUrgent, setFilterUrgent] = useState<"all" | "only" | "no">("all");
  const [filterLocation, setFilterLocation] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "date_asc" | "date_desc">("newest");

  const emptyForm = {
    organisation: "",
    titre: "",
    description: "",
    profil: "",
    offre: "",
    recherche: "",
    contact: "",
    location: "",
    urgent: false,
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
  };

  const [form, setForm] = useState(emptyForm);
  const router = useRouter();
  const currentUserId = auth.currentUser?.uid || "";

  // --- Lecture Firestore en temps réel ---
  useEffect(() => {
    const q = query(collection(db, "annonces"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Annonce[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as Annonce));
      setAnnonces(data);
    });

    return () => unsubscribe();
  }, []);

  // --- Gestion formulaire ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);

    if (!form.titre || !form.organisation) {
      alert("Merci de renseigner au minimum le titre et le nom de l'organisation.");
      setSubmitting(false);
      return;
    }

    const newAnnonce = {
      organisation: form.organisation,
      titre: form.titre,
      description: form.description,
      profil: form.profil,
      offre: form.offre,
      recherche: form.recherche,
      contact: form.contact,
      location: form.location,
      urgent: !!form.urgent,
      date: new Date(form.date).toISOString(),
      createdAt: new Date().toISOString(),
      ownerId: currentUserId,
    };

    try {
      if (editingId) {
        const docRef = doc(db, "annonces", editingId);
        await updateDoc(docRef, newAnnonce);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "annonces"), newAnnonce);
      }
      setForm(emptyForm);
      setExpandedForm(false);
    } catch (error) {
      console.error("Erreur lors de la publication :", error);
      alert("Erreur lors de la publication. Réessayez.");
    }

    setSubmitting(false);
  };

  // --- Supprimer ---
  const removeAnnonce = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await deleteDoc(doc(db, "annonces", id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression. Réessayez.");
    }
  };

  const { user } = useAuth();
  const handleRespond = async (annonceOwnerId: string) => {
    if (!user) return;
  
    // Crée toujours un nouveau chat entre l'utilisateur et le créateur de l'annonce
    const chatId = await createChat([user.uid, annonceOwnerId]);
  
    // Redirige vers le chat
    router.push(`/messages/${chatId}`);
  };

  
  // --- Editer ---
  const editAnnonce = (id: string) => {
    const target = annonces.find((a) => a.id === id);
    if (!target) return;
    setForm({
      organisation: target.organisation,
      titre: target.titre,
      description: target.description,
      profil: target.profil,
      offre: target.offre,
      recherche: target.recherche,
      contact: target.contact,
      location: target.location || "",
      urgent: !!target.urgent,
      date: target.date.slice(0, 10),
    });
    setExpandedForm(true);
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Filtrage et tri ---
  const clearFilters = () => {
    setQueryStr("");
    setFilterUrgent("all");
    setFilterLocation("");
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
  };

  const filtered = useMemo(() => {
    let list = [...annonces];
    if (queryStr.trim()) {
      const q = queryStr.toLowerCase();
      list = list.filter(
        (a) =>
          a.titre.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.organisation.toLowerCase().includes(q) ||
          (a.profil || "").toLowerCase().includes(q) ||
          (a.location || "").toLowerCase().includes(q)
      );
    }
    if (filterUrgent === "only") list = list.filter((a) => a.urgent);
    if (filterUrgent === "no") list = list.filter((a) => !a.urgent);
    if (filterLocation.trim()) list = list.filter((a) => (a.location || "").toLowerCase().includes(filterLocation.toLowerCase()));
    if (dateFrom) list = list.filter((a) => new Date(a.date) >= new Date(dateFrom));
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((a) => new Date(a.date) <= to);
    }

    if (sortBy === "newest") list.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    else if (sortBy === "oldest") list.sort((x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime());
    else if (sortBy === "date_asc") list.sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());
    else list.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());

    return list;
  }, [annonces, queryStr, filterUrgent, filterLocation, dateFrom, dateTo, sortBy]);

  const stats = useMemo(() => ({
    total: annonces.length,
    urgent: annonces.filter((a) => a.urgent).length,
    upcoming: annonces.filter((a) => new Date(a.date) >= new Date()).length,
  }), [annonces]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/15 to-indigo-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 max-w-7xl py-12">
            <div className="mb-6">
              <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                <ChevronLeft size={18} />
                <span>Retour</span>
              </button>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">Annonces</h1>
                <p className="text-gray-600">Publiez, filtrez et gérez les annonces — connectez les talents rapidement.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center bg-white/70 backdrop-blur-sm rounded-full px-3 py-1 border border-gray-100 shadow-sm">
                  <Search size={16} className="text-gray-500" />
                  <input
                    value={queryStr}
                    onChange={(e) => setQueryStr(e.target.value)}
                    placeholder="Rechercher titres, organisations, profils..."
                    className="ml-2 w-52 placeholder:italic bg-transparent focus:outline-none text-sm"
                  />
                </div>

                <button
                  onClick={() => setExpandedForm((s) => !s)}
                  aria-expanded={expandedForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:scale-[1.02] transition-transform
                             lg:bg-gradient-to-br lg:from-blue-600 lg:to-purple-600"
                >
                  <Send size={16} />
                  {expandedForm ? "Fermer" : "Nouvelle annonce"}
                </button>
              </div>
            </div>

            {/* Stats & Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/90 rounded-2xl shadow p-4 flex justify-between items-center gap-4">
                <div>
                  <div className="text-sm text-gray-500">Annonces totales</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 flex items-center gap-1"><Bell size={14}/> Urgentes</div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.urgent}</div>
                </div>
               
                <div>
                  <div className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14}/> À venir</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
                </div>
              </div>

              {/* Filtres */}
              <div className="bg-white/90 rounded-2xl shadow p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Filtres</span>
                  <button onClick={clearFilters} className="text-xs text-gray-500 hover:underline">Réinitialiser</button>
                </div>

                <ToggleGroup.Root type="single" className="flex gap-2" value={filterUrgent} onValueChange={(v: any) => setFilterUrgent(v)}>
                  <ToggleGroup.Item value="all" className={`px-3 py-1 rounded-full text-sm ${filterUrgent==="all"?"bg-blue-600 text-white":"bg-gray-100 text-gray-700"}`}>Toutes</ToggleGroup.Item>
                  <ToggleGroup.Item value="only" className={`px-3 py-1 rounded-full text-sm ${filterUrgent==="only"?"bg-blue-600 text-white":"bg-gray-100 text-gray-700"}`}>Urgentes</ToggleGroup.Item>
                  <ToggleGroup.Item value="no" className={`px-3 py-1 rounded-full text-sm ${filterUrgent==="no"?"bg-blue-600 text-white":"bg-gray-100 text-gray-700"}`}>Non urgentes</ToggleGroup.Item>
                </ToggleGroup.Root>

                <input value={filterLocation} onChange={(e)=>setFilterLocation(e.target.value)} placeholder="Localisation..." className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />

                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
                  />
                </div>


                <Select.Root value={sortBy} onValueChange={(v)=>setSortBy(v as any)}>
                  <Select.Trigger className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm flex justify-between items-center">
                    Trier
                  </Select.Trigger>
                  <Select.Content className="bg-white rounded-xl shadow">
                    <Select.Item value="newest" className="px-4 py-2 cursor-pointer hover:bg-gray-100">Ajoutés — plus récents</Select.Item>
                    <Select.Item value="oldest" className="px-4 py-2 cursor-pointer hover:bg-gray-100">Ajoutés — plus anciens</Select.Item>
                    <Select.Item value="date_desc" className="px-4 py-2 cursor-pointer hover:bg-gray-100">Date — décroissante</Select.Item>
                    <Select.Item value="date_asc" className="px-4 py-2 cursor-pointer hover:bg-gray-100">Date — croissante</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
            </div>

            {/* Formulaire collapsible */}
            <Collapsible.Root open={expandedForm} onOpenChange={setExpandedForm}>
              <Collapsible.Content className="overflow-hidden transition-all duration-300 mt-6">
                <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-2xl p-8 mb-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
                      <input
                        name="organisation"
                        value={form.organisation}
                        onChange={handleChange}
                        placeholder="Ex: Studio Nova"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                      <input
                        name="titre"
                        value={form.titre}
                        onChange={handleChange}
                        placeholder="Ex: Recherche Artiste / Prestataire"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Décrivez le projet..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profil recherché</label>
                      <input
                        name="profil"
                        value={form.profil}
                        onChange={handleChange}
                        placeholder="Ex: Illustrateurs, photographes..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                      <input
                        name="contact"
                        value={form.contact}
                        onChange={handleChange}
                        placeholder="Email / chat / téléphone"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Ville, Pays (optionnel)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2 text-sm text-gray-900 mb-2">
                        <input
                          type="checkbox"
                          name="urgent"
                          checked={form.urgent}
                          onChange={handleChange}
                          className="accent-yellow-500"
                        />
                        <span>Annonce urgente</span>
                      </label>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date limite / évènement</label>
                      <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => { setForm(emptyForm); setExpandedForm(false); }}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white
                                   lg:bg-gradient-to-br lg:from-blue-600 lg:to-purple-600"
                      >
                        <Send size={16}/> {submitting ? "Publication..." : "Publier l'annonce"}
                      </button>
                    </div>
                  </div>
                </form>
              </Collapsible.Content>
            </Collapsible.Root>

            {/* Liste annonces */}
            {filtered.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 text-center text-gray-600">
                <AlertTriangle size={36} className="mx-auto mb-3 text-yellow-600"/>
                <div className="font-semibold">Aucune annonce trouvée</div>
                <div className="text-sm mt-1">Essayez d&apos;enlever les filtres ou d&apos;ajuster votre recherche.</div>
              </div>
            ) : (
              <Accordion.Root type="multiple" className="space-y-4">
                {filtered.map((a) => (
                  <Accordion.Item
                    key={a.id}
                    value={a.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-md overflow-hidden"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="w-full flex justify-between items-center p-4 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-semibold
                                           ${a.urgent ? "bg-yellow-600" : "bg-blue-600 lg:bg-gradient-to-br lg:from-blue-600 lg:to-purple-600"}`}>
                            {initials(a.organisation)}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">{a.titre}</h4>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1 flex flex-wrap items-start gap-1">
                              <span className="font-medium text-gray-700">{a.organisation}</span>
                              {a.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} className="inline" /> {a.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {a.urgent && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                              <Bell size={14}/> Urgent
                            </span>
                          )}
                          <ChevronDown className="transition-transform data-[state=open]:rotate-180" size={20} />
                        </div>
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="px-3 sm:px-4 pb-3 sm:pb-4 text-gray-700 text-sm sm:text-base">
                      <p className="mb-2 sm:mb-3">{a.description}</p>
                      <div className="grid md:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-3">
                        <div><span className="font-medium">Profil recherché:</span> {a.profil}</div>
                        <div><span className="font-medium">Offre:</span> {a.offre}</div>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                        <div className="text-xs sm:text-sm text-gray-500">Contact: {a.contact}</div>
                        <div className="flex justify-end gap-2 mt-1 sm:mt-0 w-full">
                          {a.ownerId === currentUserId ? (
                            <>
                              <button
                                onClick={() => editAnnonce(a.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 sm:px-3 sm:py-2 rounded-xl bg-gray-100 text-gray-700 hover:scale-[1.02] transition-transform text-xs sm:text-sm"
                              >
                                <Edit3 size={12} /> Modifier
                              </button>
                              <button
                                onClick={() => removeAnnonce(a.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 sm:px-3 sm:py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs sm:text-sm"
                              >
                                <Trash2 size={12} /> Supprimer
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRespond(a.ownerId)}
                              className="inline-flex items-center gap-1 px-3 py-1 sm:px-3 sm:py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs sm:text-sm"
                            >
                              Répondre
                            </button>
                          )}
                        </div>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function initials(name?: string) {
  if (!name) return "H";
  return name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
}
