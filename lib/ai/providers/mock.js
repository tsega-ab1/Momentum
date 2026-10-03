export async function sendMessage(apiKey, model, messages) {
  const last = messages[messages.length - 1]?.content || "";

  if (last.includes("__GENERATE_ROUTINE__")) {
    return JSON.stringify({
      title: "Balanced Daily Routine",
      items: [
        { time: "06:30", activity: "Wake up & hydrate" },
        { time: "07:00", activity: "Morning routine" },
        { time: "09:00", activity: "Deep work / Job search" },
        { time: "12:30", activity: "Lunch & break" },
        { time: "15:00", activity: "Skill building" },
        { time: "19:00", activity: "Read / Learn" },
        { time: "21:30", activity: "Wind down" },
        { time: "22:30", activity: "Sleep" },
      ],
    });
  }

  return "Got it! Tell me more about your goals, or tap \"Generate Routine\" whenever you're ready.";
}
