import { LoaderCircle, ShieldCheck, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/http";
import { useAuth } from "../context/AuthContext";
import { fallbackServices, locations as locationOptions } from "../data/fallbackData";

const defaultLocation = locationOptions[0];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  city: defaultLocation.city,
  area: defaultLocation.area,
  startingPrice: "249"
};

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("USER");
  const [form, setForm] = useState(initialForm);
  const [selectedCategories, setSelectedCategories] = useState(["Electrician"]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const file = files?.[0];
    if (!file) return;

    if (name === "avatar") {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else if (name === "coverImage") {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };


  const categories = useMemo(
    () => [...new Set(fallbackServices.map((service) => service.category))],
    []
  );
  const cities = useMemo(
    () => [...new Set(locationOptions.map((item) => item.city))],
    []
  );
  const areaOptions = useMemo(
    () => locationOptions.filter((item) => item.city === form.city),
    [form.city]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => {
      if (name === "city") {
        const nextArea =
          locationOptions.find((item) => item.city === value)?.area || current.area;

        return {
          ...current,
          city: value,
          area: nextArea
        };
      }

      return {
        ...current,
        [name]: value
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    if (mode === "register" && (!form.name || !form.email || !form.phone || !form.password)) {
      setError("All fields are required");
      setSubmitting(false);
      return;
    }

    if (mode === "register" && role === "PROVIDER" && !selectedCategories.length) {
      setError("Select at least one service to create a provider account.");
      setSubmitting(false);
      return;
    }

    try {
      let payload;
      
      if (mode === "login") {
        payload = { email: form.email, password: form.password };
      } else {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("phone", form.phone);
        formData.append("password", form.password);
        formData.append("city", form.city);
        formData.append("area", form.area);
        formData.append("role", role);
        formData.append("startingPrice", form.startingPrice);

        if (avatarFile) formData.append("avatar", avatarFile);
        if (coverFile) formData.append("coverImage", coverFile);

        if (role === "PROVIDER") {
          const providerProfile = {
            serviceCategories: selectedCategories.map((item) => String(item).trim()),
            whatsappNumber: form.phone,
            headline: `Trusted ${selectedCategories[0]?.toLowerCase()} specialist in ${form.area}`,
            startingPrice: form.startingPrice
          };
          formData.append("providerProfile", JSON.stringify(providerProfile));
        }
        payload = formData;
      }


      const response = mode === "login" ? await login(payload) : await register(payload);
      const destination =
        location.state?.from ||
        (response.user?.role === "PROVIDER"
          ? "/provider/dashboard"
          : response.user?.role === "USER"
            ? "/my-bookings"
            : "/admin");

      navigate(destination, { replace: true });
    } catch (submitError) {
      console.error("AUTH SUBMIT ERROR:", submitError.response?.data || submitError);
      setError(
        submitError.response?.data?.message ||
          submitError.message ||
          "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-shell grid gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-card rounded-[36px] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-coral">
          Access
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Join as a user or grow as a verified local provider.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Users get quick booking, direct chat, and flexible payment. Providers get a
          conversion-focused profile, local discovery, and admin-reviewed trust.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] bg-slate-100/80 p-5 dark:bg-white/10">
            <ShieldCheck className="text-teal" />
            <p className="mt-4 font-semibold">Role-based dashboards</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Separate experiences for users, providers, admins, and super admins.
            </p>
          </div>
          <div className="rounded-[28px] bg-slate-100/80 p-5 dark:bg-white/10">
            <UserRound className="text-coral" />
            <p className="mt-4 font-semibold">Built for direct communication</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              WhatsApp-first booking support is available across browse, booking, and
              dashboard flows.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[36px] p-8">
        <div className="mb-6 flex gap-2 rounded-full bg-slate-100 p-1 dark:bg-white/10">
          {["login", "register"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize ${
                mode === item
                  ? "bg-ink text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Full name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Profile image (Avatar)
                  </label>
                  <div className="flex items-center gap-3 min-w-0 w-full max-w-full">
                    {avatarPreview && (
                      <img src={avatarPreview} className="h-12 w-12 rounded-full object-cover" />
                    )}
                    <input
                      name="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis text-sm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:file:bg-white dark:file:text-slate-900"
                    />
                  </div>
                </div>
                {role === "PROVIDER" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Cover background image
                    </label>
                    <div className="flex items-center gap-3 min-w-0 w-full max-w-full">
                      {coverPreview && (
                        <img src={coverPreview} className="h-12 w-12 rounded-full object-cover" />
                      )}
                      <input
                        name="coverImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis text-sm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:file:bg-white dark:file:text-slate-900"
                      />
                    </div>
                  </div>
                )}

              </div>


              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">City</label>
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Area</label>
                  <select
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {areaOptions.map((area) => (
                      <option key={`${area.city}-${area.area}`} value={area.area}>
                        {area.area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Account type</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: "USER", label: "Customer account" },
                    { value: "PROVIDER", label: "Provider account" }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRole(item.value)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                        role === item.value
                          ? "border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-slate-900"
                          : "border-ink/10 dark:border-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {role === "PROVIDER" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Services offered
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setSelectedCategories((current) =>
                            current.includes(category)
                              ? current.length === 1
                                ? current
                                : current.filter((item) => item !== category)
                              : [...current, category]
                          )
                        }
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          selectedCategories.includes(category)
                            ? "bg-coral text-white"
                            : "bg-slate-100 dark:bg-white/10"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {role === "PROVIDER" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Starting price (₹)
                  </label>
                  <input
                    name="startingPrice"
                    type="number"
                    min="1"
                    value={form.startingPrice}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
                  />
                </div>
              )}

            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 font-semibold text-white disabled:opacity-70 dark:bg-white dark:text-slate-900"
          >
            {submitting && <LoaderCircle size={16} className="animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AuthPage;
