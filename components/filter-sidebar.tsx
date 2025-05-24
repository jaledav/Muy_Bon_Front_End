"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const locations = [
  "Shoreditch",
  "Hackney",
  "Soho",
  "Covent Garden",
  "Islington",
  "Dalston",
  "Brixton",
  "Peckham",
  "Newington Green",
  "Haggerston",
  "Regent Street",
  "Mayfair",
]

const vibes = [
  "Romantic",
  "Casual",
  "Fine Dining",
  "Buzzy",
  "Cozy",
  "Cool",
  "Family-friendly",
  "Wine Bar",
  "Outdoor Seating",
  "Hidden Gem",
  "Sophisticated",
  "Relaxed",
  "Trendy",
  "Upscale",
]

const cuisines = [
  "Mexican",
  "British",
  "Modern European",
  "Italian",
  "Spanish",
  "Japanese",
  "Turkish",
  "Indian",
  "Thai",
  "French",
  "Basque",
]

const publications = [
  "The Guardian",
  "Evening Standard",
  "Time Out",
  "The Telegraph",
  "The Sunday Times",
  "Financial Times",
  "Eater London",
]

const priceRanges = [
  { value: "£", label: "£ (Under £30)" },
  { value: "££", label: "££ (£30-£50)" },
  { value: "£££", label: "£££ (£50-£80)" },
  { value: "££££", label: "££££ (£80+)" },
]

const ratings = [
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
  { value: "1", label: "1+ Stars" },
]

