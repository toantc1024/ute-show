"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useSupabase } from "./supabase-provider"
import type { Database } from "@/lib/database.types"

type Event = Database["public"]["Tables"]["events"]["Row"]

interface EventContextType {
  selectedEventId: string | null
  setSelectedEventId: (id: string | null) => void
  events: Event[]
  activeEvent: Event | null
  loading: boolean
  refreshEvents: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

    if (data && data.length > 0) {
      const typedEvents = data as Event[]
      setEvents(typedEvents)
      
      if (!selectedEventId) {
        const active = typedEvents.find(e => e.is_active) || typedEvents[0]
        setSelectedEventId(active.id)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
    
    // Real-time updates for events
    const sub = supabase
      .channel("events_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchEvents())
      .subscribe()
      
    return () => { supabase.removeChannel(sub) }
  }, [supabase])

  const activeEvent = events.find(e => e.id === selectedEventId) || null

  return (
    <EventContext.Provider 
      value={{ 
        selectedEventId, 
        setSelectedEventId, 
        events, 
        activeEvent, 
        loading, 
        refreshEvents: fetchEvents 
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEvent() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error("useEvent must be used within an EventProvider")
  }
  return context
}
