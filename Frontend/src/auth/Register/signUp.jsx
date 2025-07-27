import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { NavLink } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const signUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "tenant", // default role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //   this prevents the browser from refresh after we submit the data (clicking signin)
  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must include at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      toast.error("Password must include at least one lowercase letter.");
      return;
    }
    if (!/[@#$!%*?&]/.test(formData.password)) {
      toast.error("Password must include at least one special character.");
      return;
    }
    if (/\s/.test(formData.password)) {
      toast.error("Password cannot contain spaces.");
      return;
    }
    if (!/\d/.test(formData.password)) {
      toast.error("Password must include at least one number.");
      return;
    }

    // Send signup request to backend
    try {
      const res = await fetch("https://roomsewa-project-production.up.railway.app/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Account created successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "tenant",
        });
        // Redirect to login after short delay
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
  }

  //
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-cyan-50 px-4">
      <div className="w-full max-w-lg bg-[#fefcfb] px-12 py-10 rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="logo" className="h-16 w-16" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Create your account
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-800 mb-1">
                First Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-800 mb-1">
                Last Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-800 mb-1">
              Account Type <span className="text-red-600">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onCopy={e => {
                  if (!showPassword) {
                    e.preventDefault();
                    toast.info("Copying is disabled when password is hidden.");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-2 text-gray-600 text-sm focus:outline-none hover:text-gray-800"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Confirm Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-2 text-gray-600 text-sm focus:outline-none hover:text-gray-800"
                tabIndex={-1}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-cyan-500" />
              Remember me
            </label>
            <NavLink
              className="text-cyan-600 hover:underline"
              to={"/forgotPassword"}
            >
              Forgot password?
            </NavLink>
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition"
          >
            Sign up
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-700 text-center">
          Already have an account?{" "}
          <NavLink className="text-cyan-600 hover:underline" to={"/login"}>
            Login
          </NavLink>
        </p>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </section>
  );
};

export default signUp;
