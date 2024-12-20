import React, { useState } from "react";
import "../src/index.css";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5000/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, contact, email, password }), 
    });

    if (response.ok) {
      alert('User  registered successfully!');
      navigate('/'); 
    } else {
      const data = await response.json();
      console.error("Signup failed:", data.message || response.statusText);
      alert(data.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-500">
      <div className="signin bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up!</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Full Name"
              className="rounded-lg p-2 m-2 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-gray-700"
            >
              Phone No.:
            </label>
            <input
              type="tel" // Changed to 'tel' for better input handling
              id="contact"
              name="contact"
              placeholder="Phone number"
              className="rounded-lg p-2 m-2 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400 w-full"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@gmail.com"
              className="rounded-lg p-2 m-2 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="password"
            className="rounded-lg p-2 m-2 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 mt-1"
            onClick={handleClick}
          >
            Sign-In
          </button>
        </form>
      </div>
    </div>
  );
} 