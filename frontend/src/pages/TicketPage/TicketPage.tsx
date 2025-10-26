import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const TicketPage: React.FC = () => {
    const [idNum, setIdNum] = useState('');
    const [lotoNumbers, setLotoNumbers] = useState('');
    const [qrURL, setQrURL] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRoundActive, setIsRoundActive] = useState<boolean | null>(null);


    const BE_URL = import.meta.env.VITE_BE_URL
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        async function checkRoundStatus(){
            try{
                const token = await getAccessTokenSilently();
                const response = await fetch(`${BE_URL}/api/activeRound`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                });

                if(response.ok){
                    const data= await response.json();
                    setIsRoundActive(data.isActive);
                } else {
                    setIsRoundActive(false);
                }
            } catch(err){
                setIsRoundActive(false);
            }
        }

        checkRoundStatus();
    }, [BE_URL, getAccessTokenSilently]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setQrURL(null);

        try{
            
            const token = await getAccessTokenSilently();
            const response = await fetch(`${BE_URL}/api/generateTicket`, {
                method: "POST",
                headers: { "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                 },
                body: JSON.stringify({ idNumber:idNum, numbers: lotoNumbers }),
            });
        

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Greska pri slanju listica.");
            }

            const blob = await response.blob();
            const qrUrl = URL.createObjectURL(blob); 
            setQrURL(qrUrl);

        
        } catch (err: any) {
            setError(err.message);
        }
  };

    return (
        <div className="TicketPage-container">
            <h1>Uplatite listic</h1>


            {isRoundActive === true && (          
                <form onSubmit={handleSubmit} className="TicketPage-form">
                    <label>
                        Upisite broj osobne iskaznice ili putovnice:
                        <input value={idNum} onChange={e => setIdNum(e.target.value)} maxLength={20} />
                    </label>

                    <label>
                        Upisite brojeve za listic (6-10 brojeva odvojenih zarezom):
                        <input value={lotoNumbers} onChange={e => setLotoNumbers(e.target.value)} />
                    </label>

                    <div className="TicketPage-btn">
                        <button type="submit">Posalji</button>
                    </div>
                </form>
            )}

            {isRoundActive === false && (
                <p>Uplate nisu omogucene.</p>
            )}

            {error && <div className="TicketPage-error"> Greska: {error} </div>}

            {qrURL && (
                <div className="TicketPage-qr">
                    <h2>QR kod vaseg listica</h2>
                    <img src={qrURL} alt="QR kod listica" />
                    <p>Skenirajte kod za pregled listica.</p>
                </div>
            )}
        </div>
    );
    
};  

export default TicketPage;