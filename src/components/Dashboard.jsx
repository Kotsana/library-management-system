import React, { useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";

function Dashboard({
  currentUser,
  books,
  setBooks,
  users,
  setUsers,
  transactions,
  setTransactions,
  borrowHistory,
  setBorrowHistory,
  onLogout
}) {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  }

  function borrowBook(isbn) {
    const book = books.find((item) => item.isbn === isbn);

    if (!book) {
      showMessage("Book not found.");
      return;
    }

    if (Number(book.quantity) <= 0) {
      showMessage("This book is unavailable.");
      return;
    }

    const updatedBooks = books.map((item) =>
      item.isbn === isbn
        ? { ...item, quantity: Number(item.quantity) - 1 }
        : item
    );

    const date = new Date().toLocaleString();

    setBooks(updatedBooks);
    setBorrowHistory([
      ...borrowHistory,
      {
        user: currentUser.name,
        isbn: book.isbn,
        title: book.title,
        date,
        status: "Borrowed"
      }
    ]);
    setTransactions([
      ...transactions,
      {
        user: currentUser.name,
        isbn: book.isbn,
        type: "Borrow",
        date
      }
    ]);

    showMessage("Book borrowed successfully.");
  }

  function addBook(book) {
    const alreadyExists = books.some((item) => item.isbn === book.isbn);

    if (alreadyExists) {
      showMessage("A book with this ISBN already exists.");
      return false;
    }

    setBooks([...books, book]);
    showMessage("Book added successfully.");
    return true;
  }

  function deleteBook(index) {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    setBooks(books.filter((_, itemIndex) => itemIndex !== index));
    showMessage("Book deleted successfully.");
  }

  function recordTransaction(transaction) {
    setTransactions([
      ...transactions,
      {
        ...transaction,
        date: new Date().toLocaleString()
      }
    ]);
    showMessage("Transaction recorded successfully.");
  }

  function addUser(user) {
    const userExists = users.some(
      (item) => item.email.toLowerCase() === user.email.toLowerCase()
    );

    if (userExists) {
      showMessage("A user with this email already exists.");
      return false;
    }

    setUsers([...users, user]);
    showMessage("User added successfully.");
    return true;
  }

  function deleteUser(index) {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setUsers(users.filter((_, itemIndex) => itemIndex !== index));
    showMessage("User deleted successfully.");
  }

  function NavItem({ to, children }) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) => isActive ? "active-nav-link" : ""}
      >
        {children}
      </NavLink>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <h2>Community Library</h2>
          </div>

          <div className="nav-links">
            {currentUser.role === "guest" ? (
              <>
                <NavItem to="/dashboard">Dashboard</NavItem>
                <NavItem to="/dashboard/books">Available Books</NavItem>
                <NavItem to="/dashboard/my-books">My Books</NavItem>
                <NavItem to="/dashboard/history">History</NavItem>
              </>
            ) : (
              <>
                <NavItem to="/dashboard">Dashboard</NavItem>
                <NavItem to="/dashboard/books">Book Management</NavItem>
                <NavItem to="/dashboard/transactions">Transactions</NavItem>
                <NavItem to="/dashboard/users">User Management</NavItem>
              </>
            )}
          </div>

          <div className="nav-user">
            <span>{currentUser.role === "admin" ? "Administrator" : currentUser.name}</span>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <main className="main-container">
        <Routes>
          {currentUser.role === "guest" ? (
            <>
              <Route
                index
                element={
                  <GuestDashboard
                    currentUser={currentUser}
                    books={books}
                    borrowHistory={borrowHistory}
                    onBorrow={borrowBook}
                  />
                }
              />
              <Route
                path="books"
                element={<GuestBooks books={books} onBorrow={borrowBook} />}
              />
              <Route
                path="my-books"
                element={<BorrowedBooks currentUser={currentUser} borrowHistory={borrowHistory} />}
              />
              <Route
                path="history"
                element={<GuestHistory currentUser={currentUser} borrowHistory={borrowHistory} />}
              />
            </>
          ) : (
            <>
              <Route
                index
                element={
                  <AdminDashboard
                    books={books}
                    users={users}
                    transactions={transactions}
                  />
                }
              />
              <Route
                path="books"
                element={
                  <AdminBooks
                    books={books}
                    onAdd={addBook}
                    onDelete={deleteBook}
                  />
                }
              />
              <Route
                path="transactions"
                element={
                  <AdminTransactions
                    transactions={transactions}
                    onRecord={recordTransaction}
                  />
                }
              />
              <Route
                path="users"
                element={
                  <AdminUsers
                    users={users}
                    onAdd={addUser}
                    onDelete={deleteUser}
                  />
                }
              />
            </>
          )}
        </Routes>
      </main>

      {message && <div id="message" className="show">{message}</div>}
    </>
  );
}

function GuestDashboard({ currentUser, books, borrowHistory, onBorrow }) {
  const available = books.reduce((total, book) => total + Number(book.quantity), 0);
  const borrowed = borrowHistory.filter(
    (item) => item.user === currentUser.name && item.status === "Borrowed"
  ).length;
  const history = borrowHistory.filter((item) => item.user === currentUser.name).length;

  return (
    <>
      <div className="page-header">
        <h1>Welcome, <span>{currentUser.name}</span></h1>
        <p>Explore our available books and manage your borrowing activity.</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Available Books" value={available} />
        <StatCard title="My Borrowed Books" value={borrowed} />
        <StatCard title="My History" value={history} />
      </div>

      <section className="content-section">
        <div className="section-header"><h2>Available Books</h2></div>
        <BookCards books={books} onBorrow={onBorrow} />
      </section>

      <section className="content-section">
        <div className="section-header"><h2>Currently Borrowed</h2></div>
        <BorrowedBooks currentUser={currentUser} borrowHistory={borrowHistory} />
      </section>

      <section className="content-section">
        <div className="section-header"><h2>Borrowing History</h2></div>
        <GuestHistory currentUser={currentUser} borrowHistory={borrowHistory} />
      </section>
    </>
  );
}

