// Word banks, quotes, and sample texts for Typing Speed Test

export const COMMON_WORDS = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "I", "with", "as", 
  "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "his", "from", "they", "say", "her", "she", 
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", 
  "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", 
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", 
  "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", 
  "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "great", "between",
  "need", "large", "system", "program", "world", "state", "place", "point", "city", "number", "water", "call", 
  "development", "group", "problem", "fact", "line", "hand", "high", "keep", "child", "power", "country", "night", 
  "house", "school", "company", "study", "side", "head", "far", "black", "long", "both", "little", "under", "name", 
  "very", "through", "form", "sentence", "help", "low", "line", "turn", "cause", "much", "mean", "before", "move", 
  "right", "boy", "old", "too", "same", "tell", "does", "set", "three", "want", "air", "well", "also", "play", 
  "small", "end", "put", "home", "read", "hand", "port", "large", "spell", "add", "even", "land", "here", "must", 
  "big", "high", "such", "follow", "act", "why", "ask", "men", "change", "went", "light", "kind", "off", "need", 
  "house", "picture", "try", "us", "again", "animal", "point", "mother", "world", "near", "build", "self", "earth", 
  "father", "any", "new", "work", "part", "take", "get", "place", "made", "live", "where", "after", "back", "little", 
  "only", "round", "man", "year", "came", "show", "every", "good", "me", "give", "our", "under", "name", "very", 
  "through", "just", "form", "sentence", "great", "think", "say", "help", "low", "line", "differ", "turn", "cause", 
  "much", "mean", "before", "move", "right", "boy", "old", "too", "same", "tell", "does", "set", "three", "want", 
  "air", "well", "also", "play", "small", "end", "put", "home", "read", "hand", "port", "large", "spell", "add", 
  "code", "system", "data", "future", "digital", "modern", "matrix", "stream", "design", "flow", "logic", "focus",
  "swift", "speed", "finger", "rapid", "smooth", "rhythm", "motion", "master", "action", "energy", "spark", "vision",
  "effort", "craft", "talent", "habit", "pursue", "create", "evolve", "elevate", "expand", "impact", "legend", "limit"
];

export const PUNCTUATION_POOL = [",", ".", "!", "?", ";", ":", "-", "\"", "'", "(", ")"];
export const NUMBERS_POOL = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "42", "100", "2024", "99", "365", "101"];

export const QUOTES = [
  {
    text: "Simplicity is prerequisite for reliability. Any intelligent fool can make things bigger and more complex.",
    author: "Edsger W. Dijkstra"
  },
  {
    text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    author: "Steve Jobs"
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson"
  },
  {
    text: "It is not that I'm so smart. But I stay with the questions much longer than others.",
    author: "Albert Einstein"
  },
  {
    text: "Talk is cheap. Show me the code. A good programmer looks both ways before crossing a one-way street.",
    author: "Linus Torvalds"
  },
  {
    text: "The future belongs to those who learn more skills and combine them in creative ways.",
    author: "Robert Greene"
  },
  {
    text: "Do not wait; the time will never be 'just right.' Start where you stand, and work with whatever tools you may have.",
    author: "George Herbert"
  },
  {
    text: "First, solve the problem. Then, write the code. Premature optimization is the root of all evil.",
    author: "John Johnson"
  },
  {
    text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry"
  },
  {
    text: "In the middle of difficulty lies opportunity. Keep your focus sharp and your hands steady.",
    author: "Albert Einstein"
  }
];

export const CODE_SNIPPETS = [
  {
    text: "const calculateSpeed = (chars, time) => ((chars / 5) / (time / 60)).toFixed(1);",
    author: "JavaScript"
  },
  {
    text: "async function fetchData(url) { const res = await fetch(url); return await res.json(); }",
    author: "Async JS"
  },
  {
    text: "const memoize = (fn) => { const cache = new Map(); return (x) => cache.get(x) ?? (cache.set(x, fn(x)), cache.get(x)); };",
    author: "Functional JS"
  },
  {
    text: "const [state, setState] = useState(() => calculateInitialValue(props.data));",
    author: "React Hooks"
  },
  {
    text: "document.addEventListener('keydown', (e) => { if (e.key === 'Escape') resetGame(); });",
    author: "DOM Events"
  }
];
