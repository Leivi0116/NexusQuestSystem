import { type NextRequest, NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

const GOOGLE_SHEET_ID = "1D0pv0tieTAb3lyKqY9853FEI0BXdr0YvpOrze8qiVu8"

const serviceAccountAuth = new JWT({
  email: "rr-nexus-talent-database@voltaic-tuner-466715-v9.iam.gserviceaccount.com",
  key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBVT0EWv7gvMB2
3D5/JGo+HLLWmoHaazFFN9s2VAJluZc9CZGtznmvVJ0HbMLB/UAQW0BbLPLCnzXK
H571ZCTOn3mQxjzd5RzfOPPDs4owz9ET9TocIpl8bMfwLKzg5xHAK1B+82EwuUG5
xmBQ6PGa9xMWhlve+fKkehnECcn+vfMdqj/oihp8wIGRRh9UsRaFi3x8Y8OO5WUo
uzhFlGZ+0RFYDfx1iOd/tGX5FLtVzgn9GjUYUc7WfKB0tNXQZ2dc9PeRVADyqKHm
rZYFaFVjJAQeCZlb54TCOOeyXM0whgqtBoipi7e5BGvVPYo28Cgra433V8pVRxRP
vJYoBd5JAgMBAAECggEAAcUeAeQzYStZN71cdR2IO3lXyc8wUSeaE+AnCaBLRVMl
p1FnHAg/5PMJXQAJ6GzBIWU0eaE3t8BtZaRUeDqqe5nKKyElfYKTeRe0Y55JLZk5
eM1N8uP+M71rNy+xhX2YFAJRglgIE8Ieb+z5BMSdMaYBbrtcK/Zt2kOj6L+OMd7X
PZnLsyn3pbRlIdCeN2Ll9XYTw5AH63gm4uVnaCk4lIWKiop08DkvJ7GLMQbk49Nd
QLqgrgCD66PkAKQ+5Za178oPo0wbmXYiVdLb3Oj3tXM/gIp7LB42qRAL43Xm4oQu
xJAvOVbKorafXbFSzJjYmtsF33xbLYyyqv6/ty+tgQKBgQDug/BM48gLWWW7EVFx
P3Cf1AfeelUBs6T8eqLyIU1vmydVYv8/fVYrmT0C5XeJpsX34YxdIAHyRnMjqYEs
zIqPqJNLsbvp6HbTJJTqHi7hk8JY8Ve0AeoWuo/vQPmyKX7kZixAoSy42kQ+MYKw
z56fP4dVO92GTTOEfGOAoQaAPQKBgQDPgWQPn1p1rZOXehbMzRii6dGZ5SHAXO17
3A0NJ2wx4Q0e6K9jFE5OTJF2dbX56PMhbYZqeYI9xrsiHQQSC7XKsPgaOifrtB8e
/VH6gi093y/E3VeQnapTCDY3zMiBP77r7o2SeduX0/lRWFenF0GpebQfxMQ4+nne
dpVeFp3K/QKBgQCzja+AspkNsibbRJZC4rcuGrgxy3Xi6hHx34B7NobM1cguh3AP
o5MTDzDW1Ve/0ESH7stz73yHnnFfD2OnDfPhYc5A1XPZCp8pJAjWlhJEzq8ntceI
Q0iuA5QHUKqobISR/DikDrFUFzv4dd0kraeDypdemsqRJ9z4h4uAcbgrIQKBgAJB
HZ0t1gXBRQE4SlcfQ01BzQ0m+B7m442c7mdeLka8czAKxx0Ec3VWT55B2SBF755F
Wlh9yXRyXEYampi3l9oD4i4mw5hD9LKZffKCx4sMibBR10my7M7KIAyrJOKClshp
ZxBYUpJrsyG3G/ysvAHjWJmfwaH81qYcE7NZ+4zhAoGBAOUN+Z/bx8z2WjjnFnLQ
+JK/dd7hsHPyobfq+qxlqMvrDmWn4KshQemAC+NAYwfzzDBsy3/RA9KWs6bL7Q+V
fanK9p54XulaI3zzu8Mt/4uafxbV+STyVCF5H5aEvQlZcrUh2GRWZILVnuwy+w05
OGoBGi1s7gN50aJG/5XxcQDR
-----END PRIVATE KEY-----`,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
})

// Helper function to find a column name regardless of case
function findColumnName(headers: string[], possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    const foundHeader = headers.find((header) => header.toLowerCase() === name.toLowerCase())
    if (foundHeader) return foundHeader
  }
  return null
}

// Helper function to check if a value represents "completed"
function isCompleted(value: any): boolean {
  if (!value) return false

  const stringValue = String(value).trim().toLowerCase()
  return ["1", "true", "yes", "done", "Cleared", "complete", "completed", "finished"].includes(stringValue)
}

export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json()

    if (!searchTerm) {
      return NextResponse.json({ error: "Search term is required" }, { status: 400 })
    }

    console.log(`Searching for user with term: ${searchTerm}`)

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth)
    await doc.loadInfo()
    console.log(`Loaded Google Sheet: ${doc.title}`)

    // Get the first sheet (assuming data is in the first sheet)
    const sheet = doc.sheetsByIndex[0]
    await sheet.loadHeaderRow()

    const headers = sheet.headerValues
    console.log(`Sheet headers: ${headers.join(", ")}`)

    // Find the column names for UID and IGN
    const uidColumn = findColumnName(headers, ["UID", "uid", "Id", "ID", "user_id", "userId"])
    const ignColumn = findColumnName(headers, ["IGN", "ign", "InGameName", "in_game_name", "gameName"])

    if (!uidColumn && !ignColumn) {
      console.error("Could not find UID or IGN columns in the sheet")
      return NextResponse.json({ error: "Sheet structure not compatible" }, { status: 500 })
    }

    // Get all rows
    const rows = await sheet.getRows()
    console.log(`Loaded ${rows.length} rows from sheet`)

    // Search for user by UID or IGN
    const user = rows.find((row) => {
      if (uidColumn && String(row.get(uidColumn)).toLowerCase() === searchTerm.toLowerCase()) return true
      if (ignColumn && String(row.get(ignColumn)).toLowerCase() === searchTerm.toLowerCase()) return true
      return false
    })

    if (!user) {
      console.log(`User not found with search term: ${searchTerm}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }


    // Find column names for profile data
    const nameColumn = findColumnName(headers, ["Name", "name", "FullName", "full_name", "userName", "user_name"])
    const levelColumn = findColumnName(headers, ["Level", "level", "userLevel", "user_level"])
    const usernameColumn = findColumnName(headers, ["Username", "username", "user", "handle", "nick", "nickname"])
    const profilePictureColumn = findColumnName(headers, [
      "ProfilePicture",
      "profile_picture",
      "profilePic",
      "profile_pic",
      "avatar",
      "Avatar",
      "picture",
      "Picture",
      "photo",
      "Photo",
      "image",
      "Image",
    ])

    // Extract quest status for 60 quests - try multiple possible column naming patterns
    const quests = []
    const questPatterns = [
      
      // Try Quest1, Quest2, etc.
      (i: "Cleared") => `Quest ${i}`,
      // Try quest1, quest2, etc.
      (i: number) => `quest${i}`,
      // Try Q1, Q2, etc.
      (i: number) => `Q${i}`,
      // Try q1, q2, etc.
      (i: number) => `q${i}`,
      // Try task1, task2, etc.
      (i: number) => `task${i}`,
      // Try Task1, Task2, etc.
      (i: number) => `Task${i}`,
      // Try mission1, mission2, etc.
      (i: number) => `mission${i}`,
      // Try Mission1, Mission2, etc.
      (i: number) => `Mission${i}`,
    ]

    // Debug all column values for this user
    console.log("All user data:")
    headers.forEach((header) => {
      console.log(`${header}: ${user.get(header)}`)
    })

    // Try to find quest columns using different patterns for 60 quests
    for (let i = 1; i <= 60; i++) {
      let questValue = null

      // Try each pattern until we find a matching column
      for (const pattern of questPatterns) {
        const columnName = pattern(i)
        if (headers.some((h) => h.toLowerCase() === columnName.toLowerCase())) {
          const actualColumn = headers.find((h) => h.toLowerCase() === columnName.toLowerCase())
          if (actualColumn) {
            questValue = user.get(actualColumn)
            console.log(`Found quest ${i} in column ${actualColumn}: ${questValue}`)
            break
          }
        }
      }

      // If we couldn't find a column with any pattern, default to false
      quests.push(isCompleted(questValue))
    }

    const userProfile = {
      uid: user.get(uidColumn || "") || searchTerm,
      ign: user.get(ignColumn || "") || searchTerm,
      name: user.get(nameColumn || "") || "Unknown",
      level: user.get(levelColumn || "") || "N/A",
      username: user.get(usernameColumn || "") || "Unknown",
      profilePicture: user.get(profilePictureColumn || "") || null,
      quests: quests,
    }

    console.log("Returning user profile:", userProfile)
    return NextResponse.json(userProfile)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
