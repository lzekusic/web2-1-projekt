import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import HomePage from "./pages/HomePage/HomePage";
import TicketPage from "./pages/TicketPage/TicketPage";
import TicketInfoPage from "./pages/TicketInfoPage/TicketInfoPage";

const App: React.FC = () => {
    return(
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_OIDC_CLIENT_ID}
      authorizationParams={{
        redirect_uri: import.meta.env.VITE_PUBLIC_FE_BASE_URL,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
        <Router>
            <Routes>
                <Route path="/" element={<HomePage/>} />
                <Route path="/callback" element={<HomePage/>} />
                <Route path="/ticket" element={<TicketPage/>} />
                <Route path="/ticketInfo" element={<TicketInfoPage/>} />

            </Routes>
        </Router>
    </Auth0Provider>
    );
};

export default App;