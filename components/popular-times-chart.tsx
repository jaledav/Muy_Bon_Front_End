"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PopularTimesProps {
  popularTimes: {
    [key: string]: Array<{
      hour: number
      occupancyPercent: number
    }>
  }
}

export default function PopularTimesChart({ popularTimes }: PopularTimesProps) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const [selectedDay, setSelectedDay] = useState(getCurrentDay())

  function getCurrentDay() {
    const today = new Date().getDay()
    // Convert from 0-6 (Sunday-Saturday) to our days array
    return days[today === 0 ? 6 : today - 1]
  }

  function formatHour(hour: number) {
    if (hour === 0) return "12 AM"
    if (hour === 12) return "12 PM"
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  const dayData = popularTimes[selectedDay] || []

  return (
    <div>
      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="mb-6">
        <TabsList className="grid w-full grid-cols-7">
          {days.map((day) => (
            <TabsTrigger key={day} value={day} className="text-xs sm:text-sm">
              {day.substring(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {dayData.length > 0 ? (
        <div>
          <div className="flex items-end h-40 gap-2 mb-2">
            {dayData.map((timeSlot, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary rounded-t"
                  style={{
                    height: `${timeSlot.occupancyPercent}%`,
                    minHeight: "4px",
                    opacity: 0.8,
                  }}
                ></div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {dayData.map((timeSlot, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-xs">{formatHour(timeSlot.hour)}</span>
              </div>
            ))}
          </div>

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
