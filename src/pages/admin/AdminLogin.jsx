import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail
} from 'lucide-react';
import { useState } from 'react';
import {
  useLocation,
  useNavigate
} from 'react-router-dom';

import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useStore } from '../../contexts/StoreContext';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const { settings } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async event => {
    event.preventDefault();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      setError(
        'Please enter your email and password.'
      );
      return;
    }

    setSaving(true);
    setError('');

    try {
      await login(normalizedEmail, password);

      const from = location.state?.from;

      const redirectPath =
        typeof from === 'string'
          ? from
          : from?.pathname || '/admin';

      navigate(redirectPath, {
        replace: true
      });
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to sign in. Please check your credentials.'
      );
    } finally {
      setSaving(false);
    }
  };

  const clearError = () => {
    if (error) {
      setError('');
    }
  };

  return (
    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-slate-50
        px-4
        py-8
        sm:px-6
      "
    >
      {/* Background decoration */}
      <div
        className="
          pointer-events-none
          absolute
          -left-28
          -top-28
          h-80
          w-80
          rounded-full
          bg-amber-500/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          -right-32
          h-96
          w-96
          rounded-full
          bg-slate-900/10
          blur-3xl
        "
      />

      <section
        className="
          relative
          z-10
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
          border
          border-white/70
          bg-white/90
          p-6
          shadow-2xl
          shadow-slate-900/10
          backdrop-blur-xl
          transition-all
          duration-300
          sm:p-9
        "
      >
        <div className="text-center">
          <span
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-[var(--secondary-color,#d97706)]
              text-white
              shadow-lg
              shadow-amber-600/20
              transition-transform
              duration-300
              hover:-translate-y-1
              hover:scale-105
            "
          >
            <LockKeyhole size={28} />
          </span>

          <span
            className="
              mt-5
              inline-block
              text-xs
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-[var(--secondary-color,#d97706)]
            "
          >
            Secure workspace
          </span>

          <h1
            className="
              mt-3
              text-3xl
              font-black
              tracking-tight
              text-[var(--primary-color,#0f172a)]
              sm:text-4xl
            "
          >
            {settings?.storeName || 'Sharuu'} Admin
          </h1>

          <p
            className="
              mx-auto
              mt-3
              max-w-sm
              text-sm
              leading-6
              text-slate-500
            "
          >
            Sign in securely to manage products,
            orders, homepage content and store
            settings.
          </p>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="mt-8 space-y-5"
        >
          {/* Email */}
          <label className="block">
            <span
              className="
                mb-2
                block
                text-sm
                font-bold
                text-slate-700
              "
            >
              Email address
            </span>

            <div
              className="
                group
                flex
                min-h-14
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-300
                bg-white
                px-4
                shadow-sm
                transition-all
                duration-200
                focus-within:-translate-y-0.5
                focus-within:border-[var(--secondary-color,#d97706)]
                focus-within:ring-4
                focus-within:ring-amber-500/10
              "
            >
              <Mail
                size={19}
                className="
                  shrink-0
                  text-slate-400
                  transition-colors
                  group-focus-within:text-[var(--secondary-color,#d97706)]
                "
              />

              <input
                type="email"
                value={email}
                onChange={event => {
                  setEmail(event.target.value);
                  clearError();
                }}
                placeholder="Enter admin email"
                autoComplete="username"
                inputMode="email"
                disabled={saving}
                required
                className="
                  min-w-0
                  flex-1
                  border-0
                  bg-transparent
                  py-4
                  text-sm
                  font-medium
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>
          </label>

          {/* Password */}
          <label className="block">
            <span
              className="
                mb-2
                block
                text-sm
                font-bold
                text-slate-700
              "
            >
              Password
            </span>

            <div
              className="
                group
                flex
                min-h-14
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-300
                bg-white
                px-4
                shadow-sm
                transition-all
                duration-200
                focus-within:-translate-y-0.5
                focus-within:border-[var(--secondary-color,#d97706)]
                focus-within:ring-4
                focus-within:ring-amber-500/10
              "
            >
              <LockKeyhole
                size={19}
                className="
                  shrink-0
                  text-slate-400
                  transition-colors
                  group-focus-within:text-[var(--secondary-color,#d97706)]
                "
              />

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={event => {
                  setPassword(event.target.value);
                  clearError();
                }}
                placeholder="Enter admin password"
                autoComplete="current-password"
                disabled={saving}
                required
                className="
                  min-w-0
                  flex-1
                  border-0
                  bg-transparent
                  py-4
                  text-sm
                  font-medium
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    previous => !previous
                  )
                }
                disabled={saving}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border-0
                  bg-transparent
                  text-slate-500
                  transition-all
                  duration-200
                  hover:bg-slate-100
                  hover:text-slate-900
                  focus:outline-none
                  focus:ring-2
                  focus:ring-amber-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </label>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                font-medium
                leading-6
                text-red-700
                shadow-sm
              "
            >
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={saving}
            className="
              flex
              min-h-14
              w-full
              items-center
              justify-center
              gap-2.5
              rounded-2xl
              border-0
              bg-[var(--secondary-color,#d97706)]
              px-5
              py-3
              text-sm
              font-black
              text-white
              shadow-lg
              shadow-amber-600/20
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:brightness-105
              hover:shadow-xl
              active:translate-y-0
              disabled:cursor-not-allowed
              disabled:opacity-65
              disabled:hover:translate-y-0
            "
          >
            {saving ? (
              <>
                <span
                  className="
                    h-5
                    w-5
                    animate-spin
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                  "
                />

                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={19} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div
          className="
            mt-7
            flex
            items-center
            justify-center
            gap-2
            text-center
            text-[11px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-slate-400
          "
        >
          <LockKeyhole size={13} />
          <span>
            Protected administrative access
          </span>
        </div>
      </section>
    </main>
  );
}