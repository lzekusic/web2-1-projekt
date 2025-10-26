import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface TicketData {
  id: string;
  id_number: string;
  numbers: string;
  draw_numbers?: string;
}

const TicketInfoPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id'); // Read ?id=123 from URL

  const [ticketData, setTicketData] = useState<TicketData>();
  const [error, setError] = useState<string | null>(null);

  const BE_URL = import.meta.env.VITE_BE_URL;

  useEffect(() => {
    async function fetchTicket() {
      try {
        const response = await fetch(`${BE_URL}/api/getTicket/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Greška pri dohvaćanju listića.");
        }

        const data = await response.json();
        setTicketData(data);

        console.log(data);

      } catch (err: any) {
        setError(err.message);
      }
    }

    if (id) {
      fetchTicket();
    }
  }, [id]);

  if (error) {
    return <div className="TicketInfo-container"><p className="error">{error}</p></div>;
  }

  if (!ticketData) {
    return null;
  }

  return (
    <div className="TicketInfo-container">
      <h2>Listić {ticketData.id}</h2>
      
      <div className="TicketInfo-info">
        <p><strong>Broj osobne iskaznice ili putovnice:</strong> {ticketData.id_number}</p>
        <p><strong>Odabrani brojevi:</strong> {(ticketData.numbers as any).join(', ')}</p>

        {ticketData.draw_numbers ? (
          <p><strong>Izvučeni brojevi:</strong> {(ticketData.draw_numbers as any).join(', ')}</p>
        ) : (
          <p className="TicketInfo-pending">Izvlačenje još nije objavljeno.</p>
        )}
      </div>
    </div>
  );
};

export default TicketInfoPage;
