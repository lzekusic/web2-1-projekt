import React, {useEffect, useState} from "react";
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

const HomePage: React.FC = () => {
    const [roundInfo, setRoundInfo] = useState<any | null>(null);
    const [ticketCount, setTicketCount] = useState<number | null>(null);
    const [isRoundActive, setIsRoundActive] = useState<boolean>(false);

    const BE_URL = import.meta.env.VITE_BE_URL
    const { loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently } =
    useAuth0();

    useEffect(() => {
        async function load(){
            
            const token = await getAccessTokenSilently();

            const activeRound = await fetch(`${BE_URL}/api/activeRound`, {
                method: "GET", 
                headers:{"Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                },
            });

            if(activeRound.ok){
                const activeRoundData = await activeRound.json();
                setIsRoundActive(activeRoundData.isActive);
            }


            const roundResponse = await fetch(`${BE_URL}/api/lastResults`, {
                method:"GET",
                headers: { "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                },
            });

            if (!roundResponse.ok){
                setRoundInfo(null);
            } else {
                
                const roundData = await roundResponse.json();
                console.log(roundData);
                setRoundInfo(roundData);
            }
                        
            const countResponse = await fetch(`${BE_URL}/api/totalTickets`, {
                method:"GET",
                headers: { "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                },
            });

            if (!countResponse.ok){
                setTicketCount(null);
            } else {
                const countData = await countResponse.json();
                setTicketCount(countData);
            }
                            
        }
        load();
    }, [BE_URL]);
    
    return (
        <div className="HomePage-container">
        <div className="HomePage-header">
            <h1>Loto 6/45</h1>
            {isAuthenticated ? (
            <div className="HomePage-user">
                <p>Prijavljeni korisnik: {user?.name}</p>
                <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Odjava
                </button>
            </div>
            ) : (
            <button onClick={() => loginWithRedirect()}>Prijava</button>
            )}
        </div>

            <div className="HomePage-roundInfo">
            <p>Broj uplacenih listica: {ticketCount !== null ? ticketCount : "---"}</p>
            <p>Izvuceni brojevi: {roundInfo?.draw_numbers?.length ? roundInfo?.draw_numbers.join(", ") : "---"}</p>

            {isRoundActive && isAuthenticated && (
                <Link to="/ticket" className="HomePage-btn">
                    Uplati listic
                </Link>
            )}

            {!isRoundActive && (
                <p>Kolo jos nije aktivno i uplate jos nisu moguce.</p>
            )}
            
            </div>
    
        </div>
  );
};

export default HomePage;