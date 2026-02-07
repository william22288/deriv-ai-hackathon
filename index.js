const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const fs = require("fs"); // Import the File System module

// ==========================================
// 1. PASTE YOUR API KEY HERE
// ==========================================
const apiKey = "-"; 

const genAI = new GoogleGenerativeAI(apiKey);

// Helper to pause execution (Rate Limiter)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const hrSchema = {
  type: SchemaType.OBJECT,
  properties: {
    country: { type: SchemaType.STRING },
    lastUpdated: { type: SchemaType.STRING },
    laborLaws: {
      type: SchemaType.OBJECT,
      properties: {
        minimumWage: { type: SchemaType.STRING },
        workingHours: { type: SchemaType.STRING },
        probationPeriod: { type: SchemaType.STRING },
        mandatoryContributions: { 
          type: SchemaType.ARRAY, 
          items: { type: SchemaType.STRING } 
        }
      }
    }
  },
  required: ["country", "laborLaws"]
};

async function getLaborLaws(countryName) {
  // Use a stable model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", 
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: hrSchema,
    },
  });

  const prompt = `
    You are an HR Legal Expert. 
    Provide the standard employment labor laws for ${countryName} as of 2025/2026.
    Include minimum wage, standard hours, probation period, and mandatory deductions.
  `;

  console.log(`Processing ${countryName}...`);

  try {
    const result = await model.generateContent(prompt);
    const jsonString = await result.response.text();
    return JSON.parse(jsonString); // Convert text to Object
  } catch (error) {
    console.error(`❌ Error fetching ${countryName}:`, error.message);
    return null;
  }
}

async function runScraper() {
  const countries = ["Malaysia", "Singapore", "Indonesia", "Thailand"];
  const allData = [];

  console.log("🚀 Starting HR Data Extraction...\n");

  for (const country of countries) {
    const data = await getLaborLaws(country);
    
    if (data) {
      console.log(`✅ Fetched: ${country}`);
      allData.push(data);
    }

    // Rate Limiter: Wait 4 seconds to stay safe
    if (country !== countries[countries.length - 1]) {
        console.log("⏳ Waiting 4s to avoid rate limits...");
        await sleep(4000); 
    }
  }

  // ==========================================
  // SAVE TO JSON FILE
  // ==========================================
  const fileName = "hr_data.json";
  
  try {
    // null, 2 makes the JSON readable (pretty print)
    fs.writeFileSync(fileName, JSON.stringify(allData, null, 2)); 
    console.log(`\n🎉 SUCCESS! Data saved to: ${fileName}`);
  } catch (err) {
    console.error("❌ Error writing file:", err);
  }
}

// Check for API Key before running
if (apiKey === "YOUR_API_KEY_HERE" || !apiKey) {
    console.error("⛔ STOP: Please paste your API Key in line 7.");
} else {
    runScraper();
}