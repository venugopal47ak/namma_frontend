import {
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  History,
  ChevronRight
} from "lucide-react";


import { useEffect, useState } from "react";
import api from "../api/http";
import FallbackImage, { imageFallbacks } from "../components/common/FallbackImage";
import SectionHeader from "../components/common/SectionHeader";
import LocationMapModal from "../components/layout/LocationMapModal";
import { useAuth } from "../context/AuthContext";

const ProfileSettingsPage = () => {
  const { user, setUser, logout } = useAuth();

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);


  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [showMap, setShowMap] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    area: "",
    bio: "",
    headline: "",
    experienceYears: "",
    startingPrice: "",
    whatsappNumber: "",
    addressText: "",
    location: { lat: 12.9716, lng: 77.5946 }
  });

  const [files, setFiles] = useState({
    avatar: null,
    coverImage: null
  });

  const [previews, setPreviews] = useState({
    avatar: "",
    coverImage: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/auth/me");
        const userData = data.user;
        
        if (userData.strikes > 0 || userData.warnings > 0) {
          const historyRes = await api.get("/bookings/action-history");
          setHistory(historyRes.data?.history || []);
          
          if (userData.hasUnreadAction) {
            await api.post("/bookings/acknowledge-action");
            setUser({ ...userData, hasUnreadAction: false });
          }
        }


        setFormData({
          name: userData.name || "",
          phone: userData.phone || "",
          email: userData.email || "",
          city: userData.city || "",
          area: userData.area || "",
          bio: userData.providerProfile?.bio || "",
          headline: userData.providerProfile?.headline || "",
          experienceYears: userData.providerProfile?.experienceYears || "",
          startingPrice: userData.providerProfile?.startingPrice || "",
          whatsappNumber: userData.providerProfile?.whatsappNumber || userData.phone || "",
          addressText: userData.providerProfile?.addressText || "",
          location: userData.providerProfile?.location?.coordinates 
            ? { lng: userData.providerProfile.location.coordinates[0], lat: userData.providerProfile.location.coordinates[1] }
            : { lat: 12.9716, lng: 77.5946 }
        });

        setPreviews({
          avatar: userData.avatar || "",
          coverImage: userData.providerProfile?.coverImage || ""
        });
      } catch (error) {
        setFeedback({ type: "error", text: "Failed to load profile data." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      setFiles((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleLocationSelect = (loc) => {
    setFormData((prev) => ({
      ...prev,
      location: { lat: loc.lat, lng: loc.lng },
      area: loc.displayAddress?.split(",")[0] || prev.area
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", text: "" });

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("phone", formData.phone);
      form.append("city", formData.city);
      form.append("area", formData.area);

      if (files.avatar) {
        form.append("avatar", files.avatar);
      }

      // Update basic user info
      const { data: userData } = await api.put("/auth/profile", form);
      
      // If provider, update provider info
      if (user?.role === "PROVIDER") {
        const providerForm = new FormData();
        providerForm.append("headline", formData.headline);
        providerForm.append("bio", formData.bio);
        providerForm.append("experienceYears", formData.experienceYears);
        providerForm.append("startingPrice", formData.startingPrice);
        providerForm.append("whatsappNumber", formData.whatsappNumber);
        providerForm.append("addressText", formData.addressText);
        providerForm.append("city", formData.city);
        providerForm.append("area", formData.area);
        providerForm.append("location", JSON.stringify(formData.location));

        if (files.coverImage) {
          providerForm.append("coverImage", files.coverImage);
        }

        await api.post("/providers/me", providerForm);
      }

      setFeedback({ type: "success", text: "Profile updated successfully!" });
      setUser(userData.user);
    } catch (error) {
      setFeedback({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to update profile." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="section-shell space-y-10 py-10">
      <SectionHeader
        eyebrow="Settings"
        title="Account & Profile Settings"
        description="Update your personal information, contact details, and professional profile."
      />

      {feedback.text && (
        <div
          className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 ${
            feedback.type === "error"
              ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
          }`}
        >
          {feedback.type === "success" && <CheckCircle2 size={18} />}
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-8">
          {(user?.strikes > 0 || user?.warnings > 0) && (
            <section className="glass-card space-y-6 rounded-[36px] border-rose-100 bg-rose-50/30 p-8 dark:border-rose-500/10 dark:bg-rose-500/5">
              <div className="flex items-center gap-3 border-b border-rose-100 pb-5 dark:border-white/5">
                <ShieldAlert className="text-rose-600" size={20} />
                <h3 className="font-display text-xl font-bold text-rose-900 dark:text-rose-100">Platform Reputation</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="rounded-2xl bg-white px-6 py-4 shadow-sm dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Strikes</p>
                  <p className="mt-1 text-2xl font-black text-rose-600">{user?.strikes}</p>
                </div>
                <div className="rounded-2xl bg-white px-6 py-4 shadow-sm dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Warnings</p>
                  <p className="mt-1 text-2xl font-black text-amber-500">{user?.warnings}</p>
                </div>
                <div className="flex-1 rounded-2xl bg-white/50 px-6 py-4 dark:bg-black/20">
                  <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                    {(user?.strikes || 0) > 0 
                      ? "Your account has received strikes due to reported issues. Receiving 3 strikes will result in automatic account deactivation."
                      : "You have received formal warnings. Please ensure professional behavior to avoid strikes."}
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="mt-3 flex items-center gap-2 text-xs font-bold text-rose-600 hover:underline"
                  >
                    <History size={14} />
                    {showHistory ? "Hide Details" : "View Action History"}
                  </button>
                </div>
              </div>

              {showHistory && history.length > 0 && (
                <div className="mt-6 space-y-4 border-t border-rose-100 pt-6 dark:border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-rose-800 dark:text-rose-400">Detailed Action History</h4>
                  <div className="grid gap-3">
                    {history.map((item) => (
                      <div key={item._id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${
                                item.complaint.adminAction === "STRIKE" ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
                              }`}>
                                {item.complaint.adminAction}
                              </span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {item.service?.title}
                              </span>
                            </div>
                            <p className="mt-2 text-sm italic text-slate-600 dark:text-slate-400">
                              "{item.complaint.adminNote || "No specific note provided."}"
                            </p>
                            <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase">
                              Reported by {item.provider?.user?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}


          {/* Basic Information */}

          <section className="glass-card space-y-6 rounded-[36px] p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-white/5">
              <UserIcon className="text-coral" size={20} />
              <h3 className="font-display text-xl font-bold">Basic Information</h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={formData.email}
                    disabled
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-500 outline-none dark:border-white/5 dark:bg-white/5 dark:text-slate-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Provider Specific Information */}
          {user?.role === "PROVIDER" && (
            <section className="glass-card space-y-6 rounded-[36px] p-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-white/5">
                <ImageIcon className="text-coral" size={20} />
                <h3 className="font-display text-xl font-bold">Professional Profile</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Professional Headline
                  </label>
                  <input
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    placeholder="e.g. Expert AC Technician with 10 years experience"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Starting Price (₹)
                    </label>
                    <input
                      type="number"
                      name="startingPrice"
                      value={formData.startingPrice}
                      onChange={handleInputChange}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Professional Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                    placeholder="Tell customers about your skills, quality of work, and reliability..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    WhatsApp Number (for bookings)
                  </label>
                  <input
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Location Information */}
          <section className="glass-card space-y-6 rounded-[36px] p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-white/5">
              <MapPin className="text-coral" size={20} />
              <h3 className="font-display text-xl font-bold">Location & Address</h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  City
                </label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Area
                </label>
                <div className="flex gap-2">
                  <input
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    required
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-coral/10 text-coral transition hover:bg-coral hover:text-white"
                  >
                    <MapPin size={20} />
                  </button>
                </div>
              </div>
              {user?.role === "PROVIDER" && (
                <div className="col-span-full space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Full Address (Private)
                  </label>
                  <input
                    name="addressText"
                    value={formData.addressText}
                    onChange={handleInputChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar - Photos & Actions */}
        <aside className="space-y-8">
          <section className="glass-card space-y-6 rounded-[36px] p-6">
            <h3 className="font-display text-lg font-bold">Profile Photo</h3>
            <div className="group relative mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-soft dark:border-slate-800">
              <FallbackImage
                src={previews.avatar}
                fallbackSrc={imageFallbacks.avatar}
                className="h-full w-full object-cover"
              />
              <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={24} />
                <span className="mt-1 text-xs font-bold uppercase tracking-wider">Change</span>
                <input
                  type="file"
                  name="avatar"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-center text-xs text-slate-500">
              Use a clear, high-quality profile picture to build trust with customers.
            </p>
          </section>

          {user?.role === "PROVIDER" && (
            <section className="glass-card space-y-6 rounded-[36px] p-6">
              <h3 className="font-display text-lg font-bold">Cover Banner</h3>
              <div className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5">
                <FallbackImage
                  src={previews.coverImage}
                  fallbackSrc={imageFallbacks.banner}
                  className="h-full w-full object-cover"
                />
                <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera size={24} />
                  <span className="mt-1 text-xs font-bold uppercase tracking-wider">Change Banner</span>
                  <input
                    type="file"
                    name="coverImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500">
                This banner appears at the top of your profile page.
              </p>
            </section>
          )}

          <div className="sticky top-28 space-y-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-ink font-bold text-white shadow-soft transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 dark:bg-white dark:text-slate-900"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {submitting ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-rose-100 font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/10 dark:hover:bg-rose-500/5"
            >
              <LogOut size={20} />
              Logout
            </button>
            <p className="px-4 text-center text-xs text-slate-500">
              Updating your profile will reflect immediately across the platform.
            </p>
          </div>
        </aside>

      </form>

      {showMap && (
        <LocationMapModal
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          onSelect={handleLocationSelect}
          initialLocation={formData.location}
        />
      )}
    </div>
  );
};

export default ProfileSettingsPage;
