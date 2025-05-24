"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, User, Mail, Calendar, Bell, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"

interface Profile {
  id: string
  name: string
  created_at: string
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [name, setName] = useState("")
  const { toast } = useToast()

  async function loadProfile() {
    if (!user) return

    try {
      // First check if the profile exists
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id)

      if (error) {
        console.error("Error fetching profiles:", error)
        return
      }

      // If profile exists, use it
      if (data && data.length > 0) {
        console.log("Profile found, using existing profile")
        setProfile(data[0])
        setName(data[0].name || "")
        return
      }

      // If no profile exists, create one using upsert to avoid duplicate key errors
      console.log("No profile found, creating a new one")

      const newProfile = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        created_at: new Date().toISOString(),
      }

      // Use upsert with onConflict to handle potential race conditions
      const { error: upsertError } = await supabase.from("profiles").upsert(newProfile, { onConflict: "id" })

      if (upsertError) {
        console.error("Error creating profile:", upsertError)
        return
      }

      // Fetch the profile again to ensure we have the latest data
      const { data: updatedData, error: refetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (refetchError) {
        console.error("Error fetching updated profile:", refetchError)
        return
      }

      setProfile(updatedData)
      setName(updatedData.name || "")
    } catch (error) {
      console.error("Error in profile fetch:", error)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && user) {
      loadProfile()
    } else if (!isLoading && !user) {
      setProfileLoading(false)
    }
  }, [user, isLoading])

  if (!isLoading && !user) {
    redirect("/login?redirect=/profile")
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    setIsUpdating(true)
    try {
      const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          name,
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading || profileLoading) {
    return (
      <main className="min-h-screen bg-[#f9f5f0] py-16">
        <div className="container px-4 mx-auto max-w-7xl">
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-playfair">Loading Profile...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f9f5f0] py-16">
      <div className="container px-4 mx-auto max-w-7xl">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-playfair">Your Profile</CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
                        </div>
                        <p className="text-xs text-muted-foreground">To change your email, please contact support.</p>
                      </div>

                      <Button
                        onClick={handleUpdateProfile}
                        disabled={isUpdating || name === profile?.name}
                        className="w-full mt-2"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Member Since</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(user?.created_at || profile?.created_at || Date.now()).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
                        <Shield className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Account Status</p>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dining Preferences</CardTitle>
                    <CardDescription>Customize your experience with Muy Bon Directory</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-sm font-medium">Favorite Cuisines</h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {["Italian", "Japanese", "Mexican", "Indian", "French", "Thai"].map((cuisine) => (
                          <div key={cuisine} className="flex items-center space-x-2">
                            <input type="checkbox" id={`cuisine-${cuisine}`} className="rounded text-primary" />
                            <Label htmlFor={`cuisine-${cuisine}`}>{cuisine}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-3 text-sm font-medium">Preferred Locations</h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {["Shoreditch", "Hackney", "Soho", "Covent Garden", "Islington", "Mayfair"].map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <input type="checkbox" id={`location-${location}`} className="rounded text-primary" />
                            <Label htmlFor={`location-${location}`}>{location}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-3 text-sm font-medium">Price Range</h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {["£", "££", "£££", "££££"].map((price) => (
                          <div key={price} className="flex items-center space-x-2">
                            <input type="checkbox" id={`price-${price}`} className="rounded text-primary" />
                            <Label htmlFor={`price-${price}`}>{price}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full">Save Preferences</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notification Settings</CardTitle>
                    <CardDescription>Control how and when you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-medium">Email Notifications</h3>
                          <p className="text-xs text-muted-foreground">Receive updates via email</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-medium">New Restaurant Alerts</h3>
                          <p className="text-xs text-muted-foreground">Get notified about new restaurants</p>
                        </div>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-medium">Special Offers</h3>
                          <p className="text-xs text-muted-foreground">Receive special offers and promotions</p>
                        </div>
                        <input type="checkbox" className="toggle" />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-medium">Newsletter</h3>
                          <p className="text-xs text-muted-foreground">Weekly digest of top restaurants</p>
                        </div>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </div>
                    </div>

                    <Button className="w-full">Save Notification Settings</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Settings</CardTitle>
                    <CardDescription>Manage your account security and privacy</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="mb-2 text-sm font-medium">Change Password</h3>
                        <div className="space-y-2">
                          <Input type="password" placeholder="Current password" />
                          <Input type="password" placeholder="New password" />
                          <Input type="password" placeholder="Confirm new password" />
                        </div>
                        <Button className="mt-2 w-full">Update Password</Button>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="mb-2 text-sm font-medium">Two-Factor Authentication</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          Add an extra layer of security to your account
                        </p>
                        <Button variant="outline" className="w-full">
                          Enable 2FA
                        </Button>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="mb-2 text-sm font-medium">Delete Account</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          Permanently delete your account and all associated data
                        </p>
                        <Button variant="destructive" className="w-full">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
