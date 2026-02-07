import { useEffect, useState } from "react";

type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export function App() {
  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      hasTelegram: Boolean((window as any).Telegram),
      hasWebApp: Boolean((window as any).Telegram?.WebApp),
      initData: (window as any).Telegram?.WebApp?.initData ?? null,
      platform: (window as any).Telegram?.WebApp?.platform ?? null,
      version: (window as any).Telegram?.WebApp?.version ?? null,
    };
  
    console.log("TG DEBUG:", info);
  
    const pre = document.createElement("pre");
    pre.style.color = "white";
    pre.style.padding = "12px";
    pre.style.fontSize = "12px";
    pre.style.whiteSpace = "pre-wrap";
    pre.textContent = JSON.stringify(info, null, 2);
  
    document.body.appendChild(pre);
  }, []);
  
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<TgUser | null>(null);
  const [platform, setPlatform] = useState<string>("unknown");
  const [theme, setTheme] = useState<string>("unknown");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.warn("Telegram WebApp SDK not found");
      return;
    }

    tg.ready();
    tg.expand();

    setIsTelegram(true);
    setPlatform(tg.platform);
    setTheme(tg.colorScheme);
    setUser(tg.initDataUnsafe?.user ?? null);

    console.log("Telegram WebApp initData:", tg.initDataUnsafe);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 320 }}>
        <h2 style={{ marginBottom: 12 }}>🚀 React is alive</h2>

        {isTelegram ? (
          <>
            <p style={{ color: "#22c55e" }}>✅ Telegram Mini App</p>
            <p>Platform: {platform}</p>
            <p>Theme: {theme}</p>

            {user ? (
              <p>
                User:{" "}
                {user.username
                  ? `@${user.username}`
                  : user.first_name ?? "unknown"}
              </p>
            ) : (
              <p>User: not available</p>
            )}
          </>
        ) : (
          <>
            <p style={{ color: "#facc15" }}>⚠️ Not in Telegram</p>
            <p>Opened in regular browser</p>
          </>
        )}
      </div>
    </div>
  );
}
