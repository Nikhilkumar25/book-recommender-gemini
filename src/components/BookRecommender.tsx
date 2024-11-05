"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface Question {
  id: "genre" | "length" | "pace" | "complexity";
  text: string;
  options: string[];
}

interface Answers {
  genre?: string;
  length?: string;
  pace?: string;
  complexity?: string;
}

const BookRecommender: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions: Question[] = [
    {
      id: "genre",
      text: "What type of books do you prefer?",
      options: [
        "Fiction",
        "Non-Fiction",
        "Mystery",
        "Science Fiction",
        "Romance",
      ],
    },
    {
      id: "length",
      text: "What length of book do you prefer?",
      options: [
        "Short (under 300 pages)",
        "Medium (300-500 pages)",
        "Long (500+ pages)",
      ],
    },
    {
      id: "pace",
      text: "What reading pace do you enjoy?",
      options: ["Fast-paced", "Moderate", "Slow and detailed"],
    },
    {
      id: "complexity",
      text: "What level of complexity do you prefer?",
      options: ["Light and easy", "Moderate", "Complex and challenging"],
    },
  ];

  const bookRecommendations = {
    Fiction: {
      "Short (under 300 pages)": {
        "Fast-paced": {
          "Light and easy": [
            "The Old Man and the Sea by Ernest Hemingway",
            "Animal Farm by George Orwell",
          ],
          Moderate: [
            "The Great Gatsby by F. Scott Fitzgerald",
            "Of Mice and Men by John Steinbeck",
          ],
          "Complex and challenging": [
            "Heart of Darkness by Joseph Conrad",
            "The Metamorphosis by Franz Kafka",
          ],
        },
        Moderate: {
          "Light and easy": [
            "The Alchemist by Paulo Coelho",
            "The Little Prince by Antoine de Saint-Exupéry",
          ],
          Moderate: [
            "The Pearl by John Steinbeck",
            "Chronicle of a Death Foretold by Gabriel García Márquez",
          ],
          "Complex and challenging": [
            "Notes from Underground by Fyodor Dostoevsky",
            "The Stranger by Albert Camus",
          ],
        },
        "Slow and detailed": {
          "Light and easy": [
            "The House on Mango Street by Sandra Cisneros",
            "The Ocean at the End of the Lane by Neil Gaiman",
          ],
          Moderate: [
            "The Yellow Wallpaper by Charlotte Perkins Gilman",
            "We Have Always Lived in the Castle by Shirley Jackson",
          ],
          "Complex and challenging": [
            "The Turn of the Screw by Henry James",
            "The Death of Ivan Ilyich by Leo Tolstoy",
          ],
        },
      },
      "Medium (300-500 pages)": {
        "Fast-paced": {
          "Light and easy": [
            "The Hitchhiker's Guide to the Galaxy by Douglas Adams",
            "Good Omens by Terry Pratchett",
          ],
          Moderate: ["1984 by George Orwell", "Fahrenheit 451 by Ray Bradbury"],
          "Complex and challenging": [
            "Brave New World by Aldous Huxley",
            "A Clockwork Orange by Anthony Burgess",
          ],
        },
        Moderate: {
          "Light and easy": [
            "The Secret Life of Bees by Sue Monk Kidd",
            "The No. 1 Ladies' Detective Agency by Alexander McCall Smith",
          ],
          Moderate: [
            "The Handmaid's Tale by Margaret Atwood",
            "The Bell Jar by Sylvia Plath",
          ],
          "Complex and challenging": [
            "One Hundred Years of Solitude by Gabriel García Márquez",
            "Beloved by Toni Morrison",
          ],
        },
        "Slow and detailed": {
          "Light and easy": [
            "A Tree Grows in Brooklyn by Betty Smith",
            "The Secret Garden by Frances Hodgson Burnett",
          ],
          Moderate: [
            "Jane Eyre by Charlotte Brontë",
            "Pride and Prejudice by Jane Austen",
          ],
          "Complex and challenging": [
            "The Sound and the Fury by William Faulkner",
            "To the Lighthouse by Virginia Woolf",
          ],
        },
      },
      "Long (500+ pages)": {
        "Fast-paced": {
          "Light and easy": [
            "The Name of the Wind by Patrick Rothfuss",
            "The Way of Kings by Brandon Sanderson",
          ],
          Moderate: [
            "The Count of Monte Cristo by Alexandre Dumas",
            "The Stand by Stephen King",
          ],
          "Complex and challenging": [
            "Infinite Jest by David Foster Wallace",
            "Gravity's Rainbow by Thomas Pynchon",
          ],
        },
        Moderate: {
          "Light and easy": [
            "The Time Traveler's Wife by Audrey Niffenegger",
            "The Night Circus by Erin Morgenstern",
          ],
          Moderate: [
            "East of Eden by John Steinbeck",
            "The Goldfinch by Donna Tartt",
          ],
          "Complex and challenging": [
            "War and Peace by Leo Tolstoy",
            "Don Quixote by Miguel de Cervantes",
          ],
        },
        "Slow and detailed": {
          "Light and easy": [
            "The Pillars of the Earth by Ken Follett",
            "The Shadow of the Wind by Carlos Ruiz Zafón",
          ],
          Moderate: [
            "Les Misérables by Victor Hugo",
            "The Brothers Karamazov by Fyodor Dostoevsky",
          ],
          "Complex and challenging": [
            "Ulysses by James Joyce",
            "In Search of Lost Time by Marcel Proust",
          ],
        },
      },
    },
    // Add more genres with their respective recommendations
  };

  const handleAnswer = (answer: string) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResults(true);
      fetchAIRecommendations();
    }
  };

  const fetchAIRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({answers}),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI recommendations");
      }

      const data = await response.json();
      setAiRecommendations(data.recommendations);
    
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getCuratedRecommendations = () => {
    const { genre, length, pace, complexity } = answers;
    console.log("Locally submitted prompt - real: ", answers);
    if (!genre || !length || !pace || !complexity) return [];

    return bookRecommendations[genre]?.[length]?.[pace]?.[complexity] || [];
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setAiRecommendations([]);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {!showResults ? (
        <Card className="w-full">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">
              {questions[currentQuestion].text}
            </h2>
            <RadioGroup onValueChange={handleAnswer} className="space-y-3">
              {questions[currentQuestion].options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ) : (
        <div>
          <Card className="w-full mb-4">
            <CardContent className="pt-6">
              <Tabs defaultValue="ai">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="curated" className="flex-1">
                    Curated Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex-1">
                    AI Recommendations
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="curated">
                  <h3 className="text-xl font-semibold mb-4">
                    Based on your preferences:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {getCuratedRecommendations().map((book, index) => (
                      <li key={index}>{book}</li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="ai">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">
                        Generating recommendations...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 p-4">{error}</div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        AI-Generated Recommendations:
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        {aiRecommendations.map((book, index) => (
                          <li key={index}>{book}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Button onClick={resetQuiz} className="w-full">
            Start Over
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookRecommender;
