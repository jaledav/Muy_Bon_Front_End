"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts"

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

  // Updated formatHour to display AM only once at the beginning and PM at midday
  function formatHour(hour: number) {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour % 12} PM`;
  }

  // Parse the popular times data - handle different possible structures
  function parsePopularTimesData(data: Record<string, any>) {
    if (!data || typeof data !== "object") {
      return []
    }

    const dayAbbrTwoLetter = selectedDay.substring(0, 2)
    if (data[dayAbbrTwoLetter] && Array.isArray(data[dayAbbrTwoLetter])) {
      return data[dayAbbrTwoLetter]
    }

    if (data[selectedDay] && Array.isArray(data[selectedDay])) {
      return data[selectedDay]
    }

    const dayAbbrLower = selectedDay.substring(0, 3).toLowerCase()
    if (data[dayAbbrLower] && Array.isArray(data[dayAbbrLower])) {
      return data[dayAbbrLower]
    }

    const dayAbbrCapitalizedFirst = selectedDay.substring(0, 1).toUpperCase() + selectedDay.substring(1).toLowerCase()
    if (data[dayAbbrCapitalizedFirst] && Array.isArray(data[dayAbbrCapitalizedFirst])) {
      return data[dayAbbrCapitalizedFirst]
    }

    const dayKey = selectedDay.toLowerCase()
    if (data[dayKey] && Array.isArray(data[dayKey])) {
      return data[dayKey]
    }

    // Fallback: loop through keys to find a match containing the day name
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase().includes(dayKey) && Array.isArray(value)) {
        return value
      }
    }
    return []
  }

  console.log("parsePopularTimesData - selectedDay:", selectedDay)
  const rawDayData = parsePopularTimesData(popularTimes)
  console.log("PopularTimesChart - rawDayData:", rawDayData)

  const hoursInOrder = Array.from({ length: 24 }, (_, i) => (i + 6) % 24); // Start from 6 AM (hour 6) and wrap around
  const fullDayData = hoursInOrder.map((hour) => {
    const timeSlot = rawDayData.find((slot: any) => slot.hour === hour)
    return {
      hour: hour,
      occupancyPercent: timeSlot ? timeSlot.occupancyPercent : 0,
    }
  })

  console.log("PopularTimesChart - fullDayData:", fullDayData)

  // Define chart config for colors and labels
  const chartConfig = {
    occupancyPercent: {
      label: "Occupancy",
      color: "hsl(var(--primary))", // Use primary color from theme
    },
  } as const

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

      {fullDayData.length > 0 ? (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={fullDayData}>
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatHour(value)}
              ticks={hoursInOrder} // Explicitly set ticks to all hours in the desired range
            />
            <YAxis hide domain={[0, 100]} /> {/* Hide Y-axis, set domain */}
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="occupancyPercent" fill="var(--color-occupancyPercent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
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
