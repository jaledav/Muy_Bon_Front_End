"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PopularTimesProps {
  popularTimes: Record<string, any>
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

  // Parse the popular times data - handle different possible structures
  function parsePopularTimesData(data: Record<string, any>) {
    if (!data || typeof data !== "object") {
      return []
    }

    // If data is already in the expected format
    if (data[selectedDay] && Array.isArray(data[selectedDay])) {
      return data[selectedDay]
    }

    // Try to find data for the selected day in different formats
    const dayKey = selectedDay.toLowerCase()
    if (data[dayKey] && Array.isArray(data[dayKey])) {
      return data[dayKey]
    }

    // Try abbreviated day names
    const dayAbbr = selectedDay.substring(0, 3).toLowerCase()
    if (data[dayAbbr] && Array.isArray(data[dayAbbr])) {
      return data[dayAbbr]
    }

    // Try to parse if it's a nested structure
    if (typeof data === "object") {
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes(dayKey) && Array.isArray(value)) {
          return value
        }
      }
    }

    return []
  }

  const dayData = parsePopularTimesData(popularTimes)

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
          <div className="flex items-end h-40 gap-1 mb-4 bg-gray-50 p-4 rounded-lg">
            {dayData.map((timeSlot: any, index: number) => {
              const height = timeSlot.occupancyPercent || timeSlot.popularity || timeSlot.busy || 0
              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-primary rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${Math.max(height, 2)}%`,
                      minHeight: "2px",
                    }}
                    title={`${formatHour(timeSlot.hour || index + 6)}: ${Math.round(height)}% busy`}
                  ></div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-1 mb-4">
            {dayData.map((timeSlot: any, index: number) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-xs text-muted-foreground">{formatHour(timeSlot.hour || index + 6)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Less busy</span>
            <span>More busy</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-muted-foreground bg-gray-50 rounded-lg">
          <div className="text-center">
            <p>No data available for {selectedDay}</p>
            <p className="text-xs mt-1">Popular times information not provided</p>
          </div>
        </div>
      )}
    </div>
  )
}
