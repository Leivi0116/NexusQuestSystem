"use client"

import { useState } from "react"
import Image from "next/image"
import ProfileHeader from "@/components/profile-header"
import "../styles/style.css"
import { DiscAlbum } from "lucide-react"
interface UserProfile {
  uid: string
  ign: string
  name: string
  level: string
  username: string
  profilePicture?: string | null
  quests: boolean[]
}

// Only the first 10 quests are active, rest are "Coming Soon"
const questList = [
  // Level 1 (Quests 1-10) - Active
  // <div><img src="" alt="" /></div>,
  "Onboarding experience",
  "Hangout at nexus stronghold",
  "Collaborate with other nexus creators and do five games of wild rift while livestreaming together",
  "Post a reel about a day in a life with wild rift",
  "Post a reel about why wild rift",
  "Connect your social media to your gank account",
  "Utilize at least 2 features on gank (membership, commission, shop, tipping, ppv)",
  "Promote your gank profile in your other social media accounts 10 times",
  "(within the program period)",
  "Create 4 posts (photo/video) for your membership tier get 2 unique membership (min. of $10 per membership)",

  // Level 2 (Quests 11-20) - Coming Soon
  ...Array(10).fill("Coming Soon - Level 2 Quest"),

  // Level 3 (Quests 21-30) - Coming Soon
  ...Array(10).fill("Coming Soon - Level 3 Quest"),

  // Level 4 (Quests 31-40) - Coming Soon
  ...Array(10).fill("Coming Soon - Level 4 Quest"),

  // Level 5 (Quests 41-50) - Coming Soon
  ...Array(10).fill("Coming Soon - Level 5 Quest"),

  // Level 6 (Quests 51-60) - Coming Soon
  ...Array(10).fill("Coming Soon - Level 6 Quest"),
]

const QUESTS_PER_PAGE = 10
const TOTAL_PAGES = 6

export default function QuestSystem() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a UID or IGN")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/search-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchTerm: searchTerm.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "User not found")
      }

      setUserProfile(data)
      setCurrentPage(1) // Reset to first page when new user is loaded
    } catch (err: any) {
      setError(err.message || "User not found")
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  // Check if a page/level is unlocked
  const isPageUnlocked = (page: number): boolean => {
    if (!userProfile) return false
    if (page === 1) return true // Page 1 is always unlocked

    // Check if previous page is completed (all 10 quests)
    const previousPageStart = (page - 2) * QUESTS_PER_PAGE
    const previousPageEnd = previousPageStart + QUESTS_PER_PAGE
    const previousPageQuests = userProfile.quests.slice(previousPageStart, previousPageEnd)

    return previousPageQuests.every((quest) => quest === true)
  }

  // Get quests for current page
  const getCurrentPageQuests = () => {
    const startIndex = (currentPage - 1) * QUESTS_PER_PAGE
    const endIndex = startIndex + QUESTS_PER_PAGE
    return questList.slice(startIndex, endIndex)
  }

  // Get quest completion status for current page
  const getCurrentPageQuestStatus = () => {
    if (!userProfile) return Array(QUESTS_PER_PAGE).fill(false)
    const startIndex = (currentPage - 1) * QUESTS_PER_PAGE
    const endIndex = startIndex + QUESTS_PER_PAGE
    return userProfile.quests.slice(startIndex, endIndex)
  }

  // Calculate overall progress
  const getOverallProgress = () => {
    if (!userProfile) return { completed: 0, total: 60, percentage: 0 }
    const completed = userProfile.quests.filter(Boolean).length
    return {
      completed,
      total: 60,
      percentage: Math.round((completed / 60) * 100),
    }
  }

  // Calculate page progress
  const getPageProgress = (page: number) => {
    if (!userProfile) return { completed: 0, total: 10, percentage: 0 }
    const startIndex = (page - 1) * QUESTS_PER_PAGE
    const endIndex = startIndex + QUESTS_PER_PAGE
    const pageQuests = userProfile.quests.slice(startIndex, endIndex)
    const completed = pageQuests.filter(Boolean).length
    return {
      completed,
      total: 10,
      percentage: Math.round((completed / 10) * 100),
    }
  }

  const overallProgress = getOverallProgress()
  const currentPageQuests = getCurrentPageQuests()
  const currentPageQuestStatus = getCurrentPageQuestStatus()
  const currentPageProgress = getPageProgress(currentPage)

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">

      {/* Search Section */}
      <div className="bg-transparent rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Search User</h2>
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            placeholder="Enter UID or IGN to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-[#FF4E58] text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
      </div>

      {/* User Profile */}
      {userProfile && (
        <div className="space-y-6">
          {/* Gaming Style Profile Header */}
          <ProfileHeader
            name={userProfile.name}
            level={userProfile.level}
            ign={userProfile.username}
            profilePicture={userProfile.profilePicture}
          />

          {/* Level Navigation */}
          

          {/* Current Page Quests */}
          <div className="h-[192vh] questCard p-6 bg-[url('/body.png')] bg-contain  border">
            {isPageUnlocked(currentPage) ? (
              <div className="space-y-3 my-[170px] mx-[40px] [&>*:nth-child(6)]:pt-[320px]">
                {currentPageQuests.map((quest, index) => {
                  const questNumber = (currentPage - 1) * QUESTS_PER_PAGE + index + 1
                  const isCompleted = currentPageQuestStatus[index]
                  const isComingSoon = quest.includes("Coming Soon")

                  return (
                    
                    <div
                      key={index}
                      className={`flex items-start gap-4 p-4 align-center transition-all duration-200  ${
                        isComingSoon
                          ? ""
                          : isCompleted
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1 items-center">
                        {isCompleted && !isComingSoon ? (
                          <div className="w-10 h-10 flex items-center justify-center">
                            <Image
                              src="/checkmark.png"
                              alt="Completed"
                              width={40}
                              height={40}
                              className=""
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                         
                        </div>
                        <p className={`text-xl ${isComingSoon ? "text-white italic" : "text-white uppercase"}`}>{quest}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Level {currentPage} is Locked</h3>
                <p className="text-gray-600 mb-4">
                  Complete all quests in Level {currentPage - 1} to unlock this level
                </p>
                <div className="inline-block px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                  Coming Soon
                </div>
              </div>
            )}
          </div>


          <div className="bg-[#673CA4] shadow-sm p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: TOTAL_PAGES }, (_, i) => {
                const page = i + 1
                const pageProgress = getPageProgress(page)
                const unlocked = isPageUnlocked(page)
                const isActive = page === currentPage

                return (
                  <button
                    key={page}
                    onClick={() => unlocked && setCurrentPage(page)}
                    disabled={!unlocked}
                    className={`p-4  border-2 transition-all duration-200 ${
                      isActive
                        ? "bg-[#FF4E58] text-white border-blue-600 shadow-lg"
                        : unlocked
                          ? "bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-gray-700"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg">Level {page}</div>
                      <div className="text-sm mt-1">
                        {unlocked ? (
                          <>
                            <div>{pageProgress.completed}/10</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isActive ? "bg-white" : "bg-blue-500"
                                }`}
                                style={{ width: `${pageProgress.percentage}%` }}
                              ></div>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs">
                            Locked
                            <br />
                            <span className="text-gray-400">Coming Soon</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

 
    </div>
  )
}
