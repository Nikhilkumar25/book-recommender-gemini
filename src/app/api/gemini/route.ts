import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  // const PROMPT =
  //   "Generate 5 book recommendations attached with their author name based on the parameters provided, return in JSON format, just the book names attached with the author name through the following format: [ {book name} by {author name}, { a creative description of book - one line } ], the factors of recommendations are :";

  const PROMPT = "Generate 5 book recommendations attached with their author name based on the parameters provided, return in text format, just the book names attached with the author name through the following format: {book name} by {author name}, { a creative description of book - one line }, the factors of recommendations are :";
  
  try {
    //const { prompt } = await req.json();
    const getData = await req.json();
    const prompt = getData.answers;

    //const prompt = "fiction, short(under 300 pages) ,fast-paced, morderate complexity";

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content with properly formatted input (an array of prompts)
    //const result = await model.generateContent([ PROMPT, { text: prompt }]);

    const userInputPrompt = PROMPT + JSON.stringify(prompt);

    console.log("submitted prompt:", userInputPrompt);

    const result = await model.generateContent([userInputPrompt]);

    // Check if there's a response and if it has a 'text' property
    if (result?.response?.text()) {
      // Extract the text response
      const response = result.response;
      const responseText = response.text();

      // Parse the response into a structured format

      // const recommendations =
      //   responseText
      //     .replace(/[\[\]']+/g, "") // Remove square brackets and any unwanted quotes
      //     .replace(/"book name": "([^"]+)"/g, '"$1"')
      //     .split("\n")
      //     .filter((line) => line.trim())
      //     .map((line) => line.replace(/^\d+\.\s*/, ""))
      //     .filter((line) => line.length > 0);

      const recommendations =
        responseText
          .replace(/[\[\]']+/g, "") // Remove square brackets and any unwanted quotes
          //.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")// Bold text between ** and remove **
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/"book name": "([^"]+)"/g, '"$1"')
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => line.replace(/^\d+\.\s*/, ""))
          .filter((line) => line.length > 0);


      // const recommendations2 =
      //   responseText.match(/```json\n([\s\S]*)\n```/)?.[1] ||
      //   "{}"
      //     .replace(/"([^"]+)" by ([^,]+)/g, '"$1" by $2') // Keep the format as is
      //     .split("\n")
      //     .filter((line) => line.trim())
      //     .map((line) => line.replace(/^\d+\.\s*/, ""))
      //     .filter((line) => line.length > 0);

      console.log("Gemini API return:", responseText);
      console.log("we truned it into:", recommendations);
      // console.log("we truned it into:", recommendations2);

      //const recommendations = responseText;

      return NextResponse.json({ recommendations });
    } else {
      throw new Error("No valid text response from Gemini API.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 },
    );
  }
}
