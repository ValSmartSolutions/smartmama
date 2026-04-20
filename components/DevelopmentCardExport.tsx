type ExportLog = {
  id: string;
  type: string;
  title: string;
  created_at: string;
  value_number: number | null;
  value_text: string | null;
  description: string | null;
};

function formatType(type: string) {
  switch (type) {
    case "word":
      return "Нова дума";
    case "sleep":
      return "Сън";
    case "growth":
      return "Растеж";
    case "skill":
      return "Ново умение";
    default:
      return "Бележка";
  }
}

function renderLogLine(log: ExportLog) {
  if (log.type === "growth" && log.value_number !== null) {
    if (log.value_text === "height") return `Ръст: ${log.value_number} см`;
    if (log.value_text === "weight") return `Тегло: ${log.value_number} кг`;
  }

  if (log.type === "sleep" && log.value_number !== null) {
    return `Заспа за ${log.value_number} минути`;
  }

  if (log.type === "word" && log.value_text) {
    return `Каза: ${log.value_text}`;
  }

  if (log.type === "skill" && log.value_text) {
    return `Ново умение: ${log.value_text}`;
  }

  return log.description || "";
}

function getTypeIcon(type: string) {
  switch (type) {
    case "word":
      return "🗣️";
    case "sleep":
      return "😴";
    case "growth":
      return "📏";
    case "skill":
      return "✨";
    default:
      return "📝";
  }
}

export default function DevelopmentCardExport({
  childName,
  birthDate,
  zodiac,
  latestHeight,
  latestWeight,
  words,
  skills,
  sleepMinutes,
  logs,
}: {
  childName: string;
  birthDate: string;
  zodiac: string;
  latestHeight: string;
  latestWeight: string;
  words: string[];
  skills: string[];
  sleepMinutes: string;
  logs: ExportLog[];
}) {
  return (
    <div
      id="development-card-export"
      style={{
        width: "1240px",
        minHeight: "1754px",
        background: "linear-gradient(135deg, #fff9fb 0%, #ffffff 45%, #f4f8ff 100%)",
        padding: "48px",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid #f1e4dc",
          borderRadius: "36px",
          padding: "42px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", gap: "28px", alignItems: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "32px",
              background: "linear-gradient(135deg, #f9a8d4, #93c5fd)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
              fontWeight: 800,
              boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
              flexShrink: 0,
            }}
          >
            {(childName || "Д").charAt(0).toUpperCase()}
          </div>

          <div>
            <div
              style={{
                display: "inline-block",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "#fff1f6",
                color: "#db2777",
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              ✨ Карта на развитието
            </div>

            <h1 style={{ fontSize: "56px", lineHeight: 1, margin: 0, fontWeight: 800 }}>
              {childName}
            </h1>

            <p style={{ marginTop: "12px", fontSize: "22px", color: "#6b7280" }}>
              Малките победи, които си струва да останат запазени.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {[
            ["Дата на раждане", birthDate],
            ["Зодия", zodiac],
            ["Последен ръст", latestHeight],
            ["Последно тегло", latestWeight],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "white",
                border: "1px solid #f1e4dc",
                borderRadius: "24px",
                padding: "20px",
              }}
            >
              <div style={{ fontSize: "12px", textTransform: "uppercase", color: "#6b7280", marginBottom: "8px" }}>
                {label}
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderRadius: "28px",
            background: "linear-gradient(135deg,#fff7fb 0%,#ffffff 100%)",
            border: "1px solid #f8cddd",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ margin: "0 0 12px 0", fontSize: "28px", fontWeight: 700 }}>💌 Кратко описание</h2>
          <p style={{ margin: 0, fontSize: "21px", lineHeight: 1.7, color: "#374151" }}>
            {childName} расте с красиви малки крачки всеки ден. Тази карта събира ценни моменти,
            нови умения, първи думи и важни победи в един нежен спомен за семейството.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ background: "white", border: "1px solid #f1e4dc", borderRadius: "24px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "26px" }}>🗣️ Първи думи</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {words.length ? words.map((w) => (
                <span
                  key={w}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    background: "#fdf2f8",
                    color: "#db2777",
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {w}
                </span>
              )) : <span style={{ color: "#6b7280", fontSize: "18px" }}>Няма данни</span>}
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #f1e4dc", borderRadius: "24px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "26px" }}>✨ Умения</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {skills.length ? skills.map((s) => (
                <div
                  key={s}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "16px",
                    background: "#fffbeb",
                    color: "#92400e",
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {s}
                </div>
              )) : <span style={{ color: "#6b7280", fontSize: "18px" }}>Няма данни</span>}
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #f1e4dc", borderRadius: "24px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "26px" }}>😴 Сън</h3>
            <div
              style={{
                borderRadius: "20px",
                background: "#eff6ff",
                padding: "18px",
              }}
            >
              <div style={{ fontSize: "34px", fontWeight: 800, color: "#2563eb" }}>
                {sleepMinutes}
              </div>
              <div style={{ fontSize: "18px", color: "#2563eb", marginTop: "8px" }}>
                последно време за заспиване
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: 800 }}>🌟 Важни моменти</h2>
            <div
              style={{
                background: "#f3f4f6",
                borderRadius: "999px",
                padding: "8px 14px",
                fontSize: "16px",
                color: "#4b5563",
              }}
            >
              {logs.length} записа
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {logs.map((log, index) => (
              <div key={log.id} style={{ position: "relative", paddingLeft: "34px" }}>
                {index !== logs.length - 1 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "28px",
                      bottom: "-20px",
                      width: "2px",
                      background: "linear-gradient(to bottom, #f9a8d4, #93c5fd)",
                    }}
                  />
                ) : null}

                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 4,
                    width: "26px",
                    height: "26px",
                    borderRadius: "999px",
                    background: "white",
                    border: "2px solid #f9a8d4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                  }}
                >
                  {getTypeIcon(log.type)}
                </div>

                <div
                  style={{
                    background: "white",
                    border: "1px solid #f1e4dc",
                    borderRadius: "24px",
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <div style={{ fontSize: "24px", fontWeight: 700 }}>{log.title}</div>
                    <div
                      style={{
                        background: "#f3f4f6",
                        borderRadius: "999px",
                        padding: "6px 12px",
                        fontSize: "14px",
                        color: "#4b5563",
                      }}
                    >
                      {formatType(log.type)}
                    </div>
                  </div>

                  <div style={{ fontSize: "15px", color: "#6b7280", marginBottom: "10px" }}>
                    {new Date(log.created_at).toLocaleDateString("bg-BG")}
                  </div>

                  <div style={{ fontSize: "20px", color: "#374151", lineHeight: 1.6 }}>
                    {renderLogLine(log)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}