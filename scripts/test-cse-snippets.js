import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCSESnippets() {
  console.log("🔍 Testing CSE Review Snippets...")

  try {
    // First, let's check if the table exists and has data
    console.log("\n1. Checking if cse_review_snippets table has data...")
    const {
      data: allCSE,
      error: cseError,
      count,
    } = await supabase.from("cse_review_snippets").select("*", { count: "exact" }).limit(5)

    if (cseError) {
      console.error("❌ Error querying cse_review_snippets:", cseError)
      return
    }

    console.log(`✅ Found ${count} total CSE review snippets in database`)
    console.log("📄 Sample CSE snippets:")
    allCSE?.forEach((snippet, index) => {
      console.log(`   ${index + 1}. Restaurant ID: ${snippet.restaurant_id}`)
      console.log(`      Publication: ${snippet.publication_cse || "N/A"}`)
      console.log(`      Domain: ${snippet.domain_cse || "N/A"}`)
      console.log(`      Snippet: ${snippet.review_snippet_cse?.substring(0, 100) || "N/A"}...`)
      console.log(`      URL: ${snippet.review_url_cse || "N/A"}`)
      console.log("")
    })

    // Now let's test a specific restaurant
    console.log("\n2. Testing restaurant with CSE snippets...")
    const { data: restaurants, error: restError } = await supabase.from("restaurants").select("id, name").limit(10)

    if (restError) {
      console.error("❌ Error querying restaurants:", restError)
      return
    }

    console.log(`✅ Found ${restaurants?.length} restaurants to test`)

    // Test each restaurant for CSE snippets
    for (const restaurant of restaurants || []) {
      const { data: restaurantWithReviews, error: joinError } = await supabase
        .from("restaurants")
        .select(`
          id,
          name,
          cse_review_snippets (
            id,
            publication_cse,
            domain_cse,
            review_snippet_cse,
            review_url_cse,
            reviewer_name_cse,
            stars_cse
          )
        `)
        .eq("id", restaurant.id)
        .single()

      if (joinError) {
        console.error(`❌ Error joining CSE snippets for ${restaurant.name}:`, joinError)
        continue
      }

      const cseCount = restaurantWithReviews?.cse_review_snippets?.length || 0
      if (cseCount > 0) {
        console.log(`✅ ${restaurant.name} has ${cseCount} CSE review snippets`)
        console.log("   Sample snippet:", restaurantWithReviews.cse_review_snippets[0])

        // Test the exact query we use in the app
        console.log("\n3. Testing app query format...")
        const { data: appFormatData, error: appError } = await supabase
          .from("restaurants")
          .select(`
            *,
            google_user_reviews (*),
            critic_reviews (*),
            cse_review_snippets (*)
          `)
          .eq("id", restaurant.id)
          .single()

        if (appError) {
          console.error("❌ App format query error:", appError)
        } else {
          console.log(`✅ App format query successful`)
          console.log(`   CSE snippets found: ${appFormatData?.cse_review_snippets?.length || 0}`)
          console.log(`   Critic reviews found: ${appFormatData?.critic_reviews?.length || 0}`)
          console.log(`   Google reviews found: ${appFormatData?.google_user_reviews?.length || 0}`)
        }

        break // Found one with data, that's enough for testing
      } else {
        console.log(`⚠️  ${restaurant.name} has no CSE review snippets`)
      }
    }

    // Check for any restaurants that should have CSE snippets
    console.log("\n4. Finding restaurants with CSE snippets...")
    const { data: restaurantsWithCSE, error: withCSEError } = await supabase
      .from("restaurants")
      .select(`
        id,
        name,
        cse_review_snippets!inner (
          id
        )
      `)
      .limit(5)

    if (withCSEError) {
      console.error("❌ Error finding restaurants with CSE:", withCSEError)
    } else {
      console.log(`✅ Found ${restaurantsWithCSE?.length || 0} restaurants with CSE snippets:`)
      restaurantsWithCSE?.forEach((restaurant) => {
        console.log(`   - ${restaurant.name} (ID: ${restaurant.id})`)
      })
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

testCSESnippets()
