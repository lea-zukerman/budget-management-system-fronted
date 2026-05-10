import React from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/index";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar/Navbar";

// יצרנו קומפוננטה פנימית כדי שנוכל להשתמש ב-useLocation
const AppContent: React.FC = () => {
  const location = useLocation();

  // רשימת הדפים שבהם אנחנו רוצים להסתיר את הסרגל
  const hideNavbarRoutes = ["/login", "/register"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {/* מציג את ה-Navbar רק אם אנחנו לא בדף לוגין או רגיסטר */}
      {!shouldHideNavbar && <Navbar />}
      <AppRoutes />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