export default function FilterSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openMobile, setOpenMobile] = useState(false)
  // Ensure searchParams is initialized here - REMOVED REDUNDANT DECLARATION

  // Helper to update URL search params
  const updateSearchParam = (name: string, value: string | string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(name, value.join(","))
      } else {
        params.delete(name)
      }
    } else {
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleCheckboxChange = (filterName: string, itemValue: string, checked: boolean | "indeterminate") => {
    const currentValues = searchParams.get(filterName)?.split(",") || []
    let newValues: string[]
    if (checked) {
      newValues = [...currentValues, itemValue]
    } else {
      newValues = currentValues.filter((v) => v !== itemValue)
    }
    updateSearchParam(filterName, newValues)
  }

  const handleRadioChange = (filterName: string, value: string) => {
    updateSearchParam(filterName, value === "all" ? "" : value)
  }

  return (
    <div className="sticky top-20">
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Collapsible open={openMobile} onOpenChange={setOpenMobile} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              {openMobile ? "Hide" : "Show"} filters
              <ChevronDown className={`w-4 h-4 transition-transform ${openMobile ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <FilterContent
              searchParams={searchParams}
              handleCheckboxChange={handleCheckboxChange}
              handleRadioChange={handleRadioChange}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="hidden md:block">
        <h3 className="mb-4 text-lg font-semibold">Filters</h3>
        <FilterContent
          searchParams={searchParams}
          handleCheckboxChange={handleCheckboxChange}
          handleRadioChange={handleRadioChange}
        />
      </div>
    </div>
  )
}

interface FilterContentProps {
  searchParams: URLSearchParams;
  handleCheckboxChange: (filterName: string, itemValue: string, checked: boolean | "indeterminate") => void;
  handleRadioChange: (filterName: string, value: string) => void;
}

function FilterContent({ searchParams, handleCheckboxChange, handleRadioChange }: FilterContentProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={["cuisine", "location", "vibe", "price", "rating", "publication"]}
      className="w-full"
    >
      <AccordionItem value="cuisine">
        <AccordionTrigger>Cuisine</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {cuisines.map((cuisine) => (
              <div key={cuisine} className="flex items-center space-x-2">
                <Checkbox
                  id={`cuisine-${cuisine}`}
                  checked={searchParams.get("cuisine")?.split(",").includes(cuisine) || false}
                  onCheckedChange={(checked) => handleCheckboxChange("cuisine", cuisine, checked)}
                />
                <Label htmlFor={`cuisine-${cuisine}`} className="text-sm">
                  {cuisine}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="location">
        <AccordionTrigger>Location</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox id={`location-${location}`} />
                <Label htmlFor={`location-${location}`} className="text-sm">
                  {location}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="vibe">
        <AccordionTrigger>Vibe</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {vibes.map((vibe) => (
              <div key={vibe} className="flex items-center space-x-2">
                <Checkbox
                  id={`vibe-${vibe}`}
                  checked={searchParams.get("vibe")?.split(",").includes(vibe) || false}
                  onCheckedChange={(checked) => handleCheckboxChange("vibe", vibe, checked)}
                />
                <Label htmlFor={`vibe-${vibe}`} className="text-sm">
                  {vibe}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="price">
        <AccordionTrigger>Price Range</AccordionTrigger>
        <AccordionContent>
          <RadioGroup
            value={searchParams.get("price") || "all"}
            onValueChange={(value) => handleRadioChange("price", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="price-all" />
              <Label htmlFor="price-all" className="text-sm">
                All prices
              </Label>
            </div>
            {priceRanges.map((price) => (
              <div key={price.value} className="flex items-center space-x-2">
                <RadioGroupItem value={price.value} id={`price-${price.value}`} />
                <Label htmlFor={`price-${price.value}`} className="text-sm">
                  {price.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rating">
        <AccordionTrigger>Rating</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            <div>
              <h4 className="mb-2 text-sm font-medium">Critic Rating</h4>
              <RadioGroup defaultValue="all">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="critic-all" />
                  <Label htmlFor="critic-all" className="text-sm">
                    Any rating
                  </Label>
                </div>
                {ratings.map((rating) => (
                  <div key={rating.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.value} id={`critic-${rating.value}`} />
                    <Label htmlFor={`critic-${rating.value}`} className="text-sm">
                      {rating.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Google Rating</h4>
              <RadioGroup defaultValue="all">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="google-all" />
                  <Label htmlFor="google-all" className="text-sm">
                    Any rating
                  </Label>
                </div>
                {ratings.map((rating) => (
                  <div key={rating.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.value} id={`google-${rating.value}`} />
                    <Label htmlFor={`google-${rating.value}`} className="text-sm">
                      {rating.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="publication">
        <AccordionTrigger>Publication</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {publications.map((publication) => (
              <div key={publication} className="flex items-center space-x-2">
                <Checkbox id={`publication-${publication}`} />
                <Label htmlFor={`publication-${publication}`} className="text-sm">
                  {publication}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="features">
        <AccordionTrigger>Features & Amenities</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Dining Options</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature-lunch" />
                  <Label htmlFor="feature-lunch" className="text-sm">
                    Lunch
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature-dinner" />
                  <Label htmlFor="feature-dinner" className="text-sm">
                    Dinner
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature-dessert" />
                  <Label htmlFor="feature-dessert" className="text-sm">
                    Dessert
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Offerings</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="offering-alcohol" />
                  <Label htmlFor="offering-alcohol" className="text-sm">
                    Alcohol
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="offering-cocktails" />
                  <Label htmlFor="offering-cocktails" className="text-sm">
                    Cocktails
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="offering-wine" />
                  <Label htmlFor="offering-wine" className="text-sm">
                    Wine
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="offering-small-plates" />
                  <Label htmlFor="offering-small-plates" className="text-sm">
                    Small Plates
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Atmosphere</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="atmosphere-cozy" />
                  <Label htmlFor="atmosphere-cozy" className="text-sm">
                    Cozy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="atmosphere-trendy" />
                  <Label htmlFor="atmosphere-trendy" className="text-sm">
                    Trendy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="atmosphere-upscale" />
                  <Label htmlFor="atmosphere-upscale" className="text-sm">
                    Upscale
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Accessibility</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="accessibility-entrance" />
                  <Label htmlFor="accessibility-entrance" className="text-sm">
                    Wheelchair accessible entrance
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="accessibility-restroom" />
                  <Label htmlFor="accessibility-restroom" className="text-sm">
                    Wheelchair accessible restroom
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="accessibility-seating" />
                  <Label htmlFor="accessibility-seating" className="text-sm">
                    Wheelchair accessible seating
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
