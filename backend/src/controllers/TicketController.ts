import {Request, Response} from "express";
import {pool} from "../database";
import QRCode from "qrcode";

async function getActiveRound(client: any) {
  const { rows } = await client.query(
    "SELECT * FROM rounds WHERE is_active = TRUE ORDER BY id DESC LIMIT 1"
  );
  return rows[0] || null;
}

export const getActiveRoundStatus = async (req: Request, res: Response) => {
    const client = await pool.connect();

    try{
        const active = await getActiveRound(client);

        res.json({
            isActive: !!active,
            roundId:active?.id || null
        });
    } catch (err){
        res.status(500).json({message: "Greska pri provjeri statusa"});
    } finally {
        client.release();
    }
};


export const totalTickets = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const round = await getActiveRound(client);
    if (!round) return res.json(0);

    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*)::int AS result FROM tickets WHERE round_id = $1",
      [round.id]
    );
    res.json(countRows[0]?.result || 0);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Database error" });
  }
};

export const generateTicket = async (req: Request, res: Response) => {
  const { idNumber, numbers } = req.body;
  //idNumber - broj osobne/putovnice
  //numbers - brojevi koje je user odabrao za listic

  if (!idNumber || typeof idNumber !== "string" || idNumber.length > 20)
    return res.status(400).json({ message: "Neispravan broj osobne iskaznice ili putovnice" });
  
  if (!numbers || typeof numbers !== "string")
    return res.status(400).json({ message: "Brojevi su u neispravnom formatu" });

  let parsed: number[];
  try {
    parsed = numbers.split(",").map((n: string) => Number(n.trim()));

    if (parsed.some((n) => !Number.isInteger(n)))
      throw new Error("Koristite samo cijele brojeve");

    if (parsed.length < 6 || parsed.length > 10)
      throw new Error("Brojevi za listic moraju biti izmedu 6 i 10 brojeva");

    if (new Set(parsed).size !== parsed.length)
      throw new Error("Ne koristiti duplikate");

    if (parsed.some((n) => n < 1 || n > 45))
      throw new Error("Brojevi za listic moraju biti u rasponu vrijednosti od 1 do 45");

    parsed.sort((a, b) => a - b);
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }

  const client = await pool.connect();
  try {
    const active = await getActiveRound(client);
    if (!active) return res.status(400).json({ message: "Nema aktivnog kola" });

    const insertTicket = await client.query(
      "INSERT INTO tickets (round_id, id_number, numbers) VALUES ($1,$2,$3) RETURNING id",
      [active.id, idNumber, parsed]
    );

    const uuid = insertTicket.rows[0].id;
    const url = `${process.env.PUBLIC_FE_BASE_URL}/ticketInfo?id=${uuid}`;
    const QRpng = await QRCode.toBuffer(url, { type: "png", errorCorrectionLevel: "M" });

    res.setHeader("Content-Type", "image/png");
    res.send(QRpng);


  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Greska pri generiranju" });
  } finally {
    client.release();
  }
};


export const getTicket = async (req: Request, res: Response) => {
  const uuid = req.params.uuid;

  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.id_number, t.numbers, r.id AS round_id, r.is_active, r.draw_numbers
       FROM tickets t JOIN rounds r ON r.id = t.round_id WHERE t.id = $1`,
      [uuid]
    );
    if (!rows[0]) return res.status(404).json({ message: "Listic ne postoji" });

    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};


export const lastResults = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT draw_numbers, is_active
       FROM rounds
       ORDER BY started_at DESC
       LIMIT 1`
    );
    
    let result;
    
    if (rows.length > 0) {
      if (rows[0].is_active === false && rows[0].draw_numbers && rows[0].draw_numbers.length >0) {
        result = rows[0].draw_numbers;
      } else {
        result = null;
      }
    } else {
      result = null;
    }

    res.json({ draw_numbers: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Greska pri dohvacanju rezultata" });
  } finally {
    client.release();
  }
};



