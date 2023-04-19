import React, { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [redirect, setRedirect] = useState(false);

  // context'den setUser'ı getir
  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      // await axios.post("/login", { email, password });
      // context'de kullanmak için userInfo olarak tanımlama yaptım, be'de index.js'de res.cookie userDoc gelecek, o burada userInfo olacak bunu da context'deki user'a atayacağız
      // const userInfo = await axios.post("/login", { email, password });
      // const response = await axios.post("/login", { email, password });
      // gelen response içinden data kısmını destructure ile çekelim
      // buradan da header'a gidip mesela login olmuş kullanıcı adını context'den çekelim
      const { data } = await axios.post("/login", { email, password });
      setUser(data);
      alert("login successful");
      // setRedirect(true);
      navigate("/");
    } catch (error) {
      alert("login failed");
    }
  };
  // if (redirect) {
  //   <Navigate to={"/"} />;
  // }
  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">login</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
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
          <button className="primary">login</button>
          <div className="text-center py-2 text-gray-500">
            Don't have an account yet!{" "}
            <Link className="underline text-black" to="/register">
              Register Now!
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
