
import express from 'express';

const router = express.Router();

router.get("/", async (req, res)=>{
    try{

        const responsFromApi = await fetch(`https://api.api-ninjas.com/v1/stars?max_distance_light_year=10000`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": process.env.API_KEY, 
          "Content-Type": "application/json",
        },
      }
    );
    if(!responsFromApi.ok){
        return res.status(400).json({error:"Error fetching data from API"})
    }

    const data = await responsFromApi.json()

    if(data.length===0){
        return res.status(400).json({message:"No stars found", data:data})
    }

    return res.json({ 
      message: "Stars fetched successfully", 
      data: data 
    });

    }catch(error){
        return res.status(400).json({error:"Internal Server Error"})
    }
})


router.get("/topstars", async (req, res)=>{
    try{

        const responsFromApi = await fetch(`https://api.api-ninjas.com/v1/stars?max_distance_light_year=5000`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": process.env.API_KEY, 
          "Content-Type": "application/json",
        },
      }
    );
    if(!responsFromApi.ok){
        return res.status(400).json({error:"Error fetching data from API"})
    }

    const data = await responsFromApi.json()

    if(data.length===0){
        return res.status(400).json({message:"No stars found", data:data})
    }

    return res.json({ 
      message: "Stars fetched successfully", 
      data: data 
    });

    }catch(error){
        return res.status(400).json({error:"Internal Server Error"})
    }
})

router.get('/constellation', async (req, res) => {
  const { constellation } = req.query;

  if (!constellation) {
    return res.status(400).json({ error: "Constellation parameter is required." });
  }

  try {
    const apiResponse = await fetch(
      `https://api.api-ninjas.com/v1/stars?constellation=${constellation}`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": process.env.API_KEY, 
          "Content-Type": "application/json",
        },
      }
    );

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ 
        error: "Failed to fetch stars." 
      });
    }

    const data = await apiResponse.json();

    if (data.length === 0) {
      return res.status(404).json({ 
        message: "No stars found for this constellation.", 
        data: [] 
      });
    }

    return res.json({ 
      message: "Stars by constellation fetched successfully", 
      data: data 
    });

  } catch (error) {
    console.error("Error fetching stars:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;