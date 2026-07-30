import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { CarFront, Loader2 } from "lucide-react"
import Modal from "./Modal"
import { useAuth } from "../context/AuthContext"

const controlClass =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"

export default function AuthModal() {
  const { authModal, closeAuth, openAuth, login, register: registerUser } = useAuth()
  const mode = authModal
  const isRegister = mode === "register"

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { username: "", email: "", mobile: "", password: "" },
  })

  useEffect(() => {
    reset({ username: "", email: "", mobile: "", password: "" })
  }, [mode, reset])

  const submit = handleSubmit(async (values) => {
    try {
      if (isRegister) {
        await registerUser({
          username: values.username,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
        })
      } else {
        await login({ email: values.email, password: values.password })
      }
    } catch (error) {
      toast.error(error.friendlyMessage || "Authentication failed.")
    }
  })

  return (
    <Modal open={Boolean(mode)} onClose={closeAuth} className="max-w-md" labelledBy="auth-modal-title">
      <div className="p-7">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <CarFront className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 id="auth-modal-title" className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          {isRegister ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {isRegister
            ? "Register to browse the inventory and purchase vehicles."
            : "Sign in to purchase vehicles and manage inventory."}
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
          {isRegister ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Username
                </label>
                <input
                  id="username"
                  autoComplete="name"
                  placeholder="Alex Carter"
                  className={controlClass}
                  {...register("username", { required: "Username is required" })}
                />
                {errors.username ? (
                  <p className="text-xs font-medium text-destructive">{errors.username.message}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="mobile" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mobile number
                </label>
                <input
                  id="mobile"
                  type="tel"
                  autoComplete="tel"
                  placeholder="9876543210"
                  className={controlClass}
                  {...register("mobile", {
                    required: "Mobile number is required",
                    pattern: { value: /^\d{7,15}$/, message: "Enter a valid mobile number" },
                  })}
                />
                {errors.mobile ? <p className="text-xs font-medium text-destructive">{errors.mobile.message}</p> : null}
              </div>
            </>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@dealership.com"
              className={controlClass}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Enter a valid email address" },
              })}
            />
            {errors.email ? <p className="text-xs font-medium text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="••••••••"
              className={controlClass}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Use at least 6 characters" },
              })}
            />
            {errors.password ? <p className="text-xs font-medium text-destructive">{errors.password.message}</p> : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "New to AutoStock?"}{" "}
          <button
            type="button"
            onClick={() => openAuth(isRegister ? "login" : "register")}
            className="font-semibold text-primary hover:underline"
          >
            {isRegister ? "Log in" : "Create one"}
          </button>
        </p>
      </div>
    </Modal>
  )
}
