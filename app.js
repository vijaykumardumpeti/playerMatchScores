let express = require("express");
let app = express();

module.exports = app;

app.use(express.json());

let sqlite = require("sqlite");
let { open } = sqlite;
let sqlite3 = require("sqlite3");
let path = require("path");

let dbpath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

let intializeDBAndServer = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("Server Started at: http://localhost:3000/");
  });
};
intializeDBAndServer();

//1) GET
app.get("/players/", async (request, response) => {
  try {
    let getPlayersQuery = `
        SELECT 
        * 
        FROM 
            player_details
    `;
    let dbObject = await db.all(getPlayersQuery);
    let myArray = [];
    for (let object of dbObject) {
      let { player_id, player_name } = object;
      let s = {
        playerId: player_id,
        playerName: player_name,
      };
      myArray.push(s);
    }

    response.send(myArray);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});

//2)GET
app.get("/players/:playerId/", async (request, response) => {
  try {
    let { playerId } = request.params;

    let getPlayerQuery = `
     SELECT 
     *
     FROM 
        player_details
     WHERE 
        player_id = ${playerId};`;
    let dbObject = await db.get(getPlayerQuery);
    let { player_id, player_name } = dbObject;
    let s = {
      playerId: player_id,
      playerName: player_name,
    };
    response.send(s);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});
//3) PUT

app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let { playerName } = request.body;

  let updatePlayerNameQuery = `
  UPDATE 
    player_details
  SET 
    player_name = '${playerName}'
   WHERE 
     player_id = ${playerId}`;
  await db.run(updatePlayerNameQuery);
  response.send("Player Details Updated");
});

//4) GET

app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  let getMatchDetailsQuery = `
    SELECT 
    * 
    FROM
        match_details
    WHERE 
        match_id = ${matchId};`;
  let dbObject = await db.get(getMatchDetailsQuery);
  let { match_id, match, year } = dbObject;
  let s = {
    matchId: match_id,
    match: match,
    year: year,
  };
  response.send(s);
});

//5) GET
app.get("/players/:playerId/matches", async (request, response) => {
  try {
    let { playerId } = request.params;
    let getMatchesOfPlayersQuery = `
    SELECT 
        *
    FROM 
        match_details LEFT JOIN player_match_score 
        ON  match_details.match_id = player_match_score.player_id
    WHERE 
        player_id = ${playerId};`; /*where player_match_id =*/
    let dbObject = await db.all(getMatchesOfPlayersQuery);

    let myArray = [];
    for (let object of dbObject) {
      let { match_id, match, year } = object;
      let s = {
        matchId: match_id,
        match: match,
        year: year,
      };
      myArray.push(s);
    }

    response.send(myArray);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});

//6) GET
app.get("/matches/:matchId/players", async (request, response) => {
  let { matchId } = request.params;
  let getPlayersOfSpecificMatch = `
    SELECT 
    * 
    FROM 
        player_details INNER JOIN player_match_score
        ON player_details.player_id = player_match_score.player_id
    WHERE 
        match_id = ${matchId};
  `;
  let dbObject = await db.all(getPlayersOfSpecificMatch);

  let myArray = [];
  for (let object of dbObject) {
    let { player_id, player_name } = object;
    let s = {
      playerId: player_id,
      playerName: player_name,
    };
    myArray.push(s);
  }
  response.send(myArray);
});

//7) GET
app.get("/players/:playerId/playerScores", async (request, response) => {
  try {
    let { playerId } = request.params;

    let getStatisticsQuery = `
    SELECT 
        *
    FROM 
        player_details INNER JOIN player_match_score
        ON player_details.player_id = player_match_score.player_id
    WHERE 
        player_match_id = ${playerId};
  `;

    let dbObject = await db.get(getStatisticsQuery);

    let { player_id, player_name, score, fours, sixes } = dbObject;
    let s = {
      playerId: player_id,
      playerName: player_name,
      totalScore: score,
      totalFours: fours,
      totalSixes: sixes,
    };

    response.send(s);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});
