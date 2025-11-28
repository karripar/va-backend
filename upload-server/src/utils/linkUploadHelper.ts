export const platformInstructions = {
  google_drive: {
    name: "Google Drive",
    icon: "📁",
    instructions: [
      "1. Open your file in Google Drive",
      "2. Click the 'Share' button",
      "3. Change access to 'Anyone with the link'",
      "4. Click 'Copy link'",
      "5. Paste the link here"
    ],
    urlPattern: "https://drive.google.com/file/d/...",
    sharingDocs: "https://support.google.com/drive/answer/2494822"
  },
  onedrive: {
    name: "OneDrive",
    icon: "☁️",
    instructions: [
      "1. Right-click your file in OneDrive",
      "2. Click 'Share'",
      "3. Click 'Copy link'",
      "4. Make sure it's set to 'Anyone with the link can view'",
      "5. Paste the link here"
    ],
    urlPattern: "https://1drv.ms/... or https://onedrive.live.com/...",
    sharingDocs: "https://support.microsoft.com/en-us/office/share-onedrive-files-and-folders-9fcc2f7d-de0c-4cec-93b0-a82024800c07"
  },
  dropbox: {
    name: "Dropbox",
    icon: "📦",
    instructions: [
      "1. Right-click your file in Dropbox",
      "2. Click 'Share'",
      "3. Click 'Create link'",
      "4. Click 'Copy link'",
      "5. Paste the link here"
    ],
    urlPattern: "https://www.dropbox.com/...",
    sharingDocs: "https://help.dropbox.com/share/view-only-access"
  },
  icloud: {
    name: "iCloud",
    icon: "☁️",
    instructions: [
      "1. Select your file in iCloud",
      "2. Click the share icon",
      "3. Click 'Copy Link'",
      "4. Paste the link here"
    ],
    urlPattern: "https://www.icloud.com/...",
    sharingDocs: "https://support.apple.com/guide/icloud/share-files-and-folders-mm9945d1f9f7/icloud"
  },
  other_url: {
    name: "Other URL",
    icon: "🔗",
    instructions: [
      "Make sure the URL is:",
      "- Publicly accessible",
      "- A direct link to the document",
      "- From a trusted source",
      "- Not password protected"
    ],
    urlPattern: "https://...",
    sharingDocs: null
  }
};

export const platformPatterns: Record<string, RegExp> = {
  google_drive: /drive\.google\.com\/(file\/d\/|open\?id=)/,
  onedrive: /1drv\.ms\/|onedrive\.live\.com/,
  dropbox: /dropbox\.com\//,
  icloud: /icloud\.com/,
  other_url: /^https?:\/\/.+/
};
