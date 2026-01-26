import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../Services/registerUser";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function AccountInfo() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: mutateSignUp } = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: () => {
      toast.success('Registration was successful!')
      
    },
     onError: (error) => {
        console.error(error);
        
        toast.error(error.response?.data?.message || "Registration failed")
        
      }
  });

  const navigate = useNavigate();

  const { register, reset, formState, handleSubmit, watch } = useForm();
  const { errors } = formState;
  const password = watch("password");

  function onhandleSubmit(data) {
    mutateSignUp(data);
    reset();
    navigate("/login");
  }

  return (
    <>

      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-r from-[#000080] via-[#0066cc] to-[#39a9db] ">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center flex-col items-center">
           <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-center text-white font-bold text-lg">
                      MK
           </div>
          <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-white">
            Sign Up to MinoxidilKe
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]  ">
          <div className="bg-gray-800/50 px-6 py-12 outline -outline-offset-1 outline-white/10 sm:rounded-lg sm:px-12 ">
            <form
              action="#"
              method="POST"
              className="space-y-6 "
              onSubmit={handleSubmit(onhandleSubmit)}
            >
              <div>
                <label
                  htmlFor="firstname"
                  className="block text-sm/6 font-medium text-white"
                >
                  First Name
                </label>
                <div className="mt-2">
                  <input
                    id="firstname"
                    name="firstname"
                    type="text"
                    required
                    autoComplete="first name"
                    {...register("firstName", {
                      required: "This field is required",
                    })}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
                {errors?.firstName && <p>{errors?.firstName.message}</p>}
              </div>
              <div>
                <label
                  htmlFor="firstname"
                  className="block text-sm/6 font-medium text-white"
                >
                  Last Name
                </label>
                <div className="mt-2">
                  <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    required
                    autoComplete="last name"
                    {...register("lastName", {
                      required: "This field is required",
                    })}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
                {errors?.lastName && (
                  <p className="text-white">{errors?.lastName.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-white"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    {...register("email", {
                      required: "This field is required",
                    })}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
                {errors?.email && <p>{errors?.email.message}</p>}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-white"
                >
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    {...register("password", {
                      required: "This field is required",
                      minLength: {
                        value: 4,
                        message: "The password should be atleast 8 characters",
                      },
                    })}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 pr-10 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors?.password && <p className="text-red-400 text-sm mt-1">{errors?.password?.message}</p>}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm/6 font-medium text-white"
                >
                  Confirm Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 pr-10 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors?.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors?.confirmPassword?.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="flex h-6 shrink-0 items-center">
                    <div className="group grid size-4 grid-cols-1">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        {...register("rememberMe")}
                        className="col-start-1 row-start-1 appearance-none rounded-sm border border-white/10 bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 indeterminate:border-indigo-500 indeterminate:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                      />
                      <svg
                        fill="none"
                        viewBox="0 0 14 14"
                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-white/25"
                      >
                        <path
                          d="M3 8L6 11L11 3.5"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-checked:opacity-100"
                        />
                        <path
                          d="M3 7H11"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-indeterminate:opacity-100"
                        />
                      </svg>
                    </div>
                  </div>
                  <label
                    htmlFor="remember-me"
                    className="block text-sm/6 text-white"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm/6">
                  <a
                    href="#"
                    className="font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Sign Up
                </button>
              </div>
                 <div className="mt-10 flex items-center gap-x-6">
                <div className="w-full flex-1 border-t border-white/10" />
                <p className="text-sm/6 font-medium text-nowrap text-white">
                  Or 
                </p>
                <div className="w-full flex-1 border-t border-white/10" />
              </div>
              <div className="mt-10 flex items-center gap-x-6">
                <div className="w-full flex-1 border-t border-white/10" />
                <p
                  className="text-sm/6 font-medium text-nowrap text-white cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Login
                </p>
                <div className="w-full flex-1 border-t border-white/10" />
              </div>
            </form>

            <div>
           

              <div className="mt-6 grid grid-cols-1 ">
                {/* <GoogleLogin
                 text="signup_with"
                  onSuccess={async (credentialResponse) => {
                    try {
                      // Send the Google token to your backend
                      const res = await axios.post(
                        "http://localhost:3000/api/v1/account/googleLogin",
                        {
                          credential: credentialResponse.credential,
                        }
                      );

                      // Optionally save token in localStorage or context
                      localStorage.setItem("userToken", res.data.token);

                      alert("Google login successful!");
                      navigate("/"); // or redirect anywhere
                    } catch (error) {
                      console.error(
                        "Google login error:",
                        error.response?.data || error.message
                      );
                      alert("Google login failed.");
                    }
                  }}
                  onError={() => {
                    alert("Google Login Failed");
                  }}
                />
              */}
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </>
  );
}