function GuestBooks({ books, onBorrow }) {
  return (
    <>
      <div className="page-header">
        <h1>Available Books</h1>
        <p>Explore our available books and manage your borrowing activity.</p>
      </div>
      <section className="content-section">
        <BookCards books={books} onBorrow={onBorrow} />
      </section>
    </>
  );
}

function BookCards({ books, onBorrow }) {
  if (books.length === 0) return <p>No books available.</p>;

  return (
    <div className="book-grid">
      {books.map((book) => (
        <div className="book-card" key={book.isbn}>
          <div className="book-card-content">
            <h3>{book.title}</h3>
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Available:</strong> {book.quantity}</p>
            {Number(book.quantity) > 0 ? (
              <button className="primary-btn" onClick={() => onBorrow(book.isbn)}>
                Borrow Book
              </button>
            ) : (
              <button className="disabled-btn" disabled>Unavailable</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function BorrowedBooks({ currentUser, borrowHistory }) {
  const borrowedBooks = borrowHistory.filter(
    (item) => item.user === currentUser.name && item.status === "Borrowed"
  );

  if (borrowedBooks.length === 0) return <p>You have no borrowed books.</p>;

  return (
    <div className="list-container">
      {borrowedBooks.map((item, index) => (
        <div className="list-item" key={`${item.isbn}-${item.date}-${index}`}>
          <div>
            <h3>{item.title}</h3>
            <p>Borrowed on: {item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function GuestHistory({ currentUser, borrowHistory }) {
  const history = borrowHistory.filter((item) => item.user === currentUser.name);

  if (history.length === 0) return <p>No borrowing history found.</p>;

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>ISBN</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr key={`${item.isbn}-${item.date}-${index}`}>
              <td>{item.title}</td>
              <td>{item.isbn}</td>
              <td>{item.date}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminDashboard({ books, users, transactions }) {
  const totalCopies = books.reduce((total, book) => total + Number(book.quantity), 0);

  return (
    <>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage the community library system.</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Book Titles" value={books.length} />
        <StatCard title="Total Copies" value={totalCopies} />
        <StatCard title="Registered Users" value={users.length} />
        <StatCard title="Transactions" value={transactions.length} />
      </div>
    </>
  );
}

function AdminBooks({ books, onAdd, onDelete }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("");

  function submit(event) {
    event.preventDefault();

    const book = {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      quantity: Number(quantity)
    };

    if (!book.title || !book.author || !book.isbn || book.quantity < 1) {
      return;
    }

    if (onAdd(book)) {
      setTitle("");
      setAuthor("");
      setIsbn("");
      setQuantity("");
    }
  }

  return (
    <section className="content-section">
      <div className="section-header"><h2>Book Management</h2></div>

      <form className="management-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="bookTitle">Book Title</label>
          <input id="bookTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="bookAuthor">Author</label>
          <input id="bookAuthor" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="bookISBN">ISBN</label>
          <input id="bookISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="bookQuantity">Quantity</label>
          <input
            id="bookQuantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="primary-btn">Add Book</button>
      </form>

      <div className="table-container">
        {books.length === 0 ? (
          <p>No books in the library.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, index) => (
                <tr key={book.isbn}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.quantity}</td>
                  <td>
                    <button className="delete-btn" onClick={() => onDelete(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function AdminTransactions({ transactions, onRecord }) {
  const [user, setUser] = useState("");
  const [isbn, setIsbn] = useState("");
  const [type, setType] = useState("Borrow");

  function submit(event) {
    event.preventDefault();

    if (!user.trim() || !isbn.trim() || !type) return;

    onRecord({
      user: user.trim(),
      isbn: isbn.trim(),
      type
    });

    setUser("");
    setIsbn("");
    setType("Borrow");
  }

  return (
    <section className="content-section">
      <div className="section-header"><h2>Transactions</h2></div>

      <form className="management-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="transactionUser">User</label>
          <input id="transactionUser" value={user} onChange={(e) => setUser(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="transactionISBN">Book ISBN</label>
          <input id="transactionISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="transactionType">Transaction Type</label>
          <select id="transactionType" value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="Borrow">Borrow</option>
            <option value="Return">Return</option>
          </select>
        </div>

        <button type="submit" className="primary-btn">Record Transaction</button>
      </form>

      <TransactionTable transactions={transactions} />
    </section>
  );
}

function TransactionTable({ transactions }) {
  if (transactions.length === 0) return <p>No transactions recorded.</p>;

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>ISBN</th>
            <th>Type</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={`${transaction.isbn}-${transaction.date}-${index}`}>
              <td>{transaction.user}</td>
              <td>{transaction.isbn}</td>
              <td>{transaction.type}</td>
              <td>{transaction.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminUsers({ users, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function submit(event) {
    event.preventDefault();

    const user = {
      name: name.trim(),
      email: email.trim()
    };

    if (!user.name || !user.email) return;

    if (onAdd(user)) {
      setName("");
      setEmail("");
    }
  }

  return (
    <section className="content-section">
      <div className="section-header"><h2>User Management</h2></div>

      <form className="management-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="userName">User Name</label>
          <input id="userName" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="userEmail">Email</label>
          <input id="userEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <button type="submit" className="primary-btn">Add User</button>
      </form>

      {users.length === 0 ? (
        <p>No registered users.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={`${user.email}-${index}`}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button className="delete-btn" onClick={() => onDelete(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

export default Dashboard;