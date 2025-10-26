import {Request, Response} from "express";
import {pool} from "../database";

async function getActiveRound(client: any) {
    const {rows} = await client.query(
         "SELECT * FROM rounds WHERE is_active = TRUE ORDER BY id DESC LIMIT 1"
    );
    return rows[0] || null;

}

export const startNewRound = async (req: Request, res: Response) => {
    const client = await pool.connect();

    try{
        const active = await getActiveRound(client);
        if (active) return res.sendStatus(204);

        await client.query("INSERT INTO rounds (is_active) VALUES (TRUE)");
        res.sendStatus(204);
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    } finally {
        client.release();
    }
};

export const closeRound = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try{
        const active = await getActiveRound(client);
        if (!active) return res.sendStatus(204);

        await client.query(
            "UPDATE rounds SET is_active = FALSE, closed_at = NOW() WHERE id=$1", [active.id]
        );

        res.sendStatus(204);

    } catch(err){
        console.error(err);
        res.sendStatus(500);
    }finally {
        client.release();
    }
};


export const storeResults = async (req: Request, res: Response) => {
    const resNumbers = req.body?.numbers;

    if (!resNumbers || !Array.isArray(resNumbers)){
        return res.sendStatus(400).json({message: "Neispravno unesena vrijednost rezultata"});
    }

    const client = await pool.connect();

    try{
        const active = await getActiveRound(client);
        if (active) {
            return res.status(400).json({message: "Rezultati se ne mogu spremiti za aktivno kolo"});
        }


        const {rows} = await client.query(
            "SELECT * FROM rounds WHERE is_active = FALSE AND draw_numbers IS NULL ORDER BY id DESC LIMIT 1"
        );

        const round = rows[0];

        if(!round){
            return res.status(400).json({message: "Nema zatvorenog kola"});
        }

        if(round.draw_numbers !== null) {
            return res.status(400).json({message: "Za kolo su brojevi vec izvuceni"});
        }
            
        await client.query("UPDATE rounds SET draw_numbers = $1 WHERE id = $2", [resNumbers,round.id]);   
        
        res.sendStatus(204);
    }catch (err){
        console.error(err);
        res.sendStatus(500).json({ message: "Greska pri spremanju rezultata" });
    } finally {
        client.release();
    }
};

