import { Button } from "@monotodo/ui/components/button";
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-7xl font-bold tracking-tight">Vite + React</h1>
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
      </div>
    </main>
  );
}

export default App;
