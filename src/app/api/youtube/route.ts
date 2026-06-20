import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "carbon offset travel";

    const apiKey = process.env.GOOGLE_YOUTUBE_API_KEY;
    
    if (apiKey) {
      try {
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
        const res = await fetch(youtubeUrl);
        const data = await res.json();
        
        if (res.ok && data.items && data.items.length > 0) {
          const videos = data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channelTitle: item.snippet.channelTitle
          }));
          
          return NextResponse.json({
            success: true,
            simulated: false,
            videos
          });
        } else {
          console.warn("YouTube API returned empty or error:", data);
        }
      } catch (err: any) {
        console.warn("YouTube API call failed, using mock data:", err.message);
      }
    }

    // Curated high-quality, contextual fallback videos based on query keywords
    const lowerQuery = query.toLowerCase();
    let fallbackVideos = [
      {
        id: "Y7iG1eZ8Vks",
        title: "How to Ride the Delhi Metro: A Beginner's Guide",
        description: "A complete walkthrough of buying tickets, smartcards, and navigating the Delhi Metro lines.",
        thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=480&q=80",
        channelTitle: "Metro Guides India"
      },
      {
        id: "2-z8tSg4Zrc",
        title: "Delhi Metro Magenta Line Driverless Train Experience",
        description: "Inside India's first driverless metro trains running on the Magenta line route.",
        thumbnail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=480&q=80",
        channelTitle: "Tech & Travel India"
      },
      {
        id: "vB4s7P8_990",
        title: "DTC CNG and Electric Bus Travel: Delhi Transit Guide",
        description: "Checking out the latest zero-emission electric buses introduced by DTC in NCR.",
        thumbnail: "https://images.unsplash.com/photo-1570129476815-ba368ac77013?w=480&q=80",
        channelTitle: "Clean Energy India"
      }
    ];

    if (lowerQuery.includes("mumbai") || lowerQuery.includes("best")) {
      fallbackVideos = [
        {
          id: "m8-u2c8_099",
          title: "Mumbai Metro Line 2A & 7 Full Guide & Ride",
          description: "Navigating the newly opened Metro routes in suburban Mumbai (Dahisar to Andheri).",
          thumbnail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=480&q=80",
          channelTitle: "Mumbai Explorer"
        },
        {
          id: "b2-uC81Vksy",
          title: "Traveling in Mumbai BEST Electric Double Decker Buses",
          description: "A fun ride on the iconic electric double-decker bus routes introduced by BEST Mumbai.",
          thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=480&q=80",
          channelTitle: "Transport Vlog"
        },
        {
          id: "t8-z8tXg4Z1",
          title: "Mumbai Local Train vs Metro: Which is Better?",
          description: "A comprehensive travel time and cost comparison of Suburban railways and the new Metro.",
          thumbnail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=480&q=80",
          channelTitle: "Transit India"
        }
      ];
    } else if (lowerQuery.includes("ola") || lowerQuery.includes("electric") || lowerQuery.includes("bike")) {
      fallbackVideos = [
        {
          id: "3-X1gSgZ12c",
          title: "Ola S1 Pro Gen 2 Detailed Electric Scooter Review",
          description: "Testing range, top speed, and features of the Gen 2 Ola Electric scooter.",
          thumbnail: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=480&q=80",
          channelTitle: "EV India"
        },
        {
          id: "o8-u8cS12_o",
          title: "10 Days Commuting on an Electric Scooter: Savings Report",
          description: "Calculated range cost and carbon footprint savings by switching from petrol scooter to EV.",
          thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=480&q=80",
          channelTitle: "EcoCommuter"
        }
      ];
    } else if (lowerQuery.includes("walk") || lowerQuery.includes("foot")) {
      fallbackVideos = [
        {
          id: "w7-u8c21Zks",
          title: "The Health & Carbon Benefits of Walking 10k Steps Daily",
          description: "How active walking impacts cardiovascular health and reduces your weekly carbon footprint.",
          thumbnail: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=480&q=80",
          channelTitle: "Fit & Green"
        },
        {
          id: "f8-z8tX14Zc",
          title: "Walking in Delhi: Pedestrian Challenges & Walks",
          description: "Exploring historical walk routes in Connaught Place and Lodhi Gardens.",
          thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=480&q=80",
          channelTitle: "India Walks"
        }
      ];
    }

    return NextResponse.json({
      success: true,
      simulated: true,
      videos: fallbackVideos
    });
  } catch (error: any) {
    console.error("YouTube Route API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
