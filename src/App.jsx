import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

const defaultBooks = [
  {
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    isbn: "9780385474542",
    quantity: 5
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "9780061122415",
    quantity: 4
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9780735211292",
    quantity: 3
  }
];

function getData(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

function App() {
  const [books, setBooks] = useState(() => getData("books", defaultBooks));
  const [users, setUsers] = useState(() => getData("users", []));
  const [transactions, setTransactions] = useState(() => getData("transactions", []));
  const [borrowHistory, setBorrowHistory] = useState(() => getData("borrowHistory", []));
  const [currentUser, setCurrentUser] = useState(() => getData("currentUser", null));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("borrowHistory", JSON.stringify(borrowHistory));
  }, [borrowHistory]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }

    if (currentUser && location.pathname === "/login") {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  function loginAsGuest(name) {
    const user = { name, role: "guest" };
    setCurrentUser(user);
    navigate("/dashboard");
  }

  function loginAsAdmin(username, password) {
    if (username === "admin" && password === "admin123") {
      setCurrentUser({
        name: "Administrator",
        username,
        role: "admin"
      });
      navigate("/dashboard");
      return true;
    }

    return false;
  }

  function logout() {
    setCurrentUser(null);
    navigate("/login");
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onGuestLogin={loginAsGuest}
              onAdminLogin={loginAsAdmin}
            />
          )
        }
      />
      <Route
        path="/dashboard/*"
        element={
          currentUser ? (
            <Dashboard
              currentUser={currentUser}
              books={books}
              setBooks={setBooks}
              users={users}
              setUsers={setUsers}
              transactions={transactions}
              setTransactions={setTransactions}
              borrowHistory={borrowHistory}
              setBorrowHistory={setBorrowHistory}
              onLogout={logout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;