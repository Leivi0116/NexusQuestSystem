import Image from "next/image"
import "../styles/profile.css"

interface ProfileHeaderProps {
  name: string
  level: string
  ign: string
  profilePicture?: string | null

}

export default function ProfileHeader({ name, level, ign, profilePicture, }: ProfileHeaderProps) {
  return (
    <div className="relative w-full h-48  overflow-hidden profileHeader">
      {/* Main Content */}
      <div className="relative z-10 flex items-center h-full p-6">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-33 h-44 overflow-hidden border-4 aspect-square border-black">
            {profilePicture ? (
              <Image
                src={profilePicture || "/placeholder.svg"}
                alt={`${name}'s profile`}
                width={150}
                height={150}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to default avatar if image fails to load
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=128&width=128&text=Avatar"
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">{name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          {/* Level Badge */}
          <div className="absolute bottom-[27px] -right-[320px] text-black px-3 py-1 text-[70px] font-[900]">
            {level}
          </div>
        </div>

        {/* User Info */}
        <div className="ml-6 flex-1">
          <div className="mb-2">
              <h1 className="text-4xl font-bol mb-1 tracking-wide absolute top-[20px] left-[215px] font-bold ">{name}</h1>
            <div className="flex items-center gap-4 text-white">
              <span className="text-[30px] absolute top-[139px] left-[330px]"> : {ign}</span>
            </div>
          </div>

      
        </div>

      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400"></div>
    </div>
  )
}
