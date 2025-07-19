// Quote service for fetching daily inspirational quotes
const ZENQUOTES_API = 'https://zenquotes.io/api/random';
const QUOTABLE_API = 'https://api.quotable.io/random';

export const getQuote = async () => {
  try {
    // Try Quotable API first (more reliable with CORS)
    const response = await fetch(QUOTABLE_API);
    if (response.ok) {
      const data = await response.json();
      return {
        text: data.content,
        author: data.author
      };
    }
  } catch (error) {
    console.log('Quotable API failed, trying fallback...');
  }

  try {
    // Fallback to ZenQuotes (may have CORS issues)
    const response = await fetch(ZENQUOTES_API);
    if (response.ok) {
      const data = await response.json();
      return {
        text: data[0].q,
        author: data[0].a
      };
    }
  } catch (error) {
    console.log('ZenQuotes API failed, using fallback quote...');
  }

  // Fallback quotes if APIs fail
  const fallbackQuotes = [
    {
      text: "The journey of a thousand miles begins with a single step.",
      author: "Lao Tzu"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "Life is what happens to you while you're busy making other plans.",
      author: "John Lennon"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    }
  ];

  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
  return fallbackQuotes[randomIndex];
};
