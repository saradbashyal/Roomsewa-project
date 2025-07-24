import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, Link } from "react-router-dom"; // Corrected import
import { loginUser } from "../../services/api"; // Add this
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email: formData.email, password: formData.password });
      
      // Store token
      localStorage.setItem("token", data.token);
      
      // Store complete user object for search page compatibility
      const userData = {
        id: data.userId,
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        username: data.username || data.email,
        email: data.email,
        role: data.role || 'tenant' // Default role if not provided
      };
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Keep individual items for backward compatibility
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", userData.name);
      localStorage.setItem("userEmail", data.email || "");
      
      // Dispatch custom event to notify all components
      window.dispatchEvent(new Event('userDataChanged'));
      
      toast.success("Login successful!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      toast.error("Login failed: " + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-cyan-50 px-4">
      <div className="w-full max-w-md bg-[#fefcfb] px-6 py-10 rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="logo" className="h-16 w-16" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Sign in to your account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="flex items-center justify-between text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-cyan-500" />
              Remember me
            </label>
            <Link
              className="text-cyan-600 hover:underline"
              to="/forgotPassword"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-700 text-center">
          Don't have an account?{" "}
          <Link className="text-cyan-600 hover:underline" to="/signup">
            Sign up
          </Link>
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

export default Login;