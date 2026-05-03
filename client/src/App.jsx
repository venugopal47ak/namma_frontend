import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import AppRoutes from "./routes/AppRoutes";

const App = () => (
  <BrowserRouter>
    <PreferencesProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </PreferencesProvider>
  </BrowserRouter>
);

export default App;

