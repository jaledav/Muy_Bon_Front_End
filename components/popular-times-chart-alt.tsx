"use client"

import { useState } from "react"

interface PopularTimesProps {
  popularTimes: {
    [key: string]: Array<{
      hour: number
      occupancyPercent: number
    }>
  }
}

export default function PopularTimesChartAlt({ popularTimes }: PopularTimesProps) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const [selectedDay, setSelectedDay] = useState("Thursday") // Default to Thursday for demo

  function formatHour(hour: number) {
    if (hour === 0) return "12 AM"
    if (hour === 12) return "12 PM"
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  const dayData = popularTimes[selectedDay] || []

  // Simple table-based visualization
  return (
    <div>
      <div className="mb-6">
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`py-2 px-1 text-center text-sm rounded ${
                selectedDay === day ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {dayData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {dayData.map((slot, i) => (
                  <th key={i} className="text-xs font-normal text-center pb-2">
                    {formatHour(slot.hour)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {dayData.map((slot, i) => (
                  <td key={i} className="text-center">
                    <div className="mx-auto w-full">
                      <div
                        className="bg-primary mx-auto"
                        style={{
                          height: `${Math.max(4, slot.occupancyPercent / 2)}px`,
                          width: "80%",
                          borderRadius: "2px",
                          opacity: slot.occupancyPercent / 100,
                        }}
                      ></div>
                      <div className="mt-1 text-xs">{slot.occupancyPercent}%</div>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between mt-4">
            <span className="text-xs text-muted-foreground">Less busy</span>
            <span className="text-xs text-muted-foreground">More busy</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          No data available for {selectedDay}
        </div>
      )}
    </div>
  )
}
