import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async (e) => {
    e.preventDefault();
    try {
      // axios.get("http://localhost:4000/test"); App.jsx'de base tanımladık
      axios.get("/test"); // çalışıyor, şimdi bunu post yapalım register endpointine yollayalım, burada ne yollayacağımızı nesneyi hazırlayalım, ./api/index.js'de de register endpointi hazırlayalım,
      await axios.post("/register", {
        name,
        email,
        password,
      });
      alert("Registration Successful. Now you can log in");
    } catch (error) {
      alert("Registration failed. Please try again later");
    }
  };

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">register</h1>
        <form className="max-w-md mx-auto" onSubmit={registerUser}>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary">register</button>
          <div className="text-center py-2 text-gray-500">
            Already a member?
            <Link className="underline text-black" to="/login">
              Login Now!
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
