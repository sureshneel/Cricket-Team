const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM cricket_team`;
  const playerArray = await db.all(getPlayerQuery);
  response.send(playerArray.map(convertDBObjectToResponseObject));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO 
    cricket_team (player_name,jersey_number,role)

    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
        )`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId}`;
  const playerArray = await db.get(getPlayerQuery);

  response.send(convertDBObjectToResponseObject(playerArray));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const upDatePlayerQuery = `UPDATE 
    cricket_team 
    SET

       player_name= '${playerName}',
       jersey_number= '${jerseyNumber}',
       role='${role}'
    WHERE player_id=${playerId}
        `;
  await db.run(upDatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = ` DELETE FROM cricket_team
    WHERE player_id=${playerId}
        `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
