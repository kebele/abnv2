// login bilgisini tutmak/değiştirmek için
// iki temel yapı var UserContext dışarıdan buraya ulaşmamızı sağlayacak
// UserContextProvider ise bütün App'içinde her yere burada tanımladığımız state'lere ulaşmamızı sağlaması için kapsayıcı yapacağımız, bunu App.jsx'de kapsayıcı yapacağız, kapsam içindeki her yere/yerden buradaki state'lere ulaşabileceğiz
// burada user ve setUser tanımlayacağız, yapıya dikkat
// login'den buraya ulaşıp, state'i değiştirelim

import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  // ready state'inin görevi user'ın gelip gelmediği, hazır'lığı

  // profile adında bir endpoint yapacağız eğer user boş ise
  useEffect(() => {
    if (!user) {
      axios.get("/profile").then(({ data }) => {
        setUser(data);
        setReady(true);
      });
    }
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
